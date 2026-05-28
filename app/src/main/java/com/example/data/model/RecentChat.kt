package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recent_chats")
data class RecentChat(
    @PrimaryKey val phoneNumber: String, // Unique identifier (raw digits)
    val formattedNumber: String, // Formatted visual text representation
    val message: String?, // Pre-configured templates or content preview
    val timestamp: Long = System.currentTimeMillis()
)
