package com.example.claudepulse.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.claudepulse.model.Account

@Composable
fun OrbitProgressRing(
    account: Account,
    percentLeft: Int,
    isActive: Boolean,
    size: Dp = 48.dp,
    strokeWidth: Dp = 5.dp
) {
    val sweepAngle by animateFloatAsState(
        targetValue = (percentLeft / 100f) * 360f,
        animationSpec = tween(durationMillis = 600),
        label = "sweepAngle"
    )

    val progressColor = if (account == Account.SHLOKSHAH412) Color(0xFF00F2FE) else Color(0xFFC084FC)
    val iconTint = if (isActive) progressColor else Color(0xFF64748B)

    Box(
        modifier = Modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val stroke = strokeWidth.toPx()
            val arcSize = size.toPx() - stroke
            val offset = stroke / 2

            // Background circle
            drawArc(
                color = Color(0x14FFFFFF),
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = androidx.compose.ui.geometry.Offset(offset, offset),
                size = androidx.compose.ui.geometry.Size(arcSize, arcSize),
                style = Stroke(width = stroke)
            )

            // Progress Arc
            if (percentLeft > 0) {
                drawArc(
                    color = progressColor,
                    startAngle = -90f,
                    sweepAngle = sweepAngle,
                    useCenter = false,
                    topLeft = androidx.compose.ui.geometry.Offset(offset, offset),
                    size = androidx.compose.ui.geometry.Size(arcSize, arcSize),
                    style = Stroke(width = stroke, cap = StrokeCap.Round)
                )
            }
        }

        Icon(
            imageVector = if (account == Account.SHLOKSHAH412) Icons.Default.Person else Icons.Default.Computer,
            contentDescription = null,
            tint = iconTint,
            modifier = Modifier.size(20.dp)
        )
    }
}
