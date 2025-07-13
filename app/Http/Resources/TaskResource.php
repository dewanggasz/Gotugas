<?php

namespace App\Http\Resources;

// Ganti import ini untuk menunjuk ke UserResource yang benar
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
            
            // Sertakan data pembuat (user) dan yang ditugaskan (assignee)
            // whenLoaded() memastikan data hanya disertakan jika sudah dimuat (eager loaded)
            'user' => UserResource::make($this->whenLoaded('user')),
            'assignee' => UserResource::make($this->whenLoaded('assignee')),
        ];
    }
}
