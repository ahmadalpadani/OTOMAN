<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class CarPriceController extends Controller
{
    public function predict(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'model_year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'milage' => 'required|numeric|min:0',
            'fuel_type' => 'required|string|max:50',
            'transmission' => 'required|string|in:Automatic,Manual,Other',
            'accident' => 'required|string|in:Yes,No',
            'clean_title' => 'required|string|in:Yes,No',
        ]);

        try {
            $response = Http::timeout(15)
                ->acceptJson()
                ->post('http://ml-service:8000/predict', [
                    'brand' => $validated['brand'],
                    'model' => $validated['model'],
                    'model_year' => (int) $validated['model_year'],
                    'milage' => (float) $validated['milage'],
                    'fuel_type' => $validated['fuel_type'],
                    'transmission' => $validated['transmission'],
                    'accident' => $validated['accident'],
                    'clean_title' => $validated['clean_title'],
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'ML service gagal memproses prediksi.',
                    'ml_status' => $response->status(),
                    'ml_response' => $response->json(),
                ], 500);
            }

            $result = $response->json();

            return response()->json([
                'success' => true,
                'message' => 'Prediksi harga berhasil dibuat.',
                'data' => [
                    'predicted_price' => $result['predicted_price'] ?? null,
                    'price_low' => $result['price_low'] ?? null,
                    'price_high' => $result['price_high'] ?? null,
                    'currency' => $result['currency'] ?? 'USD',
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat terhubung ke ML service.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}