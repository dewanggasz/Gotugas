<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalNote;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests; // <-- Ditambahkan

class JournalController extends Controller
{
    use AuthorizesRequests; // <-- Ditambahkan

    /**
     * Mengambil data jurnal untuk satu bulan penuh (untuk tampilan kalender).
     */
    public function getMonthData(int $year, int $month)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $journals = $user->journals()
            ->whereBetween('entry_date', [$startDate, $endDate])
            ->withCount('notes') // Menghitung jumlah catatan untuk setiap hari
            ->get();

        return response()->json($journals);
    }

    /**
     * Mengambil detail lengkap (mood dan daftar catatan) untuk satu tanggal.
     */
    public function getDayDetails(string $date)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $entryDate = Carbon::parse($date)->format('Y-m-d');

        // Ambil atau buat entri jurnal harian (tanpa catatan)
        $journal = $user->journals()->firstOrCreate(
            ['entry_date' => $entryDate]
        );

        // Muat catatan yang terkait
        $journal->load('notes');

        return response()->json($journal);
    }

    /**
     * Memperbarui mood untuk satu hari.
     */
    public function updateMood(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $validated = $request->validate([
            'entry_date' => 'required|date_format:Y-m-d',
            'mood' => 'nullable|string|in:sad,neutral,happy,excited,joyful,angry',
        ]);

        $journal = $user->journals()->updateOrCreate(
            ['entry_date' => $validated['entry_date']],
            ['mood' => $validated['mood']]
        );

        return response()->json($journal);
    }

    /**
     * Menambahkan catatan baru ke tanggal tertentu.
     */
    public function addNote(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $validated = $request->validate([
            'entry_date' => 'required|date_format:Y-m-d',
            'content' => 'required|string',
        ]);

        // Pastikan entri jurnal harian ada
        $journal = $user->journals()->firstOrCreate(
            ['entry_date' => $validated['entry_date']]
        );

        // Buat catatan baru yang terhubung ke entri harian tersebut
        $note = $journal->notes()->create([
            'content' => $validated['content'],
        ]);

        return response()->json($note, 201);
    }

    /**
     * Memperbarui catatan yang sudah ada.
     */
    public function updateNote(Request $request, JournalNote $note)
    {
        // Otorisasi: Pastikan catatan ini milik pengguna yang sedang login
        $this->authorize('update', $note);

        $validated = $request->validate(['content' => 'required|string']);
        $note->update($validated);
        return response()->json($note);
    }

    /**
     * Menghapus catatan.
     */
    public function deleteNote(JournalNote $note)
    {
        $this->authorize('delete', $note);
        $note->delete();
        return response()->noContent();
    }
}
