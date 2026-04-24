<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;
use Illuminate\Support\Facades\Auth;

class MarketplaceController extends Controller
{
    // GET /api/marketplace/vehicles
    public function vehicles(Request $request)
    {
        $limit = (int) $request->get('limit', 12);
        $brand = $request->get('brand');
        $search = $request->get('search');
        $sort = $request->get('sort', 'newest');

        $query = Inspection::where('status', 'completed')
            ->where('result', 'approve')
            ->whereNotNull('license_plate');

        if ($brand) {
            $query->where('brand', 'like', "%{$brand}%");
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('license_plate', 'like', "%{$search}%");
            });
        }

        // Sorting
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'year_desc':
                $query->orderBy('year', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $data = $query->paginate($limit);

        $vehicles = collect($data->items())->map(function ($insp) {
            $images = $insp->vehicle_images ? json_decode($insp->vehicle_images, true) : [];
            return [
                'id' => $insp->id,
                'order_code' => $insp->order_code,
                'vehicle_brand' => $insp->brand,
                'vehicle_model' => $insp->model,
                'vehicle_year' => $insp->year,
                'license_plate' => $insp->license_plate,
                'mileage' => $insp->mileage,
                'fuel_type' => 'Gasoline',
                'transmission' => 'Automatic',
                'color' => $insp->notes ?? '-',
                'location' => $insp->city ?? '-',
                'province' => $insp->province ?? '-',
                'price' => $insp->vehicle_price ?? $insp->price,
                'price_display' => 'Rp ' . number_format($insp->vehicle_price ?? $insp->price, 0, ',', '.'),
                'thumbnail_url' => $images[0] ?? null,
                'images' => $images,
                'inspection_summary' => [
                    'overall_result' => $insp->result,
                    'body_condition' => $insp->body_condition ?? 'good',
                    'engine_condition' => $insp->engine_condition ?? 'good',
                    'interior_condition' => $insp->interior_condition ?? 'fair',
                ],
                'listing_url' => "/marketplace-detail.html?id={$insp->id}",
                'created_at' => $insp->created_at?->toIso8601String(),
            ];
        });

        $allBrands = Inspection::where('status', 'completed')
            ->where('result', 'approve')
            ->whereNotNull('license_plate')
            ->distinct()
            ->pluck('brand')
            ->sort()
            ->values()
            ->toArray();

        return response()->json([
            'message' => 'OK',
            'data' => [
                'vehicles' => $vehicles,
                'pagination' => [
                    'current_page' => $data->currentPage(),
                    'total_pages' => $data->lastPage(),
                    'total' => $data->total(),
                    'per_page' => $data->perPage(),
                ],
                'filters' => [
                    'available_brands' => $allBrands,
                    'price_range' => [
                        'min' => 85000000,
                        'max' => 1200000000,
                    ],
                    'year_range' => [
                        'min' => 2015,
                        'max' => (int) date('Y'),
                    ],
                ],
            ],
        ]);
    }

    // GET /api/marketplace/vehicles/{id}
    public function vehicleDetail($id)
    {
        $insp = Inspection::with('user')->findOrFail($id);

        return response()->json([
            'message' => 'OK',
            'data' => [
                'id' => $insp->id,
                'order_code' => $insp->order_code,
                'vehicle' => [
                    'brand' => $insp->brand,
                    'model' => $insp->model,
                    'year' => $insp->year,
                    'license_plate' => $insp->license_plate,
                    'vin' => null,
                    'transmission' => 'Automatic',
                    'fuel_type' => 'Gasoline',
                    'color' => $insp->notes ?? '-',
                    'mileage' => $insp->mileage,
                    'machine_number' => null,
                    'chassis_number' => null,
                ],
                'location' => [
                    'city' => $insp->city ?? '-',
                    'province' => $insp->province ?? '-',
                    'full_address' => ($insp->address ?? '') . ', ' . ($insp->city ?? '') . ', ' . ($insp->province ?? ''),
                ],
                'price' => [
                    'vehicle_price' => $insp->vehicle_price ?? $insp->price,
                    'vehicle_price_display' => 'Rp ' . number_format($insp->vehicle_price ?? $insp->price, 0, ',', '.'),
                    'inspection_fee' => 350000,
                    'platform_fee' => 6500,
                    'total' => ($insp->vehicle_price ?? $insp->price) + 350000 + 6500,
                    'total_display' => 'Rp ' . number_format(($insp->vehicle_price ?? $insp->price) + 350000 + 6500, 0, ',', '.'),
                ],
                'images' => $insp->vehicle_images ? json_decode($insp->vehicle_images, true) : [],
                'seller' => [
                    'name' => $insp->user?->name ?? '-',
                    'phone' => $insp->contact_phone ?? '-',
                    'member_since' => $insp->user?->created_at?->format('Y-m-d') ?? '-',
                    'total_listings' => Inspection::where('user_id', $insp->user_id)
                        ->where('status', 'completed')
                        ->where('result', 'approve')
                        ->count(),
                    'verified' => true,
                ],
                'inspection_report' => [
                    'order_code' => $insp->order_code,
                    'inspection_date' => $insp->inspection_date?->format('Y-m-d'),
                    'completed_at' => $insp->completed_at?->toIso8601String(),
                    'inspector' => $insp->mechanic?->name ?? '-',
                    'overall_result' => $insp->result,
                    'result_label' => $insp->result === 'approve' ? 'Disetujui' : 'Ditolak',
                    'result_notes' => $insp->result_notes,
                    'categories' => [
                        'body' => [
                            'label' => 'Kondisi Body',
                            'condition' => $insp->body_condition ?? 'good',
                            'condition_label' => $this->conditionLabel($insp->body_condition),
                            'notes' => '-',
                            'score' => $this->conditionScore($insp->body_condition),
                        ],
                        'engine' => [
                            'label' => 'Kondisi Mesin',
                            'condition' => $insp->engine_condition ?? 'good',
                            'condition_label' => $this->conditionLabel($insp->engine_condition),
                            'notes' => '-',
                            'score' => $this->conditionScore($insp->engine_condition),
                        ],
                        'interior' => [
                            'label' => 'Kondisi Interior',
                            'condition' => $insp->interior_condition ?? 'fair',
                            'condition_label' => $this->conditionLabel($insp->interior_condition),
                            'notes' => '-',
                            'score' => $this->conditionScore($insp->interior_condition),
                        ],
                    ],
                    'overall_score' => $this->overallScore($insp),
                    'documents' => [],
                ],
                'checkout_url' => "/marketplace-checkout.html?id={$insp->id}",
                'related_vehicles' => [],
            ],
        ]);
    }

    // GET /api/marketplace/seller/listings
    public function sellerListings(Request $request)
    {
        $user = $request->user();

        $items = Inspection::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($insp) {
                $images = $insp->vehicle_images ? json_decode($insp->vehicle_images, true) : [];
                return [
                    'id' => $insp->id,
                    'order_code' => $insp->order_code,
                    'vehicle_brand' => $insp->brand,
                    'vehicle_model' => $insp->model,
                    'vehicle_year' => $insp->year,
                    'license_plate' => $insp->license_plate,
                    'mileage' => $insp->mileage,
                    'vehicle_price' => $insp->vehicle_price ?? null,
                    'thumbnail_url' => $images[0] ?? null,
                    'images' => $images,
                    'status' => $this->mapListingStatus($insp),
                    'inspection_result' => $insp->result,
                    'inspection_date' => $insp->inspection_date?->format('Y-m-d'),
                    'inspection_time' => $insp->inspection_time,
                    'province' => $insp->province,
                    'city' => $insp->city,
                    'contact_phone' => $insp->contact_phone,
                    'created_at' => $insp->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'message' => 'OK',
            'data' => $items,
        ]);
    }

    // POST /api/marketplace/seller/listings
    public function createListing(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'vehicle_brand' => 'required|string|max:50',
            'vehicle_model' => 'required|string|max:100',
            'vehicle_year' => 'required|integer|min:1990|max:' . date('Y'),
            'license_plate' => 'required|string|max:20',
            'mileage' => 'required|integer|min:0',
            'transmission' => 'required|string|in:Automatic,Manual,Tiptronic',
            'fuel_type' => 'required|string|in:Gasoline,Diesel,Electric,Hybrid',
            'inspection_date' => 'required|date|after_or_equal:' . now()->addDays(2)->toDateString(),
            'inspection_time' => 'required|string',
            'province' => 'required|string|max:50',
            'city' => 'required|string|max:80',
            'address' => 'required|string|max:500',
            'contact_phone' => 'required|string|max:20',
            'vehicle_price' => 'nullable|integer|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $orderCode = 'MKT-' . strtoupper(\Illuminate\Support\Str::random(6));

        // Handle image uploads
        $imageUrls = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = $orderCode . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('vehicles', $filename, 'public');
                $imageUrls[] = '/storage/' . $path;
            }
        }

        // For MVP: create an inspection record
        $inspection = \App\Models\Inspection::create([
            'user_id' => $user->id,
            'order_code' => $orderCode,
            'brand' => $validated['vehicle_brand'],
            'model' => $validated['vehicle_model'],
            'year' => $validated['vehicle_year'],
            'license_plate' => $validated['license_plate'],
            'mileage' => $validated['mileage'],
            'vehicle_type' => 'mobil',
            'condition' => 'good',
            'notes' => $request->input('notes') ?? null,
            'inspection_date' => $validated['inspection_date'],
            'inspection_time' => $validated['inspection_time'],
            'province' => $validated['province'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'contact_phone' => $validated['contact_phone'],
            'price' => 350000,
            'vehicle_price' => $validated['vehicle_price'] ?? null,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'vehicle_images' => count($imageUrls) ? json_encode($imageUrls) : null,
        ]);

        return response()->json([
            'message' => 'Listing berhasil dibuat',
            'data' => [
                'id' => $inspection->id,
                'order_code' => $inspection->order_code,
                'brand' => $inspection->brand,
                'model' => $inspection->model,
                'year' => $inspection->year,
                'license_plate' => $inspection->license_plate,
                'mileage' => $inspection->mileage,
                'vehicle_price' => $inspection->vehicle_price,
                'inspection_date' => $inspection->inspection_date,
                'inspection_time' => $inspection->inspection_time,
                'province' => $inspection->province,
                'city' => $inspection->city,
                'address' => $inspection->address,
                'contact_phone' => $inspection->contact_phone,
                'status' => 'pending',
                'vehicle_images' => $imageUrls,
                'created_at' => $inspection->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    // POST /api/marketplace/checkout
    public function checkout(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'vehicle_id' => 'required|integer|exists:inspections,id',
            'inspection_date' => 'required|date|after_or_equal:' . now()->addDays(2)->toDateString(),
            'inspection_time' => 'required|string',
            'contact_phone' => 'required|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $vehicle = Inspection::findOrFail($validated['vehicle_id']);

        return response()->json([
            'message' => 'Pesanan inspeksi berhasil dibuat',
            'data' => [
                'inspection_id' => $vehicle->id,
                'order_code' => $vehicle->order_code,
                'vehicle' => [
                    'brand' => $vehicle->brand,
                    'model' => $vehicle->model,
                    'year' => $vehicle->year,
                ],
                'price' => [
                    'inspection_fee' => 350000,
                    'platform_fee' => 6500,
                    'total' => 356500,
                    'total_display' => 'Rp 356.500',
                ],
                'payment_methods' => [
                    ['id' => 'bca_va', 'name' => 'BCA Virtual Account', 'code' => 'BCA'],
                    ['id' => 'bni_va', 'name' => 'BNI Virtual Account', 'code' => 'BNI'],
                    ['id' => 'bri_va', 'name' => 'BRI Virtual Account', 'code' => 'BRI'],
                    ['id' => 'mandiri_va', 'name' => 'Mandiri Virtual Account', 'code' => 'MANDIRI'],
                ],
                'payment_deadline' => now()->addDays(1)->toIso8601String(),
                'checkout_url' => "/marketplace-checkout.html?inspection_id={$vehicle->id}",
            ],
        ]);
    }

    // Helpers
    private function conditionLabel($cond)
    {
        return match ($cond) {
            'excellent' => 'Sangat Baik',
            'good' => 'Baik',
            'fair' => 'Cukup',
            'poor' => 'Kurang',
            default => '-',
        };
    }

    private function conditionScore($cond)
    {
        return match ($cond) {
            'excellent' => 95,
            'good' => 85,
            'fair' => 70,
            'poor' => 50,
            default => 0,
        };
    }

    private function overallScore($insp)
    {
        $scores = array_filter([
            $this->conditionScore($insp->body_condition),
            $this->conditionScore($insp->engine_condition),
            $this->conditionScore($insp->interior_condition),
        ]);
        return count($scores) ? (int) array_sum($scores) / count($scores) : 0;
    }

    private function mapListingStatus($insp)
    {
        if ($insp->status === 'pending') return 'pending';
        if ($insp->status === 'assigned' || $insp->status === 'in_progress') return 'in_progress';
        if ($insp->status === 'completed' && $insp->result === 'approve') return 'approved';
        if ($insp->status === 'completed' && $insp->result === 'reject') return 'rejected';
        return $insp->status;
    }
}