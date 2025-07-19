<?php

use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\StatisticsController;
use App\Http\Controllers\Api\V1\TaskCommentController;
use App\Http\Controllers\Api\V1\JournalController;
use App\Http\Controllers\Api\V1\TaskAttachmentController;
use App\Http\Resources\Api\V1\UserResource;
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
})->middleware('throttle:login');


// Grup rute dengan prefix v1 dan middleware sanctum untuk otentikasi
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    // Rute Pengguna & Profil
   Route::get('/user', function (Request $request) {
        // Gunakan UserResource untuk memastikan 'role' disertakan
        return new UserResource($request->user());
    });
    Route::apiResource('users', UserController::class);
    Route::post('user/photo', [ProfileController::class, 'updatePhoto']);
    Route::put('user/profile', [ProfileController::class, 'updateProfile']);
    Route::put('user/password', [ProfileController::class, 'updatePassword']);

    // Rute Statistik
    Route::get('statistics', [StatisticsController::class, 'index']);

    // --- RUTE UNTUK JURNAL PRIBADI ---
    Route::prefix('journals')->group(function () {
        Route::get('/month/{year}/{month}', [JournalController::class, 'getMonthData']);
        Route::get('/day/{date}', [JournalController::class, 'getDayDetails']);
        Route::post('/mood', [JournalController::class, 'updateMood']);
        Route::post('/notes', [JournalController::class, 'addNote']);
        Route::put('/notes/{note}', [JournalController::class, 'updateNote']);
        Route::delete('/notes/{note}', [JournalController::class, 'deleteNote']);
    });

    // Rute Tugas & Aktivitas
    Route::get('tasks/summary', [TaskController::class, 'summary']);
    Route::get('tasks/{task}/activities', [TaskController::class, 'activities']);
    Route::post('tasks/{task}/updates', [TaskController::class, 'postUpdate']); // Pastikan ini ada jika Anda menggunakannya
    Route::apiResource('tasks', TaskController::class);

    Route::post('tasks/{task}/attachments', [TaskAttachmentController::class, 'store']);
    Route::delete('attachments/{attachment}', [TaskAttachmentController::class, 'destroy']);

    // --- RUTE BARU UNTUK KOMENTAR ---
    Route::get('tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store']);

    // Rute Logout
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    });
});
