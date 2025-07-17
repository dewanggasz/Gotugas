<?php

namespace App\Providers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Observers\TaskObserver;
use App\Observers\TaskCommentObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * Metode ini adalah tempat yang tepat untuk mendaftarkan observer.
     */
    public function boot(): void
    {
        // Mendaftarkan observer untuk model Task
        Task::observe(TaskObserver::class);

        // Mendaftarkan observer baru untuk model TaskComment
        TaskComment::observe(TaskCommentObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
