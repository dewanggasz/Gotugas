<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // Tambahkan callback 'then' untuk mendaftarkan rate limiter
        then: function () {
            RateLimiter::for('api', function (Request $request) {
                // Aturan: 60 request per menit per pengguna (jika login) atau per alamat IP (jika tamu)
                return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
            });
            RateLimiter::for('uploads', function (Request $request) {
                return Limit::perMinute(10)->by($request->user()->id);
            });
            RateLimiter::for('login', function (Request $request) {
                // Batasi 5 kali per menit berdasarkan alamat IP
                return Limit::perMinute(5)->by($request->ip());
            });
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Middleware untuk grup 'api' sudah benar dan tidak perlu diubah.
        $middleware->api([
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withProviders([
        \App\Providers\AuthServiceProvider::class,
        \App\Providers\EventServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
