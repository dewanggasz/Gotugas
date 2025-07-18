<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class JournalController extends Controller
{
    /**
     * Mengambil semua entri jurnal untuk pengguna yang sedang login.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $journals = $user->journals()
            ->orderBy('entry_date', 'desc')
            ->get();

        return response()->json($journals);
    }

    /**
     * Mengambil atau membuat entri jurnal untuk tanggal tertentu.
     */
    public function showByDate(string $date)
    {
        try {
            $entryDate = Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Format tanggal tidak valid.'], 400);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $journal = $user->journals()->firstOrCreate(
            ['entry_date' => $entryDate]
        );

        return response()->json($journal);
    }

    /**
     * Membuat atau memperbarui entri jurnal.
     */
    public function storeOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'entry_date' => 'required|date_format:Y-m-d',
            'content' => 'nullable|string',
            'mood' => 'nullable|string|in:sad,neutral,happy,excited,joyful',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $journal = $user->journals()->updateOrCreate(
            ['entry_date' => $validated['entry_date']],
            [
                'content' => $validated['content'] ?? '',
                'mood' => $validated['mood'] ?? null,
            ]
        );

        return response()->json($journal);
    }
}
