<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource; // <-- PERBAIKAN: Menambahkan 'use' statement yang hilang
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * Mengembalikan daftar semua pengguna untuk dropdown filter statistik.
     */
    public function index()
    {
        // Ambil hanya pengguna dengan peran 'employee', lalu urutkan berdasarkan nama.
        // Ini memastikan admin tidak muncul di dalam daftar filternya sendiri.
        $users = User::where('role', 'employee')->orderBy('name')->get();

        return UserResource::collection($users);
    }
    

    public function store(Request $request)
    {
        // Otorisasi: Pastikan hanya admin yang bisa menjalankan fungsi ini
        if (!$request->user()->isAdmin()) {
            abort(403, 'Hanya admin yang dapat membuat pengguna baru.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,employee'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return new UserResource($user);
    }

    public function show(Request $request, User $user)
    {
        // Otorisasi: Hanya admin yang bisa melihat detail pengguna
        if (!$request->user()->isAdmin()) {
            abort(403, 'Akses ditolak.');
        }
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     * Memperbarui pengguna yang ada.
     */
    public function update(Request $request, User $user)
    {
        // Otorisasi: Hanya admin yang bisa memperbarui pengguna
        if (!$request->user()->isAdmin()) {
            abort(403, 'Hanya admin yang dapat memperbarui pengguna.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // Pastikan email unik, kecuali untuk pengguna saat ini
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'in:admin,employee'],
            // Password bersifat opsional saat pembaruan
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        // Perbarui password hanya jika diisi
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     * Menghapus pengguna.
     */
    public function destroy(Request $request, User $user)
    {
        // Otorisasi: Hanya admin yang bisa menghapus pengguna
        if (!$request->user()->isAdmin()) {
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
