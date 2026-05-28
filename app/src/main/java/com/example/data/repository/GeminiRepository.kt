package com.example.data.repository

import com.example.BuildConfig
import com.example.data.api.GeminiApiService
import com.example.data.api.GeminiContent
import com.example.data.api.GeminiGenerationConfig
import com.example.data.api.GeminiPart
import com.example.data.api.GeminiRequest
import com.example.data.api.UssdAiSuggestion
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiRepository(private val apiService: GeminiApiService) {

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val suggestionAdapter = moshi.adapter(UssdAiSuggestion::class.java)

    suspend fun getAiUssdSuggestion(query: String): UssdAiSuggestion? = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            // Handle placeholder key with clean fallback suggestions
            return@withContext getMockSuggestion(query)
        }

        val prompt = """
            You are an expert helper for Cameroon telecom networks (MTN Cameroon, Orange Cameroon, Camtel).
            Suggest a single, highly relevant USSD code for the user's search query: "$query".
            The USSD code must be in use in Cameroon (MTN, Orange, or Camtel) and formatted correctly (with * and #).
            Output MUST be structured as a JSON object matching this schema exactly:
            {
              "code": "USSD code string (e.g., *157*1#)",
              "network": "Identify the network provider, must be one of: MTN, Orange, Camtel, All",
              "name": "Descriptive service title (e.g., MTN 100MB Pack)",
              "description": "Clear explanation of what this USSD shortcut activates (e.g., dial this to buy direct internet or check balances)",
              "confidenceStars": integer between 1 and 5,
              "confidencePercentage": integer between 0 and 100
            }
            Do not enclose in markdown blocks. Return only raw JSON.
        """.trimIndent()

        val request = GeminiRequest(
            contents = listOf(
                GeminiContent(parts = listOf(GeminiPart(text = prompt)))
            ),
            generationConfig = GeminiGenerationConfig(
                responseMimeType = "application/json",
                temperature = 0.2f
            )
        )

        try {
            val response = apiService.generateContent(apiKey, request)
            val jsonText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            if (jsonText != null) {
                return@withContext suggestionAdapter.fromJson(jsonText)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Fallback
        return@withContext getMockSuggestion(query)
    }

    private fun getMockSuggestion(query: String): UssdAiSuggestion {
        val q = query.lowercase()
        return when {
            q.contains("data") || q.contains("internet") || q.contains("mega") || q.contains("giga") || q.contains("forfait") -> {
                UssdAiSuggestion(
                    code = "*157#",
                    network = "MTN",
                    name = "MTN Mobile Internet Menu",
                    description = "Shortcode to check balance, buy MTN data bundles, or sign up for active visual plans.",
                    confidenceStars = 4,
                    confidencePercentage = 92
                )
            }
            q.contains("money") || q.contains("momo") || q.contains("om") || q.contains("cash") || q.contains("pay") || q.contains("argent") -> {
                UssdAiSuggestion(
                    code = "*126#",
                    network = "MTN",
                    name = "MTN Mobile Money Suite",
                    description = "Main gateway code for MTN MoMo payments, fund transfers, cash withdrawals, and billing setups.",
                    confidenceStars = 5,
                    confidencePercentage = 95
                )
            }
            q.contains("bal") || q.contains("solde") || q.contains("credit") -> {
                UssdAiSuggestion(
                    code = "*155#",
                    network = "Orange",
                    name = "Orange Balance Checker",
                    description = "Direct shortcode to verify principal dialer balance and available promotion options.",
                    confidenceStars = 5,
                    confidencePercentage = 98
                )
            }
            else -> {
                UssdAiSuggestion(
                    code = "*150#",
                    network = "Orange",
                    name = "Orange Money Hub",
                    description = "Central dialer code for Orange Money Cameroon (*150#) to transfer or pay merchants easily.",
                    confidenceStars = 4,
                    confidencePercentage = 85
                )
            }
        }
    }
}
