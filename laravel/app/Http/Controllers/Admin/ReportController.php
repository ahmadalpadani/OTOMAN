<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inspection;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $year = $request->year ?? now()->year;

        $data = Inspection::whereYear('created_at', $year)->get();

        return [
            'status_breakdown' => [
                'pending' => $data->where('status', 'pending')->count(),
                'in_progress' => $data->where('status', 'in_progress')->count(),
                'completed' => $data->where('status', 'completed')->count(),
                'rejected' => $data->where('status', 'rejected')->count(),
            ],
            'total_inspections' => $data->count()
        ];
    }

    public function export(Request $request)
    {
        return response()->json([
            'message' => 'Export belum diimplementasikan'
        ]);
    }
}