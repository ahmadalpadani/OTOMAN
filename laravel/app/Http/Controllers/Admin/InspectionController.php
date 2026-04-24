<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;
use App\Models\Mechanic;
use Illuminate\Support\Carbon;

class InspectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Inspection::with(['user', 'mechanic']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('brand', 'like', "%{$request->search}%")
                  ->orWhere('model', 'like', "%{$request->search}%")
                  ->orWhere('license_plate', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($uq) =>
                      $uq->where('name', 'like', "%{$request->search}%")
                  );
            });
        }

        $data = $query->orderBy('created_at', 'desc')->paginate($request->limit ?? 10);

        $inspections = collect($data->items())->map(function ($insp) {
            $arr = $insp->toArray();
            $arr['vehicle_brand'] = $arr['brand'];
            $arr['vehicle_model'] = $arr['model'];
            $arr['payment_proof_url'] = $insp->payment_proof_path
                ? url('/storage/' . $insp->payment_proof_path)
                : null;
            $arr['vehicle_images'] = $insp->vehicle_images;
            return $arr;
        });

        return [
            'inspections' => $inspections,
            'pagination' => [
                'current_page' => $data->currentPage(),
                'total_pages' => $data->lastPage(),
                'total' => $data->total(),
                'per_page' => $data->perPage(),
            ]
        ];
    }

    public function show($id)
    {
        $inspection = Inspection::with(['user', 'mechanic'])->findOrFail($id);
        $arr = $inspection->toArray();
        $arr['vehicle_brand'] = $arr['brand'];
        $arr['vehicle_model'] = $arr['model'];
        $arr['payment_proof_url'] = $inspection->payment_proof_path
            ? url('/storage/' . $inspection->payment_proof_path)
            : null;
        return $arr;
    }

    public function assign(Request $request, $id)
    {
        $data = $request->validate([
            'mechanic_id' => 'required|integer|exists:users,id',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        // Parse time range: "13:00-15:00" -> take start time as datetime
        // Frontend sends "HH:MM-HH:MM" format, convert to "YYYY-MM-DD HH:MM:00"
        $scheduledDateTime = $data['scheduled_date'];
        if (preg_match('/^(\d{2}:\d{2})-(\d{2}:\d{2})$/', $data['scheduled_time'], $matches)) {
            $scheduledDateTime = $data['scheduled_date'] . ' ' . $matches[1] . ':00';
        } else {
            // Fallback: just use the date + time as-is
            $scheduledDateTime = $data['scheduled_date'] . ' ' . $data['scheduled_time'];
        }

        $inspection = Inspection::findOrFail($id);

        $inspection->update([
            'mechanic_id' => $data['mechanic_id'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $scheduledDateTime,
            'admin_notes' => $data['notes'] ?? null,
            'status' => 'in_progress'
        ]);

        $inspection->refresh();
        $arr = $inspection->toArray();
        $arr['vehicle_brand'] = $arr['brand'];
        $arr['vehicle_model'] = $arr['model'];

        return [
            'message' => 'Inspector berhasil di-assign',
            'inspection' => $arr
        ];
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,rejected',
            'notes' => 'nullable|string'
        ]);

        $inspection = Inspection::findOrFail($id);

        $inspection->update([
            'status' => $data['status'],
            'admin_notes' => $data['notes'] ?? null
        ]);

        return [
            'message' => 'Status berhasil diupdate',
            'inspection' => $inspection
        ];
    }

    public function downloadReport($id)
    {
        $inspection = Inspection::with(['user', 'mechanic'])->findOrFail($id);

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

        return [
            'order_code' => $inspection->order_code,
            'inspection_date' => $inspection->inspection_date ? Carbon::parse($inspection->inspection_date)->format('d M Y') : null,
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
            'admin_notes' => $inspection->admin_notes,
            'generated_at' => now()->format('d M Y H:i:s'),
        ];
    }
}