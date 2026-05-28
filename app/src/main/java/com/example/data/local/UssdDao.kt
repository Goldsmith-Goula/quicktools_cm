package com.example.data.local

import androidx.room.*
import com.example.data.model.UssdService
import com.example.data.model.DbRequestLog
import com.example.data.model.RecentChat
import kotlinx.coroutines.flow.Flow

@Dao
interface UssdDao {
    // --- USSD Services ---
    @Query("SELECT * FROM ussd_services ORDER BY id ASC")
    fun getAllServices(): Flow<List<UssdService>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertService(service: UssdService): Long

    @Update
    suspend fun updateService(service: UssdService)

    @Query("DELETE FROM ussd_services WHERE id = :id")
    suspend fun deleteService(id: Int)

    @Query("SELECT COUNT(*) FROM ussd_services")
    suspend fun getServicesCount(): Int

    // --- Rate Limiting ---
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRequestLog(log: DbRequestLog)

    @Query("SELECT COUNT(*) FROM db_request_logs WHERE requestType = :type AND timestamp >= :sinceTimestamp")
    suspend fun getRequestLogCount(type: String, sinceTimestamp: Long): Int

    @Query("DELETE FROM db_request_logs WHERE timestamp < :expireTimestamp")
    suspend fun pruneRequestLogs(expireTimestamp: Long)

    // --- Recent Chats ---
    @Query("SELECT * FROM recent_chats ORDER BY timestamp DESC LIMIT 10")
    fun getAllRecentChats(): Flow<List<RecentChat>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecentChat(chat: RecentChat)

    @Query("DELETE FROM recent_chats WHERE timestamp < :expireTimestamp")
    suspend fun pruneRecentChats(expireTimestamp: Long)

    @Query("SELECT COUNT(*) FROM recent_chats")
    suspend fun getRecentChatsCount(): Int

    @Query("DELETE FROM recent_chats WHERE phoneNumber NOT IN (SELECT phoneNumber FROM recent_chats ORDER BY timestamp DESC LIMIT 10)")
    suspend fun trimRecentChats()
}
