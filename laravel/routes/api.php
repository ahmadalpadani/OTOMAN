<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InspectionController;
use App\Http\Controllers\Api\CarPriceController;
use App\Http\Controllers\Api\MarketplaceController;

// ADMIN
use App\Http\Controllers\Admin\InspectionController as AdminInspectionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;

// INSPECTOR
use App\Http\Controllers\Inspector\InspectionController as InspectorInspectionController;


// ---------------- AUTH ----------------
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});


// ---------------- USER INSPECTIONS ----------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('inspections', [InspectionController::class, 'store']);
    Route::get('inspections', [InspectionController::class, 'index']);
    Route::get('inspections/{id}', [InspectionController::class, 'show']);
    Route::get('inspections/{id}/report', [InspectionController::class, 'report']);
});


// ---------------- INSPECTOR ----------------
Route::middleware(['auth:sanctum', 'role:inspector'])->prefix('inspector')->group(function () {

    Route::get('/inspections', [InspectorInspectionController::class, 'index']);
    Route::get('/inspections/history', [InspectorInspectionController::class, 'history']);
    Route::get('/inspections/{id}', [InspectorInspectionController::class, 'show']);
    Route::put('/inspections/{id}/complete', [InspectorInspectionController::class, 'complete']);
    Route::get('/stats', [InspectorInspectionController::class, 'stats']);
});


// ---------------- ADMIN ----------------
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard stats
    Route::get('/stats', [DashboardController::class, 'stats']);

    // Inspections
    Route::get('/inspections', [AdminInspectionController::class, 'index']);
    Route::get('/inspections/{id}', [AdminInspectionController::class, 'show']);
    Route::post('/inspections/{id}/assign', [AdminInspectionController::class, 'assign']);
    Route::put('/inspections/{id}/status', [AdminInspectionController::class, 'updateStatus']);
    Route::get('/inspections/{id}/report', [AdminInspectionController::class, 'downloadReport']);

    Route::get('/mechanics', [UserController::class, 'mechanics']);

    // Reports
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/export', [ReportController::class, 'export']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
});


// ---------------- MARKETPLACE (PUBLIC) ----------------
Route::get('/marketplace/vehicles', [MarketplaceController::class, 'vehicles']);
Route::get('/marketplace/vehicles/{id}', [MarketplaceController::class, 'vehicleDetail']);

// ---------------- MARKETPLACE (AUTH USER) ----------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/marketplace/seller/listings', [MarketplaceController::class, 'sellerListings']);
    Route::post('/marketplace/seller/listings', [MarketplaceController::class, 'createListing']);
    Route::post('/marketplace/checkout', [MarketplaceController::class, 'checkout']);
});

// ---------------- PRICE PREDICTIONS ----------------
Route::get('/car-price/form-options', [CarPriceController::class, 'formOptions']);
Route::post('/car-price/predict', [CarPriceController::class, 'predict']);


// ---------------- CORS PREFLIGHT (OPTIONS) ----------------
// Letakkan paling bawah biar tidak “nelen” route lain
Route::options('{any}', function () {
    return response()->json([], 204);
})->where('any', '.*');