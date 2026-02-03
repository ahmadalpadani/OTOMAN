<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::middleware(['auth', 'admin'])->get('/admin/dashboard', function () {
    return response()->json(['message' => 'Welcome Admin']);
});

Route::get('/admin/test', function () {
    return 'ADMIN ACCESS OK';
})->middleware(['auth', 'admin']);
