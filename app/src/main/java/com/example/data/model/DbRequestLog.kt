package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "db_request_logs")
data class DbRequestLog(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val requestType: String, // "USSD_SUBMISSION"
    val timestamp: Long = System.currentTimeMillis()
)
