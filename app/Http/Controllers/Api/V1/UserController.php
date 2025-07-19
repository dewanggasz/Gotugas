<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource; // <-- PERBAIKAN: Menambahkan 'use' statement yang hilang
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * Mengembalikan daftar semua pengguna untuk dropdown filter statistik.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $loggedInUser */
    $loggedInUser = $request->user();
        // Cek apakah permintaan ini untuk paginasi (dari UserManagementPage)
        if ($request->has('page')) {
            if (!$request->user()->hasAdminPrivileges()) {
                abort(403, 'Akses ditolak.');
            }
            
            $query = User::query();

            // Fitur Filter berdasarkan Peran
            if ($request->filled('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

             if ($request->filled('jabatan')) {
                $query->where('jabatan', 'like', '%' . $request->jabatan . '%');
            }

            // Fitur Sort
            $sortBy = $request->input('sort_by', 'name_asc');
            match ($sortBy) {
                'name_desc' => $query->orderBy('name', 'desc'),
                'email_asc' => $query->orderBy('email', 'asc'),
                'email_desc' => $query->orderBy('email', 'desc'),
                'jabatan_asc' => $query->orderBy('jabatan', 'asc'),
                'jabatan_desc' => $query->orderBy('jabatan', 'desc'),
                default => $query->orderBy('name', 'asc'), // default: name_asc
            };

            $perPage = $request->input('per_page', 10);
            $users = $query->paginate($perPage);

        } else {
        // ▼▼▼ SEDERHANAKAN BLOK LOGIKA INI ▼▼▼
        // Logika untuk dropdown filter statistik
        $query = User::query();

        // Jika pengguna yang login memiliki hak akses admin (baik admin maupun semi_admin)
        if ($loggedInUser->hasAdminPrivileges()) {
            // Tampilkan semua employee DAN semi_admin di dalam filter
            $query->whereIn('role', ['employee', 'semi_admin']);
        }
        
        $users = $query->orderBy('name')->get();
    }


        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasAdminPrivileges()) {
            abort(403, 'Hanya admin yang dapat membuat pengguna baru.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'semi_admin', 'employee'])],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'jabatan' => $validated['jabatan'], // <-- TAMBAHKAN DATA
        ]);

        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(Request $request, User $user)
    {
        if (!$request->user()->hasAdminPrivileges()) {
            abort(403, 'Hanya admin yang dapat memperbarui pengguna.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'semi_admin', 'employee'])],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'jabatan' => $validated['jabatan'],
        ]);

        // --- PERUBAHAN DI SINI: Logika Pengecekan Password ---
        if (!empty($validated['password'])) {
            // Cek apakah password baru sama dengan yang lama
            if (Hash::check($validated['password'], $user->password)) {
                // Jika sama, kirim error validasi
                throw ValidationException::withMessages([
                    'password' => ['Password baru tidak boleh sama dengan password yang lama.'],
                ]);
            }
            // Jika berbeda, hash dan perbarui password
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();

        return new UserResource($user);
    }

    public function show(Request $request, User $user)
    {
        // Otorisasi: Hanya admin yang bisa melihat detail pengguna
        if (!$request->user()->hasAdminPrivileges()) {
            abort(403, 'Akses ditolak.');
        }
        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     * Menghapus pengguna.
     */
    public function destroy(Request $request, User $user)
    {
        // Otorisasi: Hanya admin yang bisa menghapus pengguna
        if (!$request->user()->hasAdminPrivileges()) {
            abort(403, 'Hanya admin yang dapat menghapus pengguna.');
        }

        // Tambahkan logika untuk mencegah admin menghapus dirinya sendiri
        if ($request->user()->id === $user->id) {
            abort(403, 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return response()->noContent(); // Standar HTTP 204 untuk penghapusan yang berhasil
    }
}
