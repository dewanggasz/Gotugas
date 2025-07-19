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
        $endDate = now();

        if ($period === 'custom') {
            $request->validate(['start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date']);
            $startDate = Carbon::parse($request->input('start_date'));
            $endDate = Carbon::parse($request->input('end_date'));
        } elseif ($period === 'this_year') {
            $startDate = $endDate->copy()->startOfYear();
        } elseif ($period === '90d') {
            $startDate = $endDate->copy()->subDays(89);
        } elseif ($period === '7d') {
        $startDate = $endDate->copy()->subDays(6);
        } else { // default to 30d
            $startDate = $endDate->copy()->subDays(29);
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
            'mood_trend' => $this->getMoodTrendData($user, $startDate, $endDate),
            'individual_mood' => $individualMoodData,
            'overall_mood' => $this->getOverallMoodSummary($user, $startDate, $endDate),
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

    private function getTrendData(Builder $query, Carbon $startDate, Carbon $endDate, string $period): Collection
    {
        $data = new Collection();
        $query->whereBetween('created_at', [$startDate, $endDate]);

        if ($period === 'this_year') {
            $tasks = $query->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
                ->groupBy('month')->pluck('count', 'month');
            
            $currentDate = $startDate->copy();
            while ($currentDate <= $endDate) {
                $monthKey = $currentDate->format('Y-m');
                $data->push(['name' => $currentDate->format('M'), 'Tugas Dibuat' => $tasks->get($monthKey, 0)]);
                $currentDate->addMonthNoOverflow();
            }
        } else {
            $tasks = $query->select(DB::raw("DATE(created_at) as date"), DB::raw('COUNT(*) as count'))
                ->groupBy('date')->pluck('count', 'date');
            
            $dateRange = Carbon::parse($startDate)->toPeriod($endDate);
            foreach($dateRange as $date) {
                $dateKey = $date->format('Y-m-d');
                $data->push(['name' => $date->format('d M'), 'Tugas Dibuat' => $tasks->get($dateKey, 0)]);
            }
        }
        return $data;
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

    // --- Ubah signature method ini untuk menerima $selectedUserId ---
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
                $query->whereBetween('created_at', [$startDate, $endDate]);
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
    private function getMoodTrendData($user, Carbon $startDate, Carbon $endDate): Collection
    {
        $moodScoreCase = "CASE journals.mood 
            WHEN 'joyful' THEN 5 
            WHEN 'excited' THEN 4 
            WHEN 'happy' THEN 3 
            WHEN 'neutral' THEN 2 
            WHEN 'sad' THEN 1 
            ELSE 0 END";

        $query = Journal::query()
            ->whereBetween('entry_date', [$startDate, $endDate])
            ->join('users', 'journals.user_id', '=', 'users.id')
            ->select(
                'entry_date',
                DB::raw("AVG($moodScoreCase) as avg_score")
            );

        if ($user->hasAdminPrivileges()) {
            $query->whereIn('users.role', ['employee', 'semi_admin']);
        } else {
            $query->where('journals.user_id', $user->id);
        }
        
        $actualData = $query->groupBy('entry_date')
                            ->orderBy('entry_date')
                            ->get()
                            ->keyBy(fn($item) => Carbon::parse($item->entry_date)->format('Y-m-d'));

        $period = CarbonPeriod::create($startDate, $endDate);
        $trendData = new Collection();

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $trendData->push([
                'name' => $date->format('d M'),
                'score' => $actualData->has($dateString) ? (float) $actualData->get($dateString)->avg_score : null,
            ]);
        }

        return $trendData;
    }
}
