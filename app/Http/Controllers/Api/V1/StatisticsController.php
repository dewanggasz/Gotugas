<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

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

        // Tentukan rentang tanggal berdasarkan input
        if ($period === 'custom') {
            $request->validate(['start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date']);
            $startDate = Carbon::parse($request->input('start_date'));
            $endDate = Carbon::parse($request->input('end_date'));
        } elseif ($period === 'this_year') {
            $startDate = $endDate->copy()->startOfYear();
        } elseif ($period === '90d') {
            $startDate = $endDate->copy()->subDays(89);
        } else { // default to 30d
            $startDate = $endDate->copy()->subDays(29);
        }

        // Query dasar yang akan digunakan oleh semua statistik
        $baseQuery = Task::query();
        if (!$user->isAdmin()) {
            $baseQuery->where(function (Builder $q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('collaborators', fn(Builder $subQ) => $subQ->where('users.id', $user->id));
            });
        }

        return response()->json([
            'summary' => $this->getSummaryData(clone $baseQuery, $startDate, $endDate),
            'trend' => $this->getTrendData(clone $baseQuery, $startDate, $endDate, $period),
            'status_composition' => $this->getStatusCompositionData(clone $baseQuery, $startDate, $endDate),
            'performance' => $user->isAdmin() ? $this->getPerformanceData($startDate, $endDate) : [],
        ]);
    }

    private function getSummaryData(Builder $query, Carbon $startDate, Carbon $endDate): array
    {
        // Query yang sudah difilter berdasarkan rentang tanggal pembuatan
        $periodQuery = (clone $query)->whereBetween('created_at', [$startDate, $endDate]);

        $createdInPeriod = (clone $periodQuery)->count();

        $completedInPeriod = (clone $periodQuery)
            ->where('status', 'completed')
            ->count();
        
        $cancelledInPeriod = (clone $periodQuery)
            ->where('status', 'cancelled')
            ->count();
        
        // --- PERBAIKAN: Hitung 'in_progress' berdasarkan periode juga ---
        $inProgressInPeriod = (clone $periodQuery)
            ->where('status', 'in_progress')
            ->count();
            
        // Overdue tetap dihitung dari semua tugas, bukan hanya periode ini
        $overdue = (clone $query)
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now())
            ->count();

        return [
            'created_in_period' => $createdInPeriod,
            'completed_in_period' => $completedInPeriod,
            'cancelled_in_period' => $cancelledInPeriod,
            'in_progress_in_period' => $inProgressInPeriod, // <-- Kirim data baru
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

    private function getPerformanceData(Carbon $startDate, Carbon $endDate): Collection
    {
        return User::where('role', 'employee')
            ->withCount(['createdTasks' => function (Builder $query) use ($startDate, $endDate) {
                $query->where('status', 'completed')
                      ->whereBetween('updated_at', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'Tugas Selesai' => $user->created_tasks_count,
                ];
            });
    }
}
