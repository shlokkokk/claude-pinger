package com.example.claudepulse.ui

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.AllInclusive
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.claudepulse.core.CloudflareApiService
import com.example.claudepulse.core.TelemetryCalculator
import com.example.claudepulse.model.Account
import com.example.claudepulse.model.DashboardTelemetry
import com.example.claudepulse.model.ScheduleNode
import com.example.claudepulse.model.TaskMode
import com.example.claudepulse.ui.components.BrandLogoIcon
import com.example.claudepulse.ui.components.OrbitProgressRing
import com.example.claudepulse.ui.components.TimelineView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen() {
    val context = LocalContext.current
    val view = LocalView.current
    val scope = rememberCoroutineScope()

    var taskMode by remember { mutableStateOf(TaskMode.QUICK) }
    var telemetry by remember { mutableStateOf(TelemetryCalculator.calculate(taskMode)) }
    var selectedNode by remember { mutableStateOf<ScheduleNode?>(null) }
    val logs = remember { mutableStateListOf("[System] Autopilot active on Cloudflare") }

    var isPinging by remember { mutableStateOf(false) }
    var pingDialogTarget by remember { mutableStateOf<Account?>(null) }
    var isPingAllDialog by remember { mutableStateOf(false) }
    var launchDialogAccount by remember { mutableStateOf<Account?>(null) }
    var diagnosticDialogResult by remember { mutableStateOf<String?>(null) }
    var isCheckingDiagnostics by remember { mutableStateOf(false) }

    // Live clock ticker
    LaunchedEffect(taskMode) {
        while (true) {
            telemetry = TelemetryCalculator.calculate(taskMode)
            delay(1000)
        }
    }

    Scaffold(
        containerColor = Color(0xFF07080C)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 14.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            val openWebDashboard: () -> Unit = {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://claude-pinger.claude-pinger.workers.dev")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            }

            // 1. BRAND HEADER
            HeaderSection(
                timeDisplay = telemetry.currentISTTime,
                onOpenWebDashboard = openWebDashboard
            )

            // 2. TASK INTENT SWITCHER
            TaskModeSwitcher(
                currentMode = taskMode,
                onModeSelected = {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    taskMode = it
                }
            )

            // 3. HERO RECOMMENDATION CARD
            HeroRecommendationCard(
                telemetry = telemetry,
                onLaunch = { launchDialogAccount = telemetry.recommendation.account }
            )

            // 4. DUAL ACCOUNTS STREAMLINED CARDS
            DualAccountsSection(
                telemetry = telemetry,
                onLaunch = { launchDialogAccount = it },
                onPing = { pingDialogTarget = it }
            )

            // 5. MANUAL PING CONTROLS (DISTINCT CUSTOM ICONS)
            ManualPingConsole(
                isPinging = isPinging,
                logs = logs,
                onPingAccount = { pingDialogTarget = it },
                onPingBoth = { isPingAllDialog = true },
                onTestWiring = {
                    scope.launch {
                        isCheckingDiagnostics = true
                        diagnosticDialogResult = null
                        val res = CloudflareApiService.checkHealth()
                        isCheckingDiagnostics = false
                        diagnosticDialogResult = if (res.healthy) {
                            "Cloudflare Edge: ONLINE (${res.latencyMs}ms)\n${res.details}"
                        } else {
                            "Diagnostic Error (${res.latencyMs}ms): ${res.details}"
                        }
                        logs.add("[System] Diagnostic: ${if (res.healthy) "Online (${res.latencyMs}ms)" else "Failed"}")
                    }
                }
            )

            // 6. 24-HOUR PING SCHEDULE & MATRIX LIST
            ScheduleMatrixSection(
                telemetry = telemetry,
                selectedNode = selectedNode,
                onSelectNode = { selectedNode = it }
            )

            // FOOTER & WEB DASHBOARD SHORTCUT
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0x0DFFFFFF))
                        .border(1.dp, Color(0x2600F2FE), RoundedCornerShape(20.dp))
                        .clickable { openWebDashboard() }
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Language, contentDescription = null, tint = Color(0xFF00F2FE), modifier = Modifier.size(14.dp))
                        Text("Open Web Dashboard", color = Color(0xFF00F2FE), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Text(
                    text = "Claude Pulse • shlokshah412 & pcgpt 2.5h Staggered Engine",
                    color = Color(0xFF64748B),
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            }
        }
    }

    // CONFIRMATION DIALOG: PING SINGLE ACCOUNT
    if (pingDialogTarget != null) {
        val acc = pingDialogTarget!!
        AlertDialog(
            onDismissRequest = { pingDialogTarget = null },
            title = { Text("Ping ${acc.username}?", fontWeight = FontWeight.Bold) },
            text = { Text("Sends a 1-character keep-alive message (.) via Browserless to refresh your 5-hour limit window on Claude.") },
            confirmButton = {
                Button(
                    onClick = {
                        val target = acc
                        pingDialogTarget = null
                        scope.launch {
                            isPinging = true
                            logs.add("[System] Dispatching ping for ${target.username}...")
                            val res = CloudflareApiService.triggerPing(target.id)
                            isPinging = false
                            if (res.success) {
                                logs.add("[Success] ${target.username} ➔ ${res.message}")
                            } else {
                                logs.add("[Error] ${target.username} ➔ ${res.message}")
                            }
                            telemetry = TelemetryCalculator.calculate(taskMode)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(acc.themeColorHex))
                ) {
                    Text("Send Ping", color = Color(0xFF07080C), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { pingDialogTarget = null }) { Text("Cancel", color = Color(0xFF94A3B8)) }
            },
            containerColor = Color(0xFF0F131D)
        )
    }

    // CONFIRMATION DIALOG: PING BOTH
    if (isPingAllDialog) {
        AlertDialog(
            onDismissRequest = { isPingAllDialog = false },
            title = { Text("Ping Both Accounts?", fontWeight = FontWeight.Bold) },
            text = { Text("Dispatches keep-alive sessions for shlokshah412 and pcgpt simultaneously to refresh both 5-hour limits.") },
            confirmButton = {
                Button(
                    onClick = {
                        isPingAllDialog = false
                        scope.launch {
                            isPinging = true
                            logs.add("[System] Dispatching ping for Both Accounts...")
                            val res = CloudflareApiService.triggerPing(null)
                            isPinging = false
                            if (res.success) {
                                logs.add("[Success] Both Accounts ➔ ${res.message}")
                            } else {
                                logs.add("[Error] Ping ➔ ${res.message}")
                            }
                            telemetry = TelemetryCalculator.calculate(taskMode)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F2FE))
                ) {
                    Text("Send Ping to Both", color = Color(0xFF07080C), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { isPingAllDialog = false }) { Text("Cancel", color = Color(0xFF94A3B8)) }
            },
            containerColor = Color(0xFF0F131D)
        )
    }

    // LAUNCH CLAUDE CONFIRMATION DIALOG
    if (launchDialogAccount != null) {
        val acc = launchDialogAccount!!
        AlertDialog(
            onDismissRequest = { launchDialogAccount = null },
            title = { Text("Open Claude as ${acc.username}", fontWeight = FontWeight.Bold) },
            text = { Text("Ensure your active browser profile or Claude app is signed into ${acc.username}.") },
            confirmButton = {
                Button(
                    onClick = {
                        launchDialogAccount = null
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://claude.ai")).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK
                        }
                        context.startActivity(intent)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(acc.themeColorHex))
                ) {
                    Text("Open Claude.ai", color = Color(0xFF07080C), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { launchDialogAccount = null }) { Text("Cancel", color = Color(0xFF94A3B8)) }
            },
            containerColor = Color(0xFF0F131D)
        )
    }

    // DIAGNOSTIC RESULTS DIALOG
    if (isCheckingDiagnostics || diagnosticDialogResult != null) {
        AlertDialog(
            onDismissRequest = { diagnosticDialogResult = null },
            title = { Text("Connection & Diagnostics", fontWeight = FontWeight.Bold) },
            text = {
                if (isCheckingDiagnostics) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color(0xFF00F2FE))
                        Text("Checking live Cloudflare Edge and Browserless...")
                    }
                } else {
                    Text(diagnosticDialogResult ?: "")
                }
            },
            confirmButton = {
                if (!isCheckingDiagnostics) {
                    Button(onClick = { diagnosticDialogResult = null }) { Text("Close") }
                }
            },
            containerColor = Color(0xFF0F131D)
        )
    }
}

@Composable
private fun HeaderSection(
    timeDisplay: String,
    onOpenWebDashboard: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0.35f,
        animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse),
        label = "pulseAlpha"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.clickable { onOpenWebDashboard() },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            BrandLogoIcon(size = 42.dp)
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(
                    text = "Claude Pulse",
                    color = Color.White,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = (-0.03).sp
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "shlokshah412",
                        color = Color(0xFF00F2FE),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "•",
                        color = Color(0xFF64748B),
                        fontSize = 11.sp
                    )
                    Text(
                        text = "pcgpt",
                        color = Color(0xFFC084FC),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        // Live Clock Pill
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF10141F))
                .border(1.dp, Color(0x26FFFFFF), RoundedCornerShape(20.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .alpha(alpha)
                        .clip(CircleShape)
                        .background(Color(0xFF10B981))
                )
                Text(
                    text = timeDisplay,
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
private fun TaskModeSwitcher(
    currentMode: TaskMode,
    onModeSelected: (TaskMode) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF0D1017))
            .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(14.dp))
            .padding(3.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Quick Query
            val isQuick = currentMode == TaskMode.QUICK
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(11.dp))
                    .background(if (isQuick) Color(0x1F10B981) else Color.Transparent)
                    .border(
                        1.dp,
                        if (isQuick) Color(0x4D10B981) else Color.Transparent,
                        RoundedCornerShape(11.dp)
                    )
                    .clickable { onModeSelected(TaskMode.QUICK) }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        tint = if (isQuick) Color(0xFF34D399) else Color(0xFF64748B),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Quick Query",
                        color = if (isQuick) Color(0xFF34D399) else Color(0xFF64748B),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Deep Work
            val isDeep = currentMode == TaskMode.DEEP
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(11.dp))
                    .background(if (isDeep) Color(0x1F00F2FE) else Color.Transparent)
                    .border(
                        1.dp,
                        if (isDeep) Color(0x4D00F2FE) else Color.Transparent,
                        RoundedCornerShape(11.dp)
                    )
                    .clickable { onModeSelected(TaskMode.DEEP) }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Layers,
                        contentDescription = null,
                        tint = if (isDeep) Color(0xFF00F2FE) else Color(0xFF64748B),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Deep Work",
                        color = if (isDeep) Color(0xFF00F2FE) else Color(0xFF64748B),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun HeroRecommendationCard(
    telemetry: DashboardTelemetry,
    onLaunch: () -> Unit
) {
    val rec = telemetry.recommendation
    val isAcc1 = rec.account == Account.SHLOKSHAH412
    val accentColor = if (isAcc1) Color(0xFF00F2FE) else Color(0xFFC084FC)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F131D)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isAcc1) Color(0x2400F2FE) else Color(0x24C084FC))
                        .border(1.dp, if (isAcc1) Color(0x5900F2FE) else Color(0x59C084FC), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "USE ${rec.account.username.uppercase()}",
                        color = accentColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.5.sp
                    )
                }

                Text(
                    text = rec.nextResetText,
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Text(
                text = rec.title,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = (-0.02).sp
            )

            Text(
                text = rec.reason,
                color = Color(0xFF94A3B8),
                fontSize = 12.sp,
                lineHeight = 17.sp
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Frosted Gradient Launch Button
            Button(
                onClick = onLaunch,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isAcc1) Color(0x2600F2FE) else Color(0x26C084FC)
                ),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isAcc1) Color(0x5900F2FE) else Color(0x59C084FC)
                )
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.OpenInNew,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(15.dp)
                    )
                    Text(
                        text = "Open Claude as ${rec.account.username}",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun DualAccountsSection(
    telemetry: DashboardTelemetry,
    onLaunch: (Account) -> Unit,
    onPing: (Account) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Account 1: shlokshah412
        StreamlinedAccountCard(
            account = Account.SHLOKSHAH412,
            telemetry = telemetry.acc1,
            onLaunch = { onLaunch(Account.SHLOKSHAH412) },
            onPing = { onPing(Account.SHLOKSHAH412) }
        )

        // Account 2: pcgpt
        StreamlinedAccountCard(
            account = Account.PCGPT,
            telemetry = telemetry.acc2,
            onLaunch = { onLaunch(Account.PCGPT) },
            onPing = { onPing(Account.PCGPT) }
        )
    }
}

@Composable
private fun StreamlinedAccountCard(
    account: Account,
    telemetry: com.example.claudepulse.model.AccountTelemetry,
    onLaunch: () -> Unit,
    onPing: () -> Unit
) {
    val isAcc1 = account == Account.SHLOKSHAH412
    val accentColor = if (isAcc1) Color(0xFF00F2FE) else Color(0xFFC084FC)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F131D)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF))
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header row with username and status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(modifier = Modifier.size(7.dp).clip(CircleShape).background(accentColor))
                    Text(
                        text = account.username,
                        color = accentColor,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (telemetry.isActive) Color(0x1F10B981) else Color(0x14FFFFFF))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (telemetry.isActive) "ACTIVE" else "IDLE",
                        color = if (telemetry.isActive) Color(0xFF10B981) else Color(0xFF94A3B8),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Gauges & remaining time
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OrbitProgressRing(
                        account = account,
                        percentLeft = telemetry.percentLeft,
                        isActive = telemetry.isActive,
                        size = 46.dp
                    )

                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(
                            text = if (telemetry.isActive) "${TelemetryCalculator.formatDuration(telemetry.minsLeftInWindow)} Left" else "0m Left",
                            color = Color(0xFFF8FAFC),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = "Next: ${telemetry.nextPingDisplay}",
                            color = Color(0xFF64748B),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                // Quick Action Buttons
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(
                        onClick = onLaunch,
                        modifier = Modifier.height(36.dp),
                        shape = RoundedCornerShape(9.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0x0DFFFFFF)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF)),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(imageVector = Icons.AutoMirrored.Filled.OpenInNew, contentDescription = null, tint = Color.White, modifier = Modifier.size(13.dp))
                            Text("Launch", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedButton(
                        onClick = onPing,
                        modifier = Modifier.height(36.dp),
                        shape = RoundedCornerShape(9.dp),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color(0x0DFFFFFF)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF)),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Sensors, contentDescription = null, tint = accentColor, modifier = Modifier.size(13.dp))
                            Text("Ping", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ManualPingConsole(
    isPinging: Boolean,
    logs: List<String>,
    onPingAccount: (Account) -> Unit,
    onPingBoth: () -> Unit,
    onTestWiring: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F131D)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF))
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(imageVector = Icons.Default.Terminal, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                    Text("Manual Ping Controls", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
                }

                Text(
                    text = if (isPinging) "Pinging..." else "Ready",
                    color = if (isPinging) Color(0xFFF59E0B) else Color(0xFF10B981),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }

            // Diagnostic Status Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0x0AFFFFFF))
                    .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF10B981)))
                    Text("Cloudflare Online", color = Color(0xFF10B981), fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0x14FFFFFF))
                        .border(1.dp, Color(0x26FFFFFF), RoundedCornerShape(8.dp))
                        .clickable { onTestWiring() }
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = Color.White, modifier = Modifier.size(11.dp))
                        Text("Test Wiring", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // 3 Action Buttons with DISTINCT CUSTOM ICONS
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Ping shlokshah412 (Person / User icon)
                PingActionButton(
                    modifier = Modifier.weight(1f),
                    title = "shlokshah412",
                    sub = "Account 1",
                    icon = Icons.Default.Person,
                    color = Color(0xFF00F2FE),
                    onClick = { onPingAccount(Account.SHLOKSHAH412) }
                )

                // Ping pcgpt (Computer / Terminal icon)
                PingActionButton(
                    modifier = Modifier.weight(1f),
                    title = "pcgpt",
                    sub = "Account 2",
                    icon = Icons.Default.Computer,
                    color = Color(0xFFC084FC),
                    onClick = { onPingAccount(Account.PCGPT) }
                )

                // Ping Both (Sync / All Inclusive icon)
                PingActionButton(
                    modifier = Modifier.weight(1f),
                    title = "Both",
                    sub = "All Accounts",
                    icon = Icons.Default.Sync,
                    color = Color.White,
                    onClick = onPingBoth
                )
            }

            // Live Log Drawer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF07090F))
                    .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(10.dp))
                    .padding(10.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    logs.takeLast(4).forEach { log ->
                        Text(
                            text = log,
                            color = if (log.contains("[Error]")) Color(0xFFEF4444) else if (log.contains("[Success]")) Color(0xFF10B981) else Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PingActionButton(
    modifier: Modifier = Modifier,
    title: String,
    sub: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(72.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0x0DFFFFFF))
            .border(1.dp, Color(0x1AFFFFFF), RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            Text(text = title, color = color, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
            Text(text = sub, color = Color(0xFF64748B), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
private fun ScheduleMatrixSection(
    telemetry: DashboardTelemetry,
    selectedNode: ScheduleNode?,
    onSelectNode: (ScheduleNode?) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F131D)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x26FFFFFF))
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(imageVector = Icons.Default.Schedule, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                    Text("24h Ping Schedule", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
                }

                Text("+2m Buffer", color = Color(0xFF64748B), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
            }

            // Interactive Inspect Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF131722))
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (selectedNode != null) {
                        val isAcc1 = selectedNode.account == Account.SHLOKSHAH412
                        val pillColor = if (isAcc1) Color(0xFF00F2FE) else Color(0xFFC084FC)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(5.dp))
                                    .background(if (isAcc1) Color(0x2600F2FE) else Color(0x26C084FC))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(selectedNode.account.username, color = pillColor, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, fontFamily = FontFamily.Monospace)
                            }
                            Text(selectedNode.displayTime, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                        }

                        Text(selectedNode.tag, color = Color(0xFF94A3B8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(5.dp))
                                    .background(Color(0x26FFFFFF))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("LIVE NOW", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, fontFamily = FontFamily.Monospace)
                            }
                            Text(telemetry.currentISTTime, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                        }

                        Text(telemetry.recommendation.nextResetText, color = Color(0xFF94A3B8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            // Dual Lane Tracks
            TimelineView(
                selectedNode = selectedNode,
                onSelectNode = onSelectNode
            )

            // 8-Item Schedule Matrix Table (Strict Uniform 3-Column Rows)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                TelemetryCalculator.SCHEDULE.forEach { item ->
                    val isAcc1 = item.account == Account.SHLOKSHAH412
                    val isSelected = selectedNode?.id == item.id
                    val dotColor = if (isAcc1) Color(0xFF00F2FE) else Color(0xFFC084FC)

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(42.dp)
                            .clip(RoundedCornerShape(11.dp))
                            .background(if (isSelected) Color(0x1F22D3EE) else Color(0x08FFFFFF))
                            .border(
                                1.dp,
                                if (isSelected) dotColor else Color(0x1AFFFFFF),
                                RoundedCornerShape(11.dp)
                            )
                            .clickable {
                                if (isSelected) onSelectNode(null) else onSelectNode(item)
                            }
                            .padding(horizontal = 12.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Column 1: Time (80dp fixed)
                            Text(
                                text = item.displayTime,
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.width(82.dp)
                            )

                            // Column 2: Account Badge (110dp fixed)
                            Row(
                                modifier = Modifier.width(115.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(dotColor))
                                Text(
                                    text = item.account.username,
                                    color = dotColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            // Column 3: Buffer & Tag (Weight 1f, right-aligned, single line)
                            Row(
                                modifier = Modifier.weight(1f),
                                horizontalArrangement = Arrangement.End,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(5.dp))
                                        .background(Color(0x1F10B981))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text("+2m", color = Color(0xFF10B981), fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = item.tag,
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
