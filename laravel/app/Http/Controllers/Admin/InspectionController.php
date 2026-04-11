<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;
use App\Models\Mechanic;

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
                $q->where('vehicle_brand', 'like', "%{$request->search}%")
                  ->orWhere('vehicle_model', 'like', "%{$request->search}%")
                  ->orWhere('license_plate', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($uq) =>
                      $uq->where('name', 'like', "%{$request->search}%")
                  );
            });
        }

        $data = $query->paginate($request->limit ?? 10);

        return [
            'inspections' => $data->items(),
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
        return Inspection::with(['user', 'mechanic'])->findOrFail($id);
    }

    public function assign(Request $request, $id)
    {
        $data = $request->validate([
            'mechanic_id' => 'required|integer|exists:mechanics,id',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $inspection = Inspection::findOrFail($id);

        $inspection->update([
            'mechanic_id' => $data['mechanic_id'],
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'],
            'admin_notes' => $data['notes'] ?? null,
            'status' => 'in_progress'
        ]);

        return [
            'message' => 'Inspector berhasil di-assign',
            'inspection' => $inspection
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
        $inspection = Inspection::findOrFail($id);

        return response()->json([
            'message' => 'PDF belum diimplementasikan',
            'inspection' => $inspection->order_code
        ]);
    }
}