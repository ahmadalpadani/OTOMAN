<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InspectionController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'vehicle_type' => ['required', Rule::in(['mobil','motor'])],
            'brand' => ['required','string','max:50'],
            'model' => ['required','string','max:100'],
            'year' => ['required','integer','min:1990','max:' . date('Y')],
            'mileage' => ['required','integer','min:0'],
            'condition' => ['required', Rule::in(['excellent','good','fair','poor'])],
            'notes' => ['nullable','string'],

            'inspection_date' => ['required','date','after_or_equal:' . now()->addDays(2)->toDateString()],
            'inspection_time' => ['required','string','max:20'],

            'province' => ['required','string','max:50'],
            'city' => ['required','string','max:80'],
            'address' => ['required','string','max:500'],
            'contact_phone' => ['required','string','max:20'],
        ]);

        // Generate order code: INS- + 6 chars
        $orderCode = $this->generateOrderCode();

        $inspection = Inspection::create([
            'user_id' => $user->id,
            'order_code' => $orderCode,
            ...$validated,
            'price' => 350000,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pesanan inspeksi berhasil dibuat',
            'data' => $inspection,
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $items = Inspection::where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'OK',
            'data' => $items,
        ]);
    }

    private function generateOrderCode(): string
    {
        // Loop kecil untuk jaga-jaga collision (jarang banget, tapi manusia suka sial)
        do {
            $code = 'INS-' . Str::upper(Str::random(6));
        } while (Inspection::where('order_code', $code)->exists());

        return $code;
    }
}