package com.example.claudepulse.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.example.claudepulse.MainActivity
import com.example.claudepulse.R
import com.example.claudepulse.core.CloudflareApiService
import com.example.claudepulse.core.TelemetryCalculator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class PulseWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_WIDGET_PING) {
            CoroutineScope(Dispatchers.IO).launch {
                CloudflareApiService.triggerPing(null)
                val manager = AppWidgetManager.getInstance(context)
                val ids = manager.getAppWidgetIds(ComponentName(context, PulseWidgetProvider::class.java))
                for (id in ids) {
                    updateWidget(context, manager, id)
                }
            }
        }
    }

    companion object {
        const val ACTION_WIDGET_PING = "com.example.claudepulse.ACTION_WIDGET_PING"

        fun updateWidget(context: Context, manager: AppWidgetManager, widgetId: Int) {
            val telemetry = TelemetryCalculator.calculate()
            val views = RemoteViews(context.packageName, R.layout.widget_pulse)

            // Recommendation
            views.setTextViewText(R.id.widget_rec_pill, "Use ${telemetry.recommendation.account.username}")
            views.setTextViewText(R.id.widget_rec_reason, telemetry.recommendation.reason)

            // Account 1
            val acc1Text = if (telemetry.acc1.isActive) "${TelemetryCalculator.formatDuration(telemetry.acc1.minsLeftInWindow)} Left" else "0m Left"
            views.setTextViewText(R.id.widget_acc1_time, acc1Text)

            // Account 2
            val acc2Text = if (telemetry.acc2.isActive) "${TelemetryCalculator.formatDuration(telemetry.acc2.minsLeftInWindow)} Left" else "0m Left"
            views.setTextViewText(R.id.widget_acc2_time, acc2Text)

            // 1-Tap Open App
            val appIntent = Intent(context, MainActivity::class.java)
            val appPendingIntent = PendingIntent.getActivity(
                context, 200, appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, appPendingIntent)

            // 1-Tap Launch Claude
            val claudeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://claude.ai"))
            val claudePendingIntent = PendingIntent.getActivity(
                context, 201, claudeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_btn_launch, claudePendingIntent)

            // 1-Tap Direct Ping
            val pingIntent = Intent(context, PulseWidgetProvider::class.java).apply {
                action = ACTION_WIDGET_PING
            }
            val pingPendingIntent = PendingIntent.getBroadcast(
                context, 202, pingIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_btn_ping, pingPendingIntent)

            manager.updateAppWidget(widgetId, views)
        }
    }
}
