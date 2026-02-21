<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    protected $fillable = [
        'user_id',
        'order_code',
        'vehicle_type',
        'brand',
        'model',
        'year',
        'mileage',
        'condition',
        'notes',
        'inspection_date',
        'inspection_time',
        'province',
        'city',
        'address',
        'contact_phone',
        'price',
        'status',
    ];

    protected $casts = [
        'inspection_date' => 'date',
    ];
}