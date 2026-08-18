package com.example.claudepulse.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = CyanOrbit,
    secondary = PurpleOrbit,
    tertiary = MintGreen,
    background = BgBase,
    surface = BgSurface,
    onPrimary = BgBase,
    onSecondary = BgBase,
    onTertiary = BgBase,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun ClaudePulseTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
