package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val ToolColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    onPrimary = White,
    primaryContainer = LightGray,
    onPrimaryContainer = Black,
    secondary = NeutralGray,
    onSecondary = White,
    background = White,
    onBackground = Black,
    surface = VeryLightGray,
    onSurface = Black,
    error = ErrorRed,
    onError = White
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = false, // Forced light mode only
    dynamicColor: Boolean = false, // Forced brand color scheme
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = ToolColorScheme,
        typography = Typography,
        content = content
    )
}
