package com.example.claudepulse.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun BrandLogoIcon(
    size: Dp = 42.dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(13.dp))
            .background(Color(0xFF111522))
            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(13.dp)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size * 0.7f)) {
            val stroke = 2.5.dp.toPx()
            val arcSize = size.toPx() * 0.7f - stroke
            val offset = stroke / 2

            // Cyan Top-Left Orbital Arc
            drawArc(
                color = Color(0xFF00F2FE),
                startAngle = 140f,
                sweepAngle = 160f,
                useCenter = false,
                topLeft = Offset(offset, offset),
                size = Size(arcSize, arcSize),
                style = Stroke(width = stroke, cap = StrokeCap.Round)
            )

            // Purple Bottom-Right Orbital Arc
            drawArc(
                color = Color(0xFFC084FC),
                startAngle = 320f,
                sweepAngle = 160f,
                useCenter = false,
                topLeft = Offset(offset, offset),
                size = Size(arcSize, arcSize),
                style = Stroke(width = stroke, cap = StrokeCap.Round)
            )

            // Central Pulse Spark
            val path = Path().apply {
                val cx = size.toPx() * 0.35f
                val cy = size.toPx() * 0.35f
                val s = size.toPx() * 0.18f

                moveTo(cx + s * 0.2f, cy - s)
                lineTo(cx - s * 0.8f, cy + s * 0.1f)
                lineTo(cx, cy + s * 0.1f)
                lineTo(cx - s * 0.2f, cy + s)
                lineTo(cx + s * 0.8f, cy - s * 0.1f)
                lineTo(cx, cy - s * 0.1f)
                close()
            }
            drawPath(path = path, color = Color.White)
        }
    }
}
