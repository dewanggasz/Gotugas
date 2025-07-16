<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource; // <-- PERBAIKAN: Menambahkan 'use' statement yang hilang
use App\Models\User;
use Illuminate\Http\Request;

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
}
