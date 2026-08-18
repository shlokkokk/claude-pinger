package com.example.claudepulse.ui.components

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.claudepulse.core.TelemetryCalculator
import com.example.claudepulse.model.Account
import com.example.claudepulse.model.ScheduleNode

@Composable
fun TimelineView(
    selectedNode: ScheduleNode?,
    onSelectNode: (ScheduleNode?) -> Unit
) {
    val view = LocalView.current
    val nowIST = TelemetryCalculator.getNowIST()
    val currentMinsOfDay = nowIST.hour * 60 + nowIST.minute + (nowIST.second / 60f)
    val cursorFraction = currentMinsOfDay / 1440f

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Lane 1: shlokshah412
        TimelineLaneRow(
            label = "shlokshah412",
            labelColor = Color(0xFF00F2FE),
            account = Account.SHLOKSHAH412,
            selectedNode = selectedNode,
            cursorFraction = cursorFraction,
            onSelectNode = {
                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                onSelectNode(it)
            }
        )

        // Lane 2: pcgpt
        TimelineLaneRow(
            label = "pcgpt",
            labelColor = Color(0xFFC084FC),
            account = Account.PCGPT,
            selectedNode = selectedNode,
            cursorFraction = cursorFraction,
            onSelectNode = {
                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                onSelectNode(it)
            }
        )

        // Time Markers
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 90.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            listOf("00:00", "06:00", "12:00", "18:00", "24:00").forEach { time ->
                Text(
                    text = time,
                    color = Color(0xFF64748B),
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
private fun TimelineLaneRow(
    label: String,
    labelColor: Color,
    account: Account,
    selectedNode: ScheduleNode?,
    cursorFraction: Float,
    onSelectNode: (ScheduleNode?) -> Unit
) {
    val pings = TelemetryCalculator.SCHEDULE.filter { it.account == account }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            color = labelColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.width(82.dp)
        )

        Box(
            modifier = Modifier
                .weight(1f)
                .height(18.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            // Track background bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0x14FFFFFF))
            )

            // Live now cursor
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(18.dp)
            ) {
                val x = size.width * cursorFraction
                drawLine(
                    color = Color.White,
                    start = Offset(x, 0f),
                    end = Offset(x, size.height),
                    strokeWidth = 2.dp.toPx()
                )
            }

            // Ping Nodes
            pings.forEach { node ->
                val fraction = node.minsOfDay / 1440f
                val isSelected = selectedNode?.id == node.id

                Box(
                    modifier = Modifier
                        .fillMaxWidth(fraction)
                        .padding(end = if (fraction >= 1f) 0.dp else 0.dp),
                    contentAlignment = Alignment.CenterEnd
                ) {
                    Box(
                        modifier = Modifier
                            .size(if (isSelected) 18.dp else 14.dp)
                            .shadow(if (isSelected) 8.dp else 4.dp, CircleShape, spotColor = labelColor)
                            .clip(CircleShape)
                            .background(labelColor)
                            .border(
                                width = if (isSelected) 2.dp else 1.5.dp,
                                color = if (isSelected) Color.White else Color(0xFF07080C),
                                shape = CircleShape
                            )
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                if (isSelected) onSelectNode(null) else onSelectNode(node)
                            }
                    )
                }
            }
        }
    }
}
