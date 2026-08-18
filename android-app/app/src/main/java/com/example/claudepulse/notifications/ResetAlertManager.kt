package com.example.claudepulse.notifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.claudepulse.MainActivity
import com.example.claudepulse.core.TelemetryCalculator
import java.time.ZonedDateTime
import java.util.Calendar

class ResetAlertReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val accountName = intent.getStringExtra("account_name") ?: "Claude Account"
        val pingTime = intent.getStringExtra("ping_time") ?: "soon"

        NotificationHelper.showResetAlert(context, accountName, pingTime)
        ResetAlertScheduler.scheduleNextAlerts(context)
    }
}

object NotificationHelper {
    private const val CHANNEL_ID = "claude_pulse_alerts"
    private const val CHANNEL_NAME = "Limit Reset Reminders"

    fun initChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Proactive reminders 10 minutes before Claude rate-limit windows reset"
                enableVibration(true)
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    fun showResetAlert(context: Context, accountName: String, pingTime: String) {
        initChannels(context)

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val appPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val openClaudeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://claude.ai")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val claudePendingIntent = PendingIntent.getActivity(
            context, 1, openClaudeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Claude Limit Refreshes in 10m")
            .setContentText("$accountName limit resets at $pingTime. Ready for queries.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(appPendingIntent)
            .addAction(android.R.drawable.ic_menu_send, "Open Claude", claudePendingIntent)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(101, notification)
    }
}

object ResetAlertScheduler {
    fun scheduleNextAlerts(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val now = TelemetryCalculator.getNowIST()

        TelemetryCalculator.SCHEDULE.forEachIndexed { index, node ->
            // Schedule 10 minutes prior to ping
            var targetMins = node.minsOfDay - 10
            if (targetMins < 0) targetMins += 1440

            val targetHour = targetMins / 60
            val targetMinute = targetMins % 60

            val calendar = Calendar.getInstance().apply {
                timeZone = java.util.TimeZone.getTimeZone("Asia/Kolkata")
                set(Calendar.HOUR_OF_DAY, targetHour)
                set(Calendar.MINUTE, targetMinute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (timeInMillis <= System.currentTimeMillis()) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val intent = Intent(context, ResetAlertReceiver::class.java).apply {
                putExtra("account_name", node.account.username)
                putExtra("ping_time", node.displayTime)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                1000 + index,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
                }
            } catch (_: SecurityException) {
                alarmManager.set(AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent)
            }
        }
    }
}
