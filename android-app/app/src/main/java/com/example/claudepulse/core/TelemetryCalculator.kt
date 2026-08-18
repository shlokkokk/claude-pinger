package com.example.claudepulse.core

import com.example.claudepulse.model.Account
import com.example.claudepulse.model.AccountTelemetry
import com.example.claudepulse.model.DashboardTelemetry
import com.example.claudepulse.model.Recommendation
import com.example.claudepulse.model.ScheduleNode
import com.example.claudepulse.model.TaskMode
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

object TelemetryCalculator {

    const val WINDOW_DURATION_MINS = 300 // 5 hours
    private val IST_ZONE = ZoneId.of("Asia/Kolkata")
    private val TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm:ss a", Locale.US)

    val SCHEDULE = listOf(
        ScheduleNode("ping-1", Account.SHLOKSHAH412, 1, 34, 1 * 60 + 34, "01:34 AM", "Late Night Ping"),
        ScheduleNode("ping-2", Account.PCGPT, 7, 30, 7 * 60 + 30, "07:30 AM", "Morning Ping"),
        ScheduleNode("ping-3", Account.SHLOKSHAH412, 10, 28, 10 * 60 + 28, "10:28 AM", "Workday Ping"),
        ScheduleNode("ping-4", Account.PCGPT, 12, 32, 12 * 60 + 32, "12:32 PM", "Midday Ping"),
        ScheduleNode("ping-5", Account.SHLOKSHAH412, 15, 30, 15 * 60 + 30, "03:30 PM", "Afternoon Ping"),
        ScheduleNode("ping-6", Account.PCGPT, 17, 34, 17 * 60 + 34, "05:34 PM", "Evening Ping"),
        ScheduleNode("ping-7", Account.SHLOKSHAH412, 20, 32, 20 * 60 + 32, "08:32 PM", "Night Ping"),
        ScheduleNode("ping-8", Account.PCGPT, 22, 36, 22 * 60 + 36, "10:36 PM", "Midnight Ping")
    ).sortedBy { it.minsOfDay }

    fun getNowIST(): ZonedDateTime {
        return ZonedDateTime.ofInstant(Instant.now(), IST_ZONE)
    }

    fun formatDuration(totalMins: Int): String {
        val h = totalMins / 60
        val m = totalMins % 60
        return if (h == 0) "${m}m" else "${h}h ${m}m"
    }

    fun calculate(taskMode: TaskMode = TaskMode.QUICK): DashboardTelemetry {
        val now = getNowIST()
        val currentMinsOfDay = now.hour * 60 + now.minute + (now.second / 60f)

        val acc1 = computeAccountTelemetry(Account.SHLOKSHAH412, currentMinsOfDay)
        val acc2 = computeAccountTelemetry(Account.PCGPT, currentMinsOfDay)

        val rec = computeRecommendation(acc1, acc2, taskMode)

        return DashboardTelemetry(
            currentISTTime = now.format(TIME_FORMATTER),
            acc1 = acc1,
            acc2 = acc2,
            recommendation = rec
        )
    }

    private fun computeAccountTelemetry(account: Account, currentMinsOfDay: Float): AccountTelemetry {
        val pings = SCHEDULE.filter { it.account == account }

        var elapsedSinceRecent = Float.MAX_VALUE
        for (p in pings) {
            var diff = currentMinsOfDay - p.minsOfDay
            if (diff < 0) diff += 1440
            if (diff < elapsedSinceRecent) {
                elapsedSinceRecent = diff
            }
        }

        var nextPing = pings.first()
        var minsUntilNext = Float.MAX_VALUE
        for (p in pings) {
            var diff = p.minsOfDay - currentMinsOfDay
            if (diff < 0) diff += 1440
            if (diff < minsUntilNext) {
                minsUntilNext = diff
                nextPing = p
            }
        }

        val isActive = elapsedSinceRecent < WINDOW_DURATION_MINS
        val minsLeft = if (isActive) (WINDOW_DURATION_MINS - elapsedSinceRecent).toInt() else 0
        val percent = ((minsLeft.toFloat() / WINDOW_DURATION_MINS) * 100).toInt().coerceIn(0, 100)

        return AccountTelemetry(
            account = account,
            isActive = isActive,
            minsLeftInWindow = minsLeft,
            minsUntilNextPing = minsUntilNext.toInt(),
            nextPingDisplay = nextPing.displayTime,
            percentLeft = percent
        )
    }

    private fun computeRecommendation(
        acc1: AccountTelemetry,
        acc2: AccountTelemetry,
        taskMode: TaskMode
    ): Recommendation {
        val nextOverall = if (acc1.minsUntilNextPing < acc2.minsUntilNextPing) acc1 else acc2
        val nextResetText = "Reset in ${formatDuration(nextOverall.minsUntilNextPing)}"

        var target = Account.SHLOKSHAH412
        var reason = ""

        if (taskMode == TaskMode.QUICK) {
            if (acc1.isActive && acc2.isActive) {
                if (acc2.minsLeftInWindow in 1..90 && acc1.minsLeftInWindow > 90) {
                    target = Account.PCGPT
                    reason = "pcgpt resets in ${formatDuration(acc2.minsLeftInWindow)}. Best for quick questions before limit resets."
                } else if (acc1.minsLeftInWindow in 1..90 && acc2.minsLeftInWindow > 90) {
                    target = Account.SHLOKSHAH412
                    reason = "shlokshah412 resets in ${formatDuration(acc1.minsLeftInWindow)}. Best for quick questions before limit resets."
                } else if (acc1.minsLeftInWindow <= acc2.minsLeftInWindow) {
                    target = Account.SHLOKSHAH412
                    reason = "shlokshah412 resets soonest (${formatDuration(acc1.minsLeftInWindow)} left). Ideal for quick queries."
                } else {
                    target = Account.PCGPT
                    reason = "pcgpt resets soonest (${formatDuration(acc2.minsLeftInWindow)} left). Ideal for quick queries."
                }
            } else if (acc1.isActive) {
                target = Account.SHLOKSHAH412
                reason = "shlokshah412 is active (${formatDuration(acc1.minsLeftInWindow)} remaining)."
            } else if (acc2.isActive) {
                target = Account.PCGPT
                reason = "pcgpt is active (${formatDuration(acc2.minsLeftInWindow)} remaining)."
            } else {
                target = if (acc1.minsUntilNextPing <= acc2.minsUntilNextPing) Account.SHLOKSHAH412 else Account.PCGPT
                reason = "Both accounts idle; ${target.username} pings next in ${formatDuration(if (target == Account.SHLOKSHAH412) acc1.minsUntilNextPing else acc2.minsUntilNextPing)}."
            }
        } else {
            if (acc1.isActive && !acc2.isActive) {
                target = Account.SHLOKSHAH412
                reason = "shlokshah412 has ${formatDuration(acc1.minsLeftInWindow)} remaining (highest available limit)."
            } else if (!acc1.isActive && acc2.isActive) {
                target = Account.PCGPT
                reason = "pcgpt has ${formatDuration(acc2.minsLeftInWindow)} remaining (highest available limit)."
            } else if (acc1.isActive && acc2.isActive) {
                if (acc1.minsLeftInWindow >= acc2.minsLeftInWindow) {
                    target = Account.SHLOKSHAH412
                    reason = "shlokshah412 has the freshest limit (${formatDuration(acc1.minsLeftInWindow)} left vs ${formatDuration(acc2.minsLeftInWindow)} on pcgpt)."
                } else {
                    target = Account.PCGPT
                    reason = "pcgpt has the freshest limit (${formatDuration(acc2.minsLeftInWindow)} left vs ${formatDuration(acc1.minsLeftInWindow)} on shlokshah412)."
                }
            } else {
                target = if (acc1.minsUntilNextPing <= acc2.minsUntilNextPing) Account.SHLOKSHAH412 else Account.PCGPT
                reason = "Both idle; ${target.username} pings next in ${formatDuration(if (target == Account.SHLOKSHAH412) acc1.minsUntilNextPing else acc2.minsUntilNextPing)}."
            }
        }

        val badge = if (target == Account.SHLOKSHAH412) "RECOMMENDED: SHLOKSHAH412" else "RECOMMENDED: PCGPT"
        val title = "Use ${target.username}"

        return Recommendation(
            account = target,
            badgeLabel = badge,
            title = title,
            reason = reason,
            nextResetText = nextResetText
        )
    }
}
