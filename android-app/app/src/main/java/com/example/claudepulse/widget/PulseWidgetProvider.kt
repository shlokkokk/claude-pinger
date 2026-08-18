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
                views.setTextViewText(R.id.widget_acc1_time, TelemetryCalculator.formatDuration(acc1Mins))
                views.setTextViewText(R.id.widget_acc1_reset, "Resets at ${telemetry.acc1.nextPingDisplay}")
                views.setTextViewText(R.id.widget_acc1_badge, if (acc1IsSoonest) "Expiring soon" else "Fresh quota")
            } else {
                views.setTextViewText(R.id.widget_acc1_time, "0m")
                views.setTextViewText(R.id.widget_acc1_reset, "Next: ${telemetry.acc1.nextPingDisplay}")
                views.setTextViewText(R.id.widget_acc1_badge, "Idle")
            }

            // Account 2: pcgpt
            if (telemetry.acc2.isActive) {
                views.setTextViewText(R.id.widget_acc2_time, TelemetryCalculator.formatDuration(acc2Mins))
                views.setTextViewText(R.id.widget_acc2_reset, "Resets at ${telemetry.acc2.nextPingDisplay}")
                views.setTextViewText(R.id.widget_acc2_badge, if (!acc1IsSoonest) "Expiring soon" else "Fresh quota")
            } else {
                views.setTextViewText(R.id.widget_acc2_time, "0m")
                views.setTextViewText(R.id.widget_acc2_reset, "Next: ${telemetry.acc2.nextPingDisplay}")
                views.setTextViewText(R.id.widget_acc2_badge, "Idle")
            }

            // Dual Guidance Strip
            val shortTaskAcc = if (acc1IsSoonest) telemetry.acc1.account.username else telemetry.acc2.account.username
            val longSessionAcc = if (!acc1IsSoonest) telemetry.acc1.account.username else telemetry.acc2.account.username
            views.setTextViewText(
                R.id.widget_advice_text,
                "Short: $shortTaskAcc   •   Deep: $longSessionAcc"
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
