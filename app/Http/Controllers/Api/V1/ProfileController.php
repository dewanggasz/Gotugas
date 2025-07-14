<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Update the user's profile photo.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            // Validasi: harus berupa file gambar, maks 2MB
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        // Hapus foto lama jika ada
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        // Simpan foto baru di dalam folder 'profile-photos'
        $path = $request->file('photo')->store('profile-photos', 'public');

        // Update path foto di database
        $user->update([
            'profile_photo_path' => $path,
        ]);

        return response()->json(['message' => 'Foto profil berhasil diperbarui.']);
    }
}
