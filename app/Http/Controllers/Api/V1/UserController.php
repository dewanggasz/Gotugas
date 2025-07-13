<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * Mengembalikan daftar semua pengguna untuk dropdown "Assign To".
     */
    public function index()
    {
        // Ambil semua pengguna, diurutkan berdasarkan nama
        $users = User::orderBy('name')->get();

        return UserResource::collection($users);
    }
}
