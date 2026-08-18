package com.example.claudepulse.model

enum class Account(val id: Int, val username: String, val themeColorHex: Long) {
    SHLOKSHAH412(1, "shlokshah412", 0xFF00F2FE),
    PCGPT(2, "pcgpt", 0xFFC084FC)
}

enum class TaskMode(val title: String) {
    QUICK("Quick Query"),
    DEEP("Deep Work")
}

data class ScheduleNode(
    val id: String,
    val account: Account,
    val hour: Int,
    val minute: Int,
    val minsOfDay: Int,
    val displayTime: String,
    val tag: String
)

data class AccountTelemetry(
    val account: Account,
    val isActive: Boolean,
    val minsLeftInWindow: Int,
    val minsUntilNextPing: Int,
    val nextPingDisplay: String,
    val percentLeft: Int
)

data class Recommendation(
    val account: Account,
    val badgeLabel: String,
    val title: String,
    val reason: String,
    val nextResetText: String
)

data class DashboardTelemetry(
    val currentISTTime: String,
    val acc1: AccountTelemetry,
    val acc2: AccountTelemetry,
    val recommendation: Recommendation
)
