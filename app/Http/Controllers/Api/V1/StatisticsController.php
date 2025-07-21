<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Carbon\CarbonPeriod;

class StatisticsController extends Controller
{
    /**
     * Menyediakan semua data untuk dasbor statistik.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $period = $request->input('period', '30d');
        $endDate = now()->endOfDay(); // Pastikan akhir hari

        if ($period === 'custom') {
            $request->validate(['start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date']);
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        } elseif ($period === 'this_year') {
            $startDate = $endDate->copy()->startOfYear();
        } elseif ($period === '90d') {
            $startDate = $endDate->copy()->subDays(89)->startOfDay();
        } elseif ($period === '7d') {
            $startDate = $endDate->copy()->subDays(6)->startOfDay();
        } else { // default to 30d
            $startDate = $endDate->copy()->subDays(29)->startOfDay();
        }

        $baseQuery = Task::query();
        $selectedUserId = $request->input('user_id');

        if ($user->hasAdminPrivileges() && $selectedUserId) {
            $baseQuery->where(function ($q) use ($selectedUserId) {
                $q->where('user_id', $selectedUserId)
                ->orWhereHas('collaborators', fn($subQ) => $subQ->where('users.id', $selectedUserId));
            });
        } elseif ($user->hasAdminPrivileges() && !$selectedUserId) {
            $baseQuery->whereHas('user', function ($query) {
                $query->where('role', '!=', 'admin');
            });
        } elseif (!$user->hasAdminPrivileges()) {
            $baseQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                ->orWhereHas('collaborators', fn($subQ) => $subQ->where('users.id', $user->id));
            });
        }

        $individualMoodData = null;
        if ($selectedUserId && $period !== 'custom') {
            $individualMoodData = $this->getIndividualMoodSummary($selectedUserId, $startDate, $endDate);
        }
        
        $performanceData = [];
        if ($user->hasAdminPrivileges()) {
            $performanceData = $this->getPerformanceData($startDate, $endDate, $selectedUserId);
        }

        return response()->json([
            'summary' => $this->getSummaryData(clone $baseQuery, $startDate, $endDate),
            'trend' => $this->getTrendData(clone $baseQuery, $startDate, $endDate, $period),
            'status_composition' => $this->getStatusCompositionData(clone $baseQuery, $startDate, $endDate),
            'performance' => $performanceData,
            'mood_trend' => $this->getMoodTrendData($user, $startDate, $endDate, $period),
            'individual_mood' => $individualMoodData,
            'overall_mood' => $this->getOverallMoodSummary($user, $startDate, $endDate),
            'kpi_data' => $this->getKpiData($user, $startDate, $endDate, $selectedUserId),
        ]);
    }

    private function getSummaryData(Builder $query, Carbon $startDate, Carbon $endDate): array
    {
        $periodQuery = (clone $query)->whereBetween('created_at', [$startDate, $endDate]);
        $createdInPeriod = (clone $periodQuery)->count();
        $completedInPeriod = (clone $periodQuery)->where('status', 'completed')->count();
        $cancelledInPeriod = (clone $periodQuery)->where('status', 'cancelled')->count();
        $inProgressInPeriod = (clone $periodQuery)->where('status', 'in_progress')->count();
        $overdue = (clone $query)->where('status', '!=', 'completed')->whereNotNull('due_date')->whereDate('due_date', '<', now())->count();

        return [
            'created_in_period' => $createdInPeriod,
            'completed_in_period' => $completedInPeriod,
            'cancelled_in_period' => $cancelledInPeriod,
            'in_progress_in_period' => $inProgressInPeriod,
            'overdue' => $overdue,
        ];
    }

    /**
     * --- LOGIKA BARU UNTUK GRAFIK TUGAS DINAMIS ---
     * Mengelompokkan data tren pembuatan tugas berdasarkan rentang waktu.
     */
    private function getTrendData(Builder $query, Carbon $startDate, Carbon $endDate, string $period): Collection
    {
        $daysDifference = $startDate->diffInDays($endDate);

        $groupByFormat = '';
        $periodIteratorInterval = '';

        if ($period === 'this_year' || ($period === 'custom' && $daysDifference > 90)) {
            $groupByFormat = '%Y-%m';
            $periodIteratorInterval = '1 month';
        } elseif ($period === '90d' || ($period === 'custom' && $daysDifference > 31)) {
            $groupByFormat = '%x-%v';
            $periodIteratorInterval = '1 week';
        } else {
            $groupByFormat = '%Y-%m-%d';
            $periodIteratorInterval = '1 day';
        }

        $actualData = $query->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$groupByFormat}') as period_key"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period_key')
            ->orderBy('period_key')
            ->pluck('count', 'period_key');

        $trendData = new Collection();
        $periodIterator = CarbonPeriod::create($startDate, $periodIteratorInterval, $endDate);

        foreach ($periodIterator as $date) {
            $key = '';
            $label = '';
            if ($periodIteratorInterval === '1 month') {
                $key = $date->format('Y-m');
                $label = $date->isoFormat('MMM YYYY');
            } elseif ($periodIteratorInterval === '1 week') {
                $key = $date->format('o-W'); // ISO-8601 format Tahun-Minggu
                $label = 'Minggu ' . $date->format('W');
            } else {
                $key = $date->format('Y-m-d');
                $label = $date->format('d M');
            }

            $trendData->push([
                'name' => $label,
                'Tugas Dibuat' => $actualData->get($key, 0),
            ]);
        }

        return $trendData;
    }

    private function getStatusCompositionData(Builder $query, Carbon $startDate, Carbon $endDate): Collection
    {
        $statusCounts = $query->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')->pluck('total', 'status');

        return collect([
            'not_started' => ['name' => 'Belum Dimulai', 'value' => 0, 'fill' => '#9ca3af'],
            'in_progress' => ['name' => 'Dikerjakan', 'value' => 0, 'fill' => '#3b82f6'],
            'completed' => ['name' => 'Selesai', 'value' => 0, 'fill' => '#22c55e'],
            'cancelled' => ['name' => 'Dibatalkan', 'value' => 0, 'fill' => '#ef4444'],
        ])->map(function ($item, $key) use ($statusCounts) {
            $item['value'] = $statusCounts->get($key, 0);
            return $item;
        })->values();
    }

    private function getOverallMoodSummary($user, Carbon $startDate, Carbon $endDate): ?array
    {
        $moodScoreCase = "CASE mood WHEN 'joyful' THEN 5 WHEN 'excited' THEN 4 WHEN 'happy' THEN 3 WHEN 'neutral' THEN 2 WHEN 'sad' THEN 1 ELSE 0 END";

        $query = Journal::query()
            ->whereBetween('entry_date', [$startDate, $endDate])
            ->whereNotNull('mood');

        if ($user->hasAdminPrivileges()) {
            $query->join('users', 'journals.user_id', '=', 'users.id')
                ->whereIn('users.role', ['employee', 'semi_admin']);
        } else {
            $query->where('user_id', $user->id);
        }
        
        $averageScore = $query->select(DB::raw("AVG($moodScoreCase) as avg_score"))
                            ->value('avg_score');

        if ($averageScore === null) {
            return null;
        }

        return [
            'average_score' => (float) $averageScore,
        ];
    }

    private function getIndividualMoodSummary($userId, Carbon $startDate, Carbon $endDate): ?array
    {
        $moodScoreCase = "CASE mood 
            WHEN 'joyful' THEN 5 
            WHEN 'excited' THEN 4 
            WHEN 'happy' THEN 3 
            WHEN 'neutral' THEN 2 
            WHEN 'sad' THEN 1 
            ELSE 0 END";

        $averageScore = Journal::query()
            ->where('user_id', $userId)
            ->whereBetween('entry_date', [$startDate, $endDate])
            ->whereNotNull('mood') // Hanya hitung entri yang memiliki mood
            ->select(DB::raw("AVG($moodScoreCase) as avg_score"))
            ->value('avg_score');

        if ($averageScore === null) {
            return null;
        }

        return [
            'user_id' => $userId,
            'average_score' => (float) $averageScore,
        ];
    }

    private function getPerformanceData(Carbon $startDate, Carbon $endDate, ?string $selectedUserId): Collection
    {
        $query = User::query();
        
        if ($selectedUserId) {
            $query->where('id', $selectedUserId);
        } else {
            $query->whereIn('role', ['employee', 'semi_admin']);
        }

        return $query->with([
            'createdTasks' => function ($query) use ($startDate, $endDate) {
                $query->select(['id', 'user_id', 'status', 'due_date', 'updated_at'])
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }
        ])->get()->map(function ($user) {
            $tasksInPeriod = $user->createdTasks;
            $completed = $tasksInPeriod->where('status', 'completed')->count();
            $cancelled = $tasksInPeriod->where('status', 'cancelled')->count();
            $overdue = $tasksInPeriod->whereNotIn('status', ['completed', 'cancelled'])->where('due_date', '<', now())->count();
            $inProgressOnTime = $tasksInPeriod->where('status', 'in_progress')->where(fn($q) => $q->where('due_date', '>=', now())->orWhereNull('due_date'))->count();
            $notStartedOnTime = $tasksInPeriod->where('status', 'not_started')->where(fn($q) => $q->where('due_date', '>=', now())->orWhereNull('due_date'))->count();

            return [
                'name' => $user->name,
                'Selesai' => $completed,
                'Dikerjakan' => $inProgressOnTime,
                'Belum Dimulai' => $notStartedOnTime,
                'Terlambat' => $overdue,
                'Dibatalkan' => $cancelled,
            ];
        });
    }

    private function getMoodTrendData($user, Carbon $startDate, Carbon $endDate, string $period): Collection
    {
        $daysDifference = $startDate->diffInDays($endDate);

        $groupByFormat = '';
        $periodIteratorInterval = '';

        if ($period === 'this_year' || ($period === 'custom' && $daysDifference > 90)) {
            $groupByFormat = '%Y-%m';
            $periodIteratorInterval = '1 month';
        } elseif ($period === '90d' || ($period === 'custom' && $daysDifference > 31)) {
            $groupByFormat = '%x-%v';
            $periodIteratorInterval = '1 week';
        } else {
            $groupByFormat = '%Y-%m-%d';
            $periodIteratorInterval = '1 day';
        }

        $moodScoreCase = "CASE journals.mood WHEN 'joyful' THEN 5 WHEN 'excited' THEN 4 WHEN 'happy' THEN 3 WHEN 'neutral' THEN 2 WHEN 'sad' THEN 1 ELSE 0 END";

        $query = Journal::query()
            ->whereBetween('entry_date', [$startDate, $endDate])
            ->join('users', 'journals.user_id', '=', 'users.id')
            ->select(
                DB::raw("DATE_FORMAT(entry_date, '{$groupByFormat}') as period_key"),
                DB::raw("AVG($moodScoreCase) as avg_score")
            );

        if ($user->hasAdminPrivileges()) {
            $query->whereIn('users.role', ['employee', 'semi_admin']);
        } else {
            $query->where('journals.user_id', $user->id);
        }
        
        $actualData = $query->groupBy('period_key')
                            ->orderBy('period_key')
                            ->get()
                            ->keyBy('period_key');

        $trendData = new Collection();
        $periodIterator = CarbonPeriod::create($startDate, $periodIteratorInterval, $endDate);

        foreach ($periodIterator as $date) {
            $key = '';
            $label = '';
            if ($periodIteratorInterval === '1 month') {
                $key = $date->format('Y-m');
                $label = $date->isoFormat('MMM YYYY');
            } elseif ($periodIteratorInterval === '1 week') {
                $key = $date->format('o-W');
                $label = 'Minggu ' . $date->format('W');
            } else {
                $key = $date->format('Y-m-d');
                $label = $date->format('d M');
            }
            
            $trendData->push([
                'name' => $label,
                'score' => $actualData->has($key) ? (float) $actualData->get($key)->avg_score : null,
            ]);
        }

        return $trendData;
    }
    
     private function getKpiData($loggedInUser, Carbon $startDate, Carbon $endDate, ?string $selectedUserId): Collection
    {
        $usersQuery = User::select(['id', 'name', 'profile_photo_path', 'jabatan', 'role'])
            ->whereIn('role', ['employee', 'semi_admin']);

        if ($selectedUserId) {
            $usersQuery->where('id', $selectedUserId);
        }

        $users = $usersQuery->get();
        $userIds = $users->pluck('id');

        $basePointsCase = "CASE priority WHEN 'high' THEN 10 WHEN 'medium' THEN 5 WHEN 'low' THEN 2 ELSE 0 END";

        $timelinessMultiplierCase = "
            CASE 
                WHEN status = 'completed' AND (updated_at <= due_date OR due_date IS NULL) THEN 1.0
                WHEN status = 'completed' AND updated_at > due_date THEN 0.5
                WHEN status != 'completed' AND status != 'cancelled' AND due_date < NOW() THEN -1.0
                ELSE 0.0
            END
        ";
        
        $tasksWithScores = DB::table('tasks')
            ->select(
                'id',
                'priority',
                'status',
                'updated_at',
                'due_date',
                DB::raw("($basePointsCase) as base_points"),
                DB::raw("($basePointsCase * $timelinessMultiplierCase) as actual_score_contribution")
            )
            ->whereBetween('created_at', [$startDate, $endDate]);

        $kpiResults = DB::table('task_user')
            ->joinSub($tasksWithScores, 'tasks_with_scores', function ($join) {
                $join->on('task_user.task_id', '=', 'tasks_with_scores.id');
            })
            ->select(
                'task_user.user_id',
                DB::raw('SUM(tasks_with_scores.base_points) as max_possible_score'),
                DB::raw('SUM(tasks_with_scores.actual_score_contribution) as actual_score')
            )
            ->whereIn('task_user.user_id', $userIds)
            ->groupBy('task_user.user_id')
            ->get()
            ->keyBy('user_id');

        return $users->map(function ($user) use ($kpiResults) {
            $userKpi = $kpiResults->get($user->id);

            $maxPossibleScore = $userKpi->max_possible_score ?? 0;
            $actualScore = $userKpi->actual_score ?? 0;

            if ($maxPossibleScore > 0) {
                $efficiencyScore = ($actualScore / $maxPossibleScore) * 100;
            } else {
                $efficiencyScore = 0;
            }

            $finalScore = round(max(0, min(100, $efficiencyScore)));

            return [
                'id' => $user->id,
                'name' => $user->name,
                'profile_photo_url' => $user->profile_photo_url,
                'jabatan' => $user->jabatan,
                'efficiency_score' => $finalScore,
                'stats' => [
                    'actual_score' => round($actualScore, 2),
                    'max_possible_score' => $maxPossibleScore
                ]
            ];
        })->sortByDesc('efficiency_score')->values();
    }
}
