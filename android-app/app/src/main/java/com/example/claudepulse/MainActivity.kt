package com.example.claudepulse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.claudepulse.notifications.NotificationHelper
import com.example.claudepulse.notifications.ResetAlertScheduler
import com.example.claudepulse.theme.ClaudePulseTheme
import com.example.claudepulse.ui.DashboardScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Init notification channels & background pre-reset alerts
        NotificationHelper.initChannels(this)
        ResetAlertScheduler.scheduleNextAlerts(this)

        setContent {
            ClaudePulseTheme {
                DashboardScreen()
            }
        }
    }
}
