<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inspection extends Model
{
    protected $fillable = [
        'user_id',
        'order_code',
        'vehicle_type',
        'brand',
        'model',
        'year',
        'license_plate',
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
        'payment_method',
        'payment_proof_path',
        'payment_status',
        'mechanic_id',
        'scheduled_date',
        'scheduled_time',
        'mechanic_notes',
        'admin_notes',
        'result',
        'body_condition',
        'engine_condition',
        'interior_condition',
        'result_notes',
        'completed_at',
        'vehicle_images',
    ];

    protected $casts = [
        'inspection_date' => 'datetime:Y-m-d',
        'scheduled_date' => 'datetime:Y-m-d',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the inspection.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the mechanic (inspector) assigned to the inspection.
     */
    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }
}