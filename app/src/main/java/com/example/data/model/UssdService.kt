package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ussd_services")
data class UssdService(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val code: String,
    val network: String, // "MTN", "Orange", "Camtel", "All Networks"
    val category: String, // "Data", "Airtime", "Mobile Money", "Banking", "Bonuses", "Support"
    val description: String,
    val isFavorite: Boolean = false,
    val isUserSubmitted: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)
