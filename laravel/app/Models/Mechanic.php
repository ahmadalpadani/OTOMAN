<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mechanic extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'specialization',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user associated with the mechanic (if any).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all inspections assigned to this mechanic.
     */
    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }
}