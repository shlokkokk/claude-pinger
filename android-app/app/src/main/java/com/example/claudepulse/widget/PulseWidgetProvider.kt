package com.example.claudepulse.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.example.claudepulse.MainActivity
import com.example.claudepulse.R
import com.example.claudepulse.core.TelemetryCalculator

class PulseWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    companion object {
        fun updateWidget(context: Context, manager: AppWidgetManager, widgetId: Int) {
            val telemetry = TelemetryCalculator.calculate()
            val views = RemoteViews(context.packageName, R.layout.widget_pulse)

            // Header live clock
            views.setTextViewText(R.id.widget_live_clock, "● ${telemetry.currentISTTime}")

            val acc1Mins = telemetry.acc1.minsLeftInWindow
            val acc2Mins = telemetry.acc2.minsLeftInWindow
            val acc1IsSoonest = acc1Mins <= acc2Mins

            // Account 1: shlokshah412
            if (telemetry.acc1.isActive) {
                views.setTextViewText(R.id.widget_acc1_time, "Reset in ${TelemetryCalculator.formatDuration(acc1Mins)}")
                val tag = if (acc1IsSoonest) "Expiring soon" else "Fresh quota"
                views.setTextViewText(R.id.widget_acc1_reset, "At ${telemetry.acc1.nextPingDisplay} • $tag")
            } else {
                views.setTextViewText(R.id.widget_acc1_time, "Limit Idle (0m)")
                views.setTextViewText(R.id.widget_acc1_reset, "Next: ${telemetry.acc1.nextPingDisplay}")
            }

            // Account 2: pcgpt
            if (telemetry.acc2.isActive) {
                views.setTextViewText(R.id.widget_acc2_time, "Reset in ${TelemetryCalculator.formatDuration(acc2Mins)}")
                val tag = if (!acc1IsSoonest) "Expiring soon" else "Fresh quota"
                views.setTextViewText(R.id.widget_acc2_reset, "At ${telemetry.acc2.nextPingDisplay} • $tag")
            } else {
                views.setTextViewText(R.id.widget_acc2_time, "Limit Idle (0m)")
                views.setTextViewText(R.id.widget_acc2_reset, "Next: ${telemetry.acc2.nextPingDisplay}")
            }

            // Compact & articulated dual guidance (never overflows on any screen width)
            val shortTaskAcc = if (acc1IsSoonest) telemetry.acc1.account.username else telemetry.acc2.account.username
            val longSessionAcc = if (!acc1IsSoonest) telemetry.acc1.account.username else telemetry.acc2.account.username
            views.setTextViewText(
                R.id.widget_advice_text,
                "Short tasks: $shortTaskAcc • Deep work: $longSessionAcc"
            )

            // 1-Tap Open Claude Pulse App
            val appIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val appPendingIntent = PendingIntent.getActivity(
                context, 200, appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, appPendingIntent)

            manager.updateAppWidget(widgetId, views)
        }
    }
}
