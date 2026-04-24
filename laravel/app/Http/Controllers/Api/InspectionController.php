<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
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

            'payment_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,pdf', 'max:2048'],
        ]);

        // Generate order code: INS- + 6 chars
        $orderCode = $this->generateOrderCode();

        // Handle payment proof upload
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $file = $request->file('payment_proof');
            $filename = $orderCode . '_' . time() . '.' . $file->getClientOriginalExtension();
            $paymentProofPath = $file->storeAs('payment-proofs', $filename, 'public');
        }

        $inspection = Inspection::create([
            'user_id' => $user->id,
            'order_code' => $orderCode,
            'vehicle_type' => $validated['vehicle_type'],
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'mileage' => $validated['mileage'],
            'condition' => $validated['condition'],
            'notes' => $validated['notes'] ?? null,
            'inspection_date' => $validated['inspection_date'],
            'inspection_time' => $validated['inspection_time'],
            'province' => $validated['province'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'contact_phone' => $validated['contact_phone'],
            'price' => 350000,
            'status' => $paymentProofPath ? 'pending' : 'pending',
            'payment_proof_path' => $paymentProofPath,
            'payment_status' => $paymentProofPath ? 'paid' : 'unpaid',
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
            ->with('mechanic')
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'OK',
            'data' => $items,
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();

        $inspection = Inspection::with(['mechanic', 'user'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $arr = $inspection->toArray();
        $arr['vehicle_brand'] = $arr['brand'];
        $arr['vehicle_model'] = $arr['model'];

        return $arr;
    }

    public function report($id)
    {
        $user = auth()->user();

        $inspection = Inspection::with(['mechanic', 'user'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        if ($inspection->status !== 'completed') {
            abort(400, 'Laporan hanya tersedia untuk inspeksi yang sudah selesai');
        }

        // Format data for report
        $resultLabels = [
            'approve' => 'Disetujui',
            'pending' => 'Menunggu',
            'reject' => 'Ditolak'
        ];
        $conditionLabels = [
            'excellent' => 'Sangat Baik',
            'good' => 'Baik',
            'fair' => 'Cukup',
            'poor' => 'Kurang'
        ];

        $data = [
            'order_code' => $inspection->order_code,
            'inspection_date' => Carbon::parse($inspection->inspection_date)->format('d M Y'),
            'inspection_time' => $inspection->inspection_time,
            'scheduled_date' => $inspection->scheduled_date ? Carbon::parse($inspection->scheduled_date)->format('d M Y') : null,
            'scheduled_time' => $inspection->scheduled_time,
            'completed_at' => $inspection->completed_at ? Carbon::parse($inspection->completed_at)->format('d M Y H:i') : null,
            'user' => [
                'name' => $inspection->user->name,
                'email' => $inspection->user->email,
                'phone' => $inspection->contact_phone,
            ],
            'vehicle' => [
                'type' => $inspection->vehicle_type === 'mobil' ? 'Mobil' : 'Motor',
                'brand' => $inspection->brand,
                'model' => $inspection->model,
                'year' => $inspection->year,
                'license_plate' => $inspection->license_plate,
                'mileage' => $inspection->mileage,
                'condition' => $conditionLabels[$inspection->condition] ?? $inspection->condition,
                'notes' => $inspection->notes,
            ],
            'location' => [
                'address' => $inspection->address,
                'city' => $inspection->city,
                'province' => $inspection->province,
            ],
            'mechanic' => $inspection->mechanic ? [
                'name' => $inspection->mechanic->name,
                'phone' => $inspection->mechanic->phone,
            ] : null,
            'result' => [
                'status' => $resultLabels[$inspection->result] ?? $inspection->result,
                'body_condition' => $conditionLabels[$inspection->body_condition] ?? $inspection->body_condition,
                'engine_condition' => $conditionLabels[$inspection->engine_condition] ?? $inspection->engine_condition,
                'interior_condition' => $conditionLabels[$inspection->interior_condition] ?? $inspection->interior_condition,
                'notes' => $inspection->result_notes,
            ],
            'payment' => [
                'method' => $inspection->payment_method === 'bank_transfer' ? 'Transfer Bank' : 'Tunai',
                'status' => $inspection->payment_status,
                'price' => $inspection->price,
            ],
            'generated_at' => now()->format('d M Y H:i:s'),
        ];

        return $data;
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