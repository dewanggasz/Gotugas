<?php

namespace App\Http\Resources;

use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            
            // Sertakan data pembuat (user)
            'user' => UserResource::make($this->whenLoaded('user')),
            
            // Sertakan daftar kolaborator beserta izin mereka
            'collaborators' => $this->whenLoaded('collaborators', function () {
                return $this->collaborators->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'permission' => $user->pivot->permission, // Ambil data izin dari tabel pivot
                    ];
                });
            }),
        ];
    }
}
