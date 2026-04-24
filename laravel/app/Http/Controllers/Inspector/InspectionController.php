<?php

namespace App\Http\Controllers\Inspector;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;

class InspectionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Inspection::with('user')
            ->where('mechanic_id', $user->id);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $data = $query->paginate($request->limit ?? 10);

        return [
            'inspections' => collect($data->items())->map(fn($insp) => array_merge($insp->toArray(), [
                'vehicle_brand' => $insp->brand,
                'vehicle_model' => $insp->model,
            ])),
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
        $user = auth()->user();
        $inspection = Inspection::with(['user', 'mechanic'])->findOrFail($id);

        // Only allow the assigned inspector to view
        if ($inspection->mechanic_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $arr = $inspection->toArray();
        $arr['vehicle_brand'] = $arr['brand'];
        $arr['vehicle_model'] = $arr['model'];
        return $arr;
    }

    public function history(Request $request)
    {
        $user = auth()->user();

        $query = Inspection::with('user')
            ->where('status', 'completed')
            ->where('mechanic_id', $user->id);

        $data = $query->paginate($request->limit ?? 10);

        return [
            'inspections' => collect($data->items())->map(fn($insp) => array_merge($insp->toArray(), [
                'vehicle_brand' => $insp->brand,
                'vehicle_model' => $insp->model,
            ])),
            'pagination' => [
                'current_page' => $data->currentPage(),
                'total_pages' => $data->lastPage(),
                'total' => $data->total(),
                'per_page' => $data->perPage(),
            ]
        ];
    }

    public function stats()
    {
        $user = auth()->user();
        return [
            'assigned' => Inspection::where('mechanic_id', $user->id)->count(),
            'in_progress' => Inspection::where('mechanic_id', $user->id)->where('status', 'in_progress')->count(),
            'completed' => Inspection::where('mechanic_id', $user->id)->where('status', 'completed')->count(),
        ];
    }

    public function complete(Request $request, $id)
    {
        $data = $request->validate([
            'result' => 'required|in:approve,pending,reject',
            'body_condition' => 'required',
            'engine_condition' => 'required',
            'interior_condition' => 'required',
            'notes' => 'nullable|string'
        ]);

        $inspection = Inspection::findOrFail($id);

        if ($inspection->mechanic_id !== auth()->id()) {
            abort(403);
        }

        if ($inspection->status !== 'in_progress') {
            abort(400, 'Inspection belum dimulai');
        }

        $inspection->update([
            'status' => 'completed',
            'result' => $data['result'],
            'body_condition' => $data['body_condition'],
            'engine_condition' => $data['engine_condition'],
            'interior_condition' => $data['interior_condition'],
            'result_notes' => $data['notes'] ?? null,
            'completed_at' => now()
        ]);

        return [
            'message' => 'Inspeksi selesai',
            'inspection' => $inspection
        ];
    }
}