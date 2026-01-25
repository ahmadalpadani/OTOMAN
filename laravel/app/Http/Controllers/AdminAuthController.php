<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Login gagal'], 401);
        }

        if (Auth::user()->role !== 'admin') {
            Auth::logout();
            return response()->json(['message' => 'Bukan admin'], 403);
        }

        return response()->json([
            'message' => 'Login admin berhasil',
            'user' => Auth::user()
        ]);
    }
}