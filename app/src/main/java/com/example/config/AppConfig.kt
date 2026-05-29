package com.example.config

object AppConfig {
    val GEMINI_API_KEY: String =
        System.getenv("GEMINI_API_KEY") ?: ""
}