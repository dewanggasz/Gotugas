<?php

use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\StatisticsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rute untuk login (di luar middleware auth)
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($credentials)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials do not match our records.'],
        ]);
    }

    /** @var \App\Models\User $user */
    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
});


// Grup rute dengan prefix v1 dan middleware sanctum untuk otentikasi
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    // Rute Pengguna & Profil
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('users', [UserController::class, 'index']);
    Route::post('user/photo', [ProfileController::class, 'updatePhoto']);
    Route::put('user/profile', [ProfileController::class, 'updateProfile']);
    Route::put('user/password', [ProfileController::class, 'updatePassword']);

    // Rute Statistik
    Route::get('statistics', [StatisticsController::class, 'index']);

    // Rute Tugas & Aktivitas
    Route::get('tasks/summary', [TaskController::class, 'summary']);
    Route::get('tasks/{task}/activities', [TaskController::class, 'activities']);
    Route::post('tasks/{task}/updates', [TaskController::class, 'postUpdate']); // Pastikan ini ada jika Anda menggunakannya
    Route::apiResource('tasks', TaskController::class);

    // Rute Logout
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    });
});
