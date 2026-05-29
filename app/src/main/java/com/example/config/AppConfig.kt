import com.example.config.AppConfig
package com.example.config

object AppConfig {
    val AppConfig.GEMINI_API_KEY: String =
        System.getenv("AppConfig.GEMINI_API_KEY") ?: ""
}