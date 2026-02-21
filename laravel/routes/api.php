<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InspectionController;

// ---------------- AUTH ----------------
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// ---------------- INSPECTIONS (PROTECTED) ----------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('inspections', [InspectionController::class, 'store']);
    Route::get('inspections', [InspectionController::class, 'index']);
});

// ---------------- CORS PREFLIGHT (OPTIONS) ----------------
// Letakkan paling bawah biar tidak “nelen” route lain
Route::options('{any}', function () {
    return response()->json([], 204);
})->where('any', '.*');