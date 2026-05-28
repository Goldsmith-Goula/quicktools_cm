package com.example.data.repository

import com.example.data.local.UssdDao
import com.example.data.model.UssdService
import com.example.data.model.DbRequestLog
import com.example.data.model.RecentChat
import kotlinx.coroutines.flow.Flow
import java.util.Calendar

class UssdRepository(private val ussdDao: UssdDao) {

    val allServices: Flow<List<UssdService>> = ussdDao.getAllServices()
    val recentChats: Flow<List<RecentChat>> = ussdDao.getAllRecentChats()

    suspend fun getServicesCount(): Int = ussdDao.getServicesCount()

    suspend fun updateService(service: UssdService) {
        ussdDao.updateService(service)
    }

    suspend fun deleteService(id: Int) {
        ussdDao.deleteService(id)
    }

    /**
     * Attempts to submit a custom USSD service.
     * Employs a Fixed Window Rate Limiter where submissions are capped at 3 per day.
     */
    suspend fun submitService(service: UssdService): SubmissionResult {
        // Calculate start of current day (midnight local time)
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startOfToday = calendar.timeInMillis

        // Count existing submissions today
        val currentSubmissions = ussdDao.getRequestLogCount("USSD_SUBMISSION", startOfToday)

        val maxSubmissionsPerDay = 3
        if (currentSubmissions >= maxSubmissionsPerDay) {
            return SubmissionResult.RateLimited(max = maxSubmissionsPerDay, current = currentSubmissions)
        }

        // Insert the USSD service
        val newId = ussdDao.insertService(service.copy(isUserSubmitted = true))

        // Record the request log
        ussdDao.insertRequestLog(DbRequestLog(requestType = "USSD_SUBMISSION"))

        // Prune old request logs older than 7 days to keep database compact
        calendar.add(Calendar.DAY_OF_YEAR, -7)
        ussdDao.pruneRequestLogs(calendar.timeInMillis)

        return SubmissionResult.Success(newId.toInt())
    }

    // --- Recent Chats ---
    suspend fun addRecentChat(chat: RecentChat) {
        ussdDao.insertRecentChat(chat)
        ussdDao.trimRecentChats() // Retain only top 10 recent chats
    }

    suspend fun pruneRecentChats() {
        // Delete chats older than 30 days
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -30)
        ussdDao.pruneRecentChats(calendar.timeInMillis)
    }

    // --- Database Seeding ---
    suspend fun seedDatabaseIfEmpty() {
        if (getServicesCount() == 0) {
            getSeedServices().forEach { service ->
                ussdDao.insertService(service)
            }
        }
    }

    private fun getSeedServices(): List<UssdService> {
        return listOf(
            // MTN Cameroon
            UssdService(name = "MTN Data Bundles", code = "*157#", network = "MTN", category = "Data", description = "Purchase internet packages and data plans."),
            UssdService(name = "MTN MoMo Check", code = "*126#", network = "MTN", category = "Mobile Money", description = "Send, receive, and manage Mobile Money payments."),
            UssdService(name = "MTN Account Balance", code = "*155#", network = "MTN", category = "Airtime", description = "Quickly check your current prepaid balance."),
            UssdService(name = "MTN EasyBooster / Promos", code = "*160#", network = "MTN", category = "Bonuses", description = "View active promotions and airtime bonuses."),
            UssdService(name = "MTN Me2U Transfer", code = "*150#", network = "MTN", category = "Airtime", description = "Transfer airtime directly to other mobile accounts."),
            UssdService(name = "MTN Help Desk", code = "*111#", network = "MTN", category = "Support", description = "Access the general MTN USSD self service menu."),

            // Orange Cameroon
            UssdService(name = "Orange Data Menu", code = "*147#", network = "Orange", category = "Data", description = "Top-up your cellular data and active subscriptions."),
            UssdService(name = "Orange Money", code = "*150#", network = "Orange", category = "Mobile Money", description = "Access money transfers, bill payments, and cash-outs."),
            UssdService(name = "Orange Airtime Refill", code = "*141#", network = "Orange", category = "Airtime", description = "Load credit via airtime voucher PIN or scratch cards."),
            UssdService(name = "Orange Balance Check", code = "*155#", network = "Orange", category = "Airtime", description = "Check available balance and SIM validation status."),
            UssdService(name = "Orange My Way (Bonuses)", code = "*123#", network = "Orange", category = "Bonuses", description = "Activate custom bundle voice and surfing promotions."),
            UssdService(name = "Orange Customer Portal", code = "*111#", network = "Orange", category = "Support", description = "Navigate Orange assistance codes and self-care channels."),

            // Camtel
            UssdService(name = "Camtel Blue Bundle Buy", code = "*144#", network = "Camtel", category = "Data", description = "Purchase Blue packages (One, S, M, XL) for 4G LTE."),
            UssdService(name = "Camtel Airtime Refill", code = "*125#", network = "Camtel", category = "Airtime", description = "Recharge your Camtel airtime via digital PIN/vouchers."),
            UssdService(name = "Camtel Account Balance", code = "*125*1#", network = "Camtel", category = "Airtime", description = "Check available Camtel voice and credit balances."),
            UssdService(name = "Camtel Blue Money", code = "*100#", network = "Camtel", category = "Mobile Money", description = "Activate digital wallets and make minor payments."),
            UssdService(name = "Camtel Blue Data Balance", code = "*234#", network = "Camtel", category = "Data", description = "Review remaining LTE megabytes and plan validation."),
            UssdService(name = "Camtel Customer Call", code = "132", network = "Camtel", category = "Support", description = "Dial hotlines directly for customer support services.")
        )
    }
}

sealed class SubmissionResult {
    data class Success(val newId: Int) : SubmissionResult()
    data class RateLimited(val max: Int, val current: Int) : SubmissionResult()
}
