<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Inspection;

class DashboardController extends Controller
{
    public function stats()
    {
        return [
            'total_users' => User::count(),
            'total_inspections' => Inspection::count(),
            'pending_inspections' => Inspection::where('status', 'pending')->count(),
            'completed_inspections' => Inspection::where('status', 'completed')->count(),
        ];
    }
}