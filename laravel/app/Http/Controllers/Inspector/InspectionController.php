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
            ->whereHas('mechanic', fn($q) =>
                $q->where('user_id', $user->id)
            );

        if ($request->status) {
            $query->where('status', $request->status);
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
        $inspection = Inspection::with(['user', 'mechanic'])->findOrFail($id);

        if ($inspection->mechanic->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return $inspection;
    }

    public function history(Request $request)
    {
        $user = auth()->user();

        $query = Inspection::where('status', 'completed')
            ->whereHas('mechanic', fn($q) =>
                $q->where('user_id', $user->id)
            );

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

    public function stats()
    {
        return [
            'assigned' => Inspection::count(),
            'in_progress' => Inspection::where('status', 'in_progress')->count(),
            'completed' => Inspection::where('status', 'completed')->count(),
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

        if ($inspection->mechanic->user_id !== auth()->id()) {
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