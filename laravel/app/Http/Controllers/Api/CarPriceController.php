<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class CarPriceController extends Controller
{
    public function formOptions(): JsonResponse
    {
        try {
            $response = Http::timeout(10)
                ->acceptJson()
                ->get('http://ml-service:8000/form-options');

            if (!$response->successful()) {
                throw new \Exception('ML service unavailable');
            }

            return response()->json([
                'success' => true,
                'data' => $response->json(),
            ]);
        } catch (\Throwable $e) {
            // Fallback: return hardcoded options
            return response()->json([
                'success' => true,
                'data' => [
                    'brands' => [
                        'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
                        'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
                        'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz',
                        'Nissan', 'Porsche', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
                    ],
                    'models_by_brand' => [
                        'Toyota' => ['4Runner', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra'],
                        'Honda' => ['Accord', 'Civic', 'CR-V', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
                        'Ford' => ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Fusion', 'Maverick', 'Mustang', 'Ranger'],
                        'BMW' => ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M5'],
                        'Mercedes-Benz' => ['A-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class'],
                        'Nissan' => ['Altima', 'Armada', 'Frontier', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Versa', 'Z'],
                        'Audi' => ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
                        'Chevrolet' => ['Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Traverse', 'Trax'],
                        'Hyundai' => ['Elantra', 'Ioniq', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'],
                        'Kia' => ['Carnival', 'Forte', 'K5', 'Niro', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Telluride'],
                        'Tesla' => ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
                        'Lexus' => ['ES', 'GX', 'IS', 'LS', 'LX', 'NX', 'RX', 'UX'],
                        'Subaru' => ['Ascent', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
                        'Mazda' => ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
                        'Volkswagen' => ['Arteon', 'Atlas', 'Golf', 'Jetta', 'Passat', 'Taos', 'Tiguan'],
                        'Porsche' => ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
                    ],
                    'fuel_types' => ['Gasoline', 'Diesel', 'Electric', 'Hybrid'],
                    'usd_to_idr' => 16905,
                ],
            ]);
        }
    }

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
            // Fallback: simple estimation if ML service is down
            $basePrice = $this->estimateBasePrice($validated);
            $yearFactor = pow(0.88, (date('Y') - (int)$validated['model_year']));
            $mileageFactor = max(0.6, 1 - ((float)$validated['milage'] / 500000));
            $accidentFactor = $validated['accident'] === 'Yes' ? 0.85 : 1.0;
            $cleanFactor = $validated['clean_title'] === 'Yes' ? 1.0 : 0.9;

            $estimatedPrice = (int)($basePrice * $yearFactor * $mileageFactor * $accidentFactor * $cleanFactor);

            return response()->json([
                'success' => true,
                'message' => 'Prediksi harga (fallback - ML service unavailable).',
                'data' => [
                    'predicted_price' => $estimatedPrice,
                    'price_low' => (int)($estimatedPrice * 0.92),
                    'price_high' => (int)($estimatedPrice * 1.08),
                    'currency' => 'IDR',
                    'fallback' => true,
                ],
            ]);
        }
    }

    private function estimateBasePrice(array $data): int
    {
        $brand = strtolower($data['brand']);
        $transmission = $data['transmission'];

        // Base price per brand tier (in IDR)
        $brandTiers = [
            'toyota' => 300000000, 'honda' => 280000000, 'nissan' => 260000000,
            'ford' => 270000000, 'chevrolet' => 250000000, 'hyundai' => 240000000,
            'kia' => 230000000, 'mazda' => 250000000, 'subaru' => 260000000,
            'volkswagen' => 270000000, 'bmw' => 500000000, 'mercedes-benz' => 550000000,
            'audi' => 480000000, 'lexus' => 520000000, 'porsche' => 700000000,
            'tesla' => 600000000, 'jeep' => 300000000, 'dodge' => 280000000,
        ];

        $base = $brandTiers[$brand] ?? 250000000;

        // Transmission adjustment
        if ($transmission === 'Automatic') $base = (int)($base * 1.05);

        return $base;
    }
}