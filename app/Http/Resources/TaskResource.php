<?php

namespace App\Http\Resources;

use App\Http\Resources\Api\V1\UserResource;
use App\Http\Resources\Api\V1\TaskAttachmentResource;
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
            'priority' => $this->priority, // <-- PERUBAHAN: Menambahkan baris ini
            'due_date' => $this->due_date?->format('Y-m-d'),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            
            'user' => UserResource::make($this->whenLoaded('user')),
            
            'collaborators' => $this->whenLoaded('collaborators', function () {
                return $this->collaborators->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'permission' => $user->pivot->permission,
                        'profile_photo_url' => $user->profile_photo_url,
                    ];
                });
            }),

            // Sertakan data lampiran
            'attachments' => TaskAttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}
