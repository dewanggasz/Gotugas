<?php

namespace App\Providers;

use App\Models\Task; // <-- Tambahkan ini
use App\Policies\TaskPolicy; // <-- Tambahkan ini
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Task::class => TaskPolicy::class, // <-- Daftarkan di sini
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}