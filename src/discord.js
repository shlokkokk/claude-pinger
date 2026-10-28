// Claude Pulse • Discord Bot & Interactions Engine
// Clean, industrial DevOps aesthetic — zero AI-slop emojis.

/**
 * Verify cryptographic Ed25519 signature from Discord.
 */
export async function verifyDiscordSignature(pubKeyHex, sigHex, timestamp, body) {
  if (!pubKeyHex || !sigHex || !timestamp || !body) return false;
  try {
    const enc = new TextEncoder();
    const keyBuf = Uint8Array.from(pubKeyHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    const sigBuf = Uint8Array.from(sigHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    const msgBuf = enc.encode(timestamp + body);
    const key = await crypto.subtle.importKey('raw', keyBuf, { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, sigBuf, msgBuf);
  } catch (err) {
    console.warn('[Discord] Verification exception:', err.message);
    return false;
  }
}

/**
 * Standard Palette:
 * - Emerald Green (Success): 0x10b981
 * - Warm Amber (Warning / Retry): 0xf59e0b
 * - Muted Rose (Error / Expired): 0xef4444
 * - Cyan Accent (Telemetry / Neutral): 0x06b6d4
 */
export const DISCORD_COLORS = {
  SUCCESS: 0x10b981,
  WARNING: 0xf59e0b,
  ERROR: 0xef4444,
  TELEMETRY: 0x06b6d4,
  MUTED: 0x64748b
};

const BASE_DASHBOARD_URL = 'https://claude-pinger.claude-pinger.workers.dev';
const CLAUDE_ICON_URL = 'https://raw.githubusercontent.com/shlokkokk/claude-pinger/main/claude-pulse-icon-512.png';

/**
 * Build System Telemetry Card with interactive control buttons.
 */
export function buildTelemetryEmbed(accounts, region, queueCounts, schedulerStatus) {
  const nowSec = Math.floor(Date.now() / 1000);
  const resetSec = nowSec + (5 * 3600) + (2 * 60);

  const accountFields = accounts.map(a => ({
    name: `Account: ${a.name} [ID #${a.id}]`,
    value: `Key: \`valid (${a.keyLength || 131}B)\` • Cooldown: \`5h 02m\` • Theme: \`${a.themeColor || '#00f2fe'}\``,
    inline: false
  }));

  const fields = [
    ...accountFields,
    {
      name: 'Edge Node',
      value: `\`${region || 'BOM'}\` (Cloudflare Global)`,
      inline: true
    },
    {
      name: 'Task Scheduler',
      value: schedulerStatus?.hasActiveAlarm ? `\`Active\` (<t:${Math.floor(schedulerStatus.earliestTimestamp / 1000)}:R>)` : '`Idle / Cron Standby`',
      inline: true
    },
    {
      name: 'Queue Depth',
      value: `\`${queueCounts?.active || 0}\` active • \`${queueCounts?.completed || 0}\` history`,
      inline: true
    },
    {
      name: 'Rolling Window Reset',
      value: `<t:${resetSec}:R> (<t:${resetSec}:t>)`,
      inline: false
    }
  ];

  return {
    author: {
      name: 'Claude Pulse • System Telemetry',
      url: BASE_DASHBOARD_URL,
      icon_url: CLAUDE_ICON_URL
    },
    title: 'Edge Control Deck',
    description: 'Autonomous keep-alive autopilot and precision queue telemetry.',
    color: DISCORD_COLORS.TELEMETRY,
    fields: fields,
    footer: {
      text: 'Claude Pulse • Cloudflare Workers • Precision SQLite DO',
      icon_url: CLAUDE_ICON_URL
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build Control Deck Action Rows (Buttons).
 * Non-redundant:
 * - Dynamic ping buttons for configured accounts
 * - Queue controls (Run Next, Clear History, Refresh)
 * - Link buttons (Dashboard, API Health)
 */
export function buildControlComponents(accounts, hasQueuedTasks = false) {
  const selectMenuRow = {
    type: 1,
    components: [
      {
        type: 3, // String Select Menu with checkboxes
        custom_id: 'select_ping_accounts',
        placeholder: 'Select accounts to ping...',
        min_values: 1,
        max_values: accounts.length + 1,
        options: [
          {
            label: 'All Accounts',
            value: 'all',
            description: `Ping all ${accounts.length} configured accounts simultaneously`
          },
          ...accounts.map(a => ({
            label: a.name,
            value: String(a.id),
            description: `Account #${a.id} • Session Key Configured`
          }))
        ]
      }
    ]
  };

  const queueButtons = [
    {
      type: 2,
      style: 1, // Primary (Blurple)
      label: 'Schedule Task',
      custom_id: 'open_schedule_modal'
    },
    {
      type: 2,
      style: 3, // Success (Green)
      label: 'Force Run Next',
      custom_id: 'force_run_next',
      disabled: !hasQueuedTasks
    },
    {
      type: 2,
      style: 2, // Secondary (Grey)
      label: 'Prune Chats',
      custom_id: 'prune_stale_chats'
    },
    {
      type: 2,
      style: 2, // Secondary (Grey)
      label: 'Clear History',
      custom_id: 'clear_history'
    },
    {
      type: 2,
      style: 2, // Secondary (Grey)
      label: 'Refresh',
      custom_id: 'refresh_status'
    }
  ];

  const linkButtons = [
    {
      type: 2,
      style: 5, // Link
      label: 'Web Dashboard',
      url: BASE_DASHBOARD_URL
    },
    {
      type: 2,
      style: 5, // Link
      label: 'API Health',
      url: `${BASE_DASHBOARD_URL}/api/health`
    }
  ];

  return [
    selectMenuRow,
    { type: 1, components: queueButtons },
    { type: 1, components: linkButtons }
  ];
}

/**
 * Build Queue List Embed.
 */
export function buildQueueEmbed(allTasksByAccount, accounts) {
  const activeTasks = [];
  const completedTasks = [];

  for (const acc of accounts) {
    const tasks = allTasksByAccount[acc.id] || [];
    for (const t of tasks) {
      if (t.status === 'queued') activeTasks.push({ ...t, accountName: acc.name });
      else completedTasks.push({ ...t, accountName: acc.name });
    }
  }

  let description = '';

  if (activeTasks.length === 0) {
    description += '**Active Queue:** `(empty)` — No tasks waiting.\n\n';
  } else {
    description += '**Active Scheduled Tasks:**\n';
    activeTasks.forEach((t, idx) => {
      const timeStr = t.targetTimestamp
        ? `<t:${Math.floor(t.targetTimestamp / 1000)}:t> (<t:${Math.floor(t.targetTimestamp / 1000)}:R>)`
        : `Slot #${t.targetSlot || 1}`;
      const shortPrompt = (t.prompt || 'continue').length > 60
        ? (t.prompt.substring(0, 57) + '...')
        : t.prompt;
      description += `\`[${idx + 1}]\` **${t.accountName}** • ${timeStr}\n`;
      description += `› Prompt: \`${shortPrompt}\`\n`;
      description += `› Chat: [${t.chatUrl.replace('https://claude.ai/', '')}](${t.chatUrl})\n\n`;
    });
  }

  if (completedTasks.length > 0) {
    description += `**Completed History:** \`${completedTasks.length}\` tasks archived. Tap **Clear History** to purge.`;
  }

  return {
    author: {
      name: 'Claude Pulse • Queue Manager',
      url: BASE_DASHBOARD_URL,
      icon_url: CLAUDE_ICON_URL
    },
    title: 'Overnight Task Autopilot Queue',
    description: description.trim(),
    color: activeTasks.length > 0 ? DISCORD_COLORS.TELEMETRY : 0x64748b,
    footer: {
      text: 'Claude Pulse • Cloudflare Edge Queue',
      icon_url: CLAUDE_ICON_URL
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build interactive card for a newly scheduled task with Snooze, Cascade, Edit Prompt, and Run Now buttons.
 */
export function buildTaskScheduledCard(task, account) {
  const tsSec = Math.floor((task.targetTimestamp || Date.now()) / 1000);
  const prompt = String(task.prompt || 'continue');
  const shortPrompt = prompt.length > 300 ? (prompt.substring(0, 297) + '...') : prompt;

  return {
    embed: {
      author: {
        name: 'Claude Pulse • Autopilot Scheduled',
        url: BASE_DASHBOARD_URL,
        icon_url: CLAUDE_ICON_URL
      },
      title: `[TASK SCHEDULED] ${account?.name || 'Account'}`,
      description: 'Task registered with precision edge Durable Object alarms.',
      color: DISCORD_COLORS.SUCCESS,
      fields: [
        {
          name: 'Account',
          value: `\`${account?.name || 'Account'}\` [ID #${account?.id || 1}]`,
          inline: true
        },
        {
          name: 'Scheduled Execution',
          value: `<t:${tsSec}:F> (<t:${tsSec}:R>)`,
          inline: true
        },
        {
          name: 'Target Chat',
          value: `\`${(task.chatUrl || '').replace('https://claude.ai/chat/', '')}\``,
          inline: false
        },
        {
          name: 'Prompt to Submit',
          value: `\`\`\`text\n${shortPrompt}\n\`\`\``,
          inline: false
        }
      ],
      footer: {
        text: `Task ID: ${task.id}`,
        icon_url: CLAUDE_ICON_URL
      },
      timestamp: new Date().toISOString()
    },
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2, // Secondary
            label: '+1h Snooze',
            custom_id: `snooze_task_${task.id}_1h`
          },
          {
            type: 2,
            style: 1, // Primary (Blurple)
            label: 'Edit Prompt',
            custom_id: `edit_prompt_${task.id}`
          },
          {
            type: 2,
            style: 3, // Success (Green)
            label: 'Run Now',
            custom_id: `force_run_task_${task.id}`
          },
          ...(task.chatUrl && task.chatUrl.startsWith('http') ? [{
            type: 2,
            style: 5,
            label: 'Open Claude Chat',
            url: task.chatUrl
          }] : [])
        ]
      }
    ]
  };
}

/**
 * Build clean card for a task that has executed or is running, stripping action buttons (+1h, +5h, Edit, Run Now).
 */
export function buildTaskExecutedCard(task, account, statusText = 'Executing immediately on edge worker...') {
  const prompt = String(task.prompt || 'continue');
  const shortPrompt = prompt.length > 300 ? (prompt.substring(0, 297) + '...') : prompt;

  return {
    embed: {
      author: {
        name: 'Claude Pulse • Autopilot Running',
        url: BASE_DASHBOARD_URL,
        icon_url: CLAUDE_ICON_URL
      },
      title: `[TASK RUNNING] ${account?.name || 'Account'}`,
      description: statusText,
      color: DISCORD_COLORS.TELEMETRY,
      fields: [
        {
          name: 'Account',
          value: `\`${account?.name || 'Account'}\` [ID #${account?.id || 1}]`,
          inline: true
        },
        {
          name: 'Status',
          value: '`Triggered • Execution In-Progress`',
          inline: true
        },
        ...(task.chatUrl ? [{
          name: 'Target Chat',
          value: `\`${task.chatUrl.replace('https://claude.ai/chat/', '')}\``,
          inline: false
        }] : []),
        {
          name: 'Prompt',
          value: `\`\`\`text\n${shortPrompt}\n\`\`\``,
          inline: false
        }
      ],
      footer: {
        text: `Task ID: ${task.id} • Action Controls Retired`,
        icon_url: CLAUDE_ICON_URL
      },
      timestamp: new Date().toISOString()
    },
    components: (task.chatUrl && task.chatUrl.startsWith('http')) ? [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Open Claude Chat',
            url: task.chatUrl
          },
          {
            type: 2,
            style: 5,
            label: 'Web Dashboard',
            url: BASE_DASHBOARD_URL
          }
        ]
      }
    ] : [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Web Dashboard',
            url: BASE_DASHBOARD_URL
          }
        ]
      }
    ]
  };
}

/**
 * Build card for an already-completed task when interaction buttons are pressed, showing controls retired.
 */
export function buildTaskCompletedDisabledCard(task, account) {
  return {
    embed: {
      author: {
        name: 'Claude Pulse • Autopilot Completed',
        url: BASE_DASHBOARD_URL,
        icon_url: CLAUDE_ICON_URL
      },
      title: `[TASK COMPLETED] ${account?.name || 'Account'}`,
      description: `Task \`${task.id}\` has already finished execution. Controls (+1h, +5h, Edit, Run Now) have been disabled.`,
      color: DISCORD_COLORS.SUCCESS,
      fields: [
        {
          name: 'Account',
          value: `\`${account?.name || 'Account'}\` [ID #${account?.id || 1}]`,
          inline: true
        },
        {
          name: 'Status',
          value: '`Completed • Controls Retired`',
          inline: true
        },
        ...(task.chatUrl ? [{
          name: 'Target Chat',
          value: `\`${task.chatUrl.replace('https://claude.ai/chat/', '')}\``,
          inline: false
        }] : [])
      ],
      footer: {
        text: `Task ID: ${task.id} • Already Completed`,
        icon_url: CLAUDE_ICON_URL
      },
      timestamp: new Date().toISOString()
    },
    components: (task.chatUrl && task.chatUrl.startsWith('http')) ? [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Open Claude Chat',
            url: task.chatUrl
          },
          {
            type: 2,
            style: 5,
            label: 'Web Dashboard',
            url: BASE_DASHBOARD_URL
          }
        ]
      }
    ] : []
  };
}

/**
 * Build Daily Morning Briefing / Executive Digest.
 */
export function buildDigestEmbed(accounts, queueMap = {}) {
  let totalQueued = 0;
  let totalHistory = 0;
  for (const list of Object.values(queueMap)) {
    for (const t of list) {
      if (t.status === 'queued') totalQueued++;
      else totalHistory++;
    }
  }

  const accountRows = accounts.map(a => {
    return `• **${a.name}**: \`Session Active\` • Theme: \`${a.themeColor || '#00f2fe'}\``;
  }).join('\n');

  return {
    author: {
      name: 'Claude Pulse • Daily Executive Digest',
      url: BASE_DASHBOARD_URL,
      icon_url: CLAUDE_ICON_URL
    },
    title: 'Autopilot Status & Rolling Limit Briefing',
    description: 'Summary of edge keep-alive telemetry and upcoming scheduled executions.',
    color: DISCORD_COLORS.TELEMETRY,
    fields: [
      {
        name: 'Account Health',
        value: accountRows || '`No accounts detected`',
        inline: false
      },
      {
        name: 'Queue Telemetry',
        value: `\`${totalQueued}\` pending tasks • \`${totalHistory}\` completed records`,
        inline: true
      },
      {
        name: 'Autopilot Engine',
        value: '`Precision DO Alarms Active`',
        inline: true
      },
      {
        name: 'Next Rolling Reset',
        value: `<t:${Math.floor(Date.now() / 1000) + 18120}:R>`,
        inline: false
      }
    ],
    footer: {
      text: 'Claude Pulse • Morning Briefing • Cloudflare Global',
      icon_url: CLAUDE_ICON_URL
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Build Contextual Alert Embed for Task Events.
 * Non-redundant buttons without double arrow icons:
 * - On success: Open Claude Chat, Web Dashboard, and [Force Run Next Task] only if more queued tasks exist.
 * - On failure: [Retry Execution], Open Claude Chat, Web Dashboard.
 * - On session expired: [Verify Session], Cloudflare Secrets, Web Dashboard.
 */
export function buildContextualAlert(type, { accountName, accountId, prompt, url, pageTitle, error, responseSnippet, fullResponse, hasMoreQueuedTasks, taskId }) {
  const shortName = accountName || `Account #${accountId || 1}`;
  const displayPrompt = String(prompt || 'continue');
  const safePrompt = displayPrompt.length > 350 ? (displayPrompt.substring(0, 347) + '...') : displayPrompt;

  let title = '';
  let description = '';
  let color = DISCORD_COLORS.SUCCESS;
  let fields = [];
  const components = [];
  const actionRow = [];

  if (type === 'task_completed') {
    title = `[TASK COMPLETED] ${shortName}`;
    color = DISCORD_COLORS.SUCCESS;
    description = 'Scheduled autopilot task was delivered to Claude web.';

    fields = [
      {
        name: 'Account',
        value: `\`${shortName}\` [ID #${accountId || 1}]`,
        inline: true
      },
      {
        name: 'Status',
        value: '`200 OK • Stream Completed`',
        inline: true
      },
      ...(pageTitle && !pageTitle.toLowerCase().includes('message submitted') ? [{
        name: 'Chat Title',
        value: `\`${pageTitle}\``,
        inline: false
      }] : []),
      {
        name: 'Submitted Prompt',
        value: `\`\`\`text\n${safePrompt}\n\`\`\``,
        inline: false
      },
      ...(responseSnippet ? [{
        name: 'Claude Response Preview',
        value: `>>> ${responseSnippet}`,
        inline: false
      }] : [])
    ];

    if (url && url.startsWith('http')) {
      actionRow.push({
        type: 2,
        style: 5,
        label: 'Open Claude Chat',
        url: url
      });
    }

    actionRow.push({
      type: 2,
      style: 5,
      label: 'Web Dashboard',
      url: BASE_DASHBOARD_URL
    });

    if (hasMoreQueuedTasks) {
      actionRow.push({
        type: 2,
        style: 1, // Primary
        label: 'Force Run Next Task',
        custom_id: 'force_run_next'
      });
    }
  } else if (type === 'task_failed') {
    title = `[TASK FAILED] ${shortName}`;
    color = DISCORD_COLORS.WARNING;
    description = 'Overnight autopilot execution encountered an issue. Routine keep-alive was triggered automatically to preserve the rolling limit.';

    fields = [
      {
        name: 'Account',
        value: `\`${shortName}\` [ID #${accountId || 1}]`,
        inline: true
      },
      {
        name: 'Status',
        value: '`Execution Failed`',
        inline: true
      },
      {
        name: 'Error Details',
        value: `\`${error || 'Failed to submit prompt'}\``,
        inline: false
      },
      {
        name: 'Prompt Attempted',
        value: `\`\`\`text\n${safePrompt}\n\`\`\``,
        inline: false
      }
    ];

    actionRow.push({
      type: 2,
      style: 4, // Danger
      label: 'Retry Execution',
      custom_id: `retry_task_${taskId || 'latest'}`
    });

    if (url && url.startsWith('http')) {
      actionRow.push({
        type: 2,
        style: 5,
        label: 'Open Claude Chat',
        url: url
      });
    }

    actionRow.push({
      type: 2,
      style: 5,
      label: 'Web Dashboard',
      url: BASE_DASHBOARD_URL
    });
  } else if (type === 'session_expired') {
    title = `[SESSION EXPIRED] ${shortName}`;
    color = DISCORD_COLORS.ERROR;
    description = `The authentication session key for **${shortName}** is expired or revoked.`;

    fields = [
      {
        name: 'Account',
        value: `\`${shortName}\` [ID #${accountId || 1}]`,
        inline: true
      },
      {
        name: 'Auth Status',
        value: '`401 Unauthorized`',
        inline: true
      },
      {
        name: 'Impact',
        value: '`Autopilot Paused`',
        inline: true
      },
      {
        name: 'Step 1: Copy Fresh Session Key',
        value: 'Open [claude.ai](https://claude.ai) in your browser → Press `F12` → **Application** tab → **Cookies** → Copy the `sessionKey` cookie value.',
        inline: false
      },
      {
        name: 'Step 2: Save in Cloudflare Secrets',
        value: `Terminal command:\n\`\`\`bash\nnpx wrangler secret put CLAUDE_SESSION_KEY_${accountId || 1}\n\`\`\`\nOr edit online in [Cloudflare Dashboard](https://dash.cloudflare.com).`,
        inline: false
      },
      {
        name: 'Step 3: Resume Autopilot',
        value: 'Tap **Verify Session** below. The edge worker will validate your token and automatically resume scheduled prompts.',
        inline: false
      }
    ];

    actionRow.push({
      type: 2,
      style: 1, // Primary (Blurple)
      label: 'Update Session Key',
      custom_id: `open_session_modal_${accountId || 1}`
    });

    actionRow.push({
      type: 2,
      style: 2, // Secondary
      label: 'Verify Session',
      custom_id: `verify_session_${accountId || 1}`
    });

    actionRow.push({
      type: 2,
      style: 5,
      label: 'Cloudflare Secrets',
      url: 'https://dash.cloudflare.com'
    });

    actionRow.push({
      type: 2,
      style: 5,
      label: 'Web Dashboard',
      url: BASE_DASHBOARD_URL
    });
  } else {
    title = `[SYSTEM NOTICE] ${shortName}`;
    color = DISCORD_COLORS.WARNING;
    description = error || 'Scheduler alert.';
    fields = [
      { name: 'Notice', value: `\`${error || 'Edge notice'}\``, inline: false }
    ];
    actionRow.push({
      type: 2,
      style: 5,
      label: 'Web Dashboard',
      url: BASE_DASHBOARD_URL
    });
  }

  if (actionRow.length > 0) {
    components.push({ type: 1, components: actionRow });
  }

  return {
    embed: {
      author: {
        name: 'Claude Pulse • Edge Alert',
        url: BASE_DASHBOARD_URL,
        icon_url: CLAUDE_ICON_URL
      },
      title: title,
      description: description,
      fields: fields,
      color: color,
      footer: {
        text: `Claude Pulse • ${shortName}`,
        icon_url: CLAUDE_ICON_URL
      },
      timestamp: new Date().toISOString()
    },
    components: components
  };
}

/**
 * Handle incoming Discord HTTP Interactions from /api/discord/interactions.
 */
export async function handleDiscordInteractions(request, env, ctx, helpers) {
  const pubKey = env.DISCORD_PUBLIC_KEY;
  if (!pubKey) {
    return new Response(JSON.stringify({ error: 'DISCORD_PUBLIC_KEY is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const sig = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const rawBody = await request.text();

  const isValid = await verifyDiscordSignature(pubKey, sig, timestamp, rawBody);
  if (!isValid) {
    return new Response('Invalid request signature', { status: 401 });
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new Response('Malformed JSON', { status: 400 });
  }

  // 1. Handle Discord PING check (type 1)
  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const accounts = helpers.getAllAccounts(env);
  if (env.TASK_QUEUE) {
    for (const a of accounts) {
      try {
        const kvKey = await env.TASK_QUEUE.get(`account_session_key_${a.id}`);
        if (kvKey && kvKey.length > 20) {
          a.key = kvKey;
          a.keyLength = kvKey.length;
        }
      } catch { }
    }
  }

  async function getQueueMap() {
    const map = {};
    for (const a of accounts) {
      map[a.id] = await helpers.getAccountTasks(env, a.id);
    }
    return map;
  }

  // 2. Handle Application Slash Commands (type 2)
  if (interaction.type === 2) {
    const cmdName = interaction.data?.name;

    // /status or /panel
    if (cmdName === 'status' || cmdName === 'panel') {
      const qMap = await getQueueMap();
      let activeCount = 0;
      let completedCount = 0;
      for (const list of Object.values(qMap)) {
        for (const t of list) {
          if (t.status === 'queued') activeCount++;
          else completedCount++;
        }
      }

      const embed = buildTelemetryEmbed(accounts, request.cf?.colo, { active: activeCount, completed: completedCount }, null);
      const components = buildControlComponents(accounts, activeCount > 0);

      return new Response(JSON.stringify({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          embeds: [embed],
          components: components
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // /ping [account]
    if (cmdName === 'ping') {
      const accChoice = interaction.data?.options?.find(o => o.name === 'account')?.value || 'all';
      const appId = env.DISCORD_APP_ID || interaction.application_id;
      const token = interaction.token;

      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let pingResults;
          if (accChoice === 'all') {
            pingResults = await helpers.pingAllClaudeAccounts(env);
          } else {
            const accId = parseInt(accChoice, 10);
            pingResults = await helpers.pingSpecificAccount(env, accId);
          }

          const qMap = await getQueueMap();
          let activeCount = 0;
          for (const list of Object.values(qMap)) {
            for (const t of list) if (t.status === 'queued') activeCount++;
          }

          let desc = '';
          let hasFailure = false;
          for (const r of pingResults) {
            const ok = r.result?.success;
            if (!ok) hasFailure = true;
            desc += `• **${r.account}**: \`${ok ? '200 OK • Delivered' : 'Failed'}\`\n`;
            if (r.result?.error) desc += `  › Error: \`${r.result.error}\`\n`;
          }

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Ping Execution', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: hasFailure ? '[PING NOTICE] One or more pings failed' : '[PING SUCCESS] Keep-Alive Dispatched',
                description: desc.trim(),
                color: hasFailure ? DISCORD_COLORS.WARNING : DISCORD_COLORS.SUCCESS,
                footer: { text: 'Claude Pulse • Cloudflare Edge', icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, activeCount > 0)
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(e => console.warn('[Discord] Patch ping error:', e.message));
        })());
      }

      return new Response(JSON.stringify({ type: 5 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // /queue [list | run | clear | add]
    if (cmdName === 'queue') {
      const subCmd = interaction.data?.options?.[0];
      const subName = subCmd?.name || 'list';

      if (subName === 'list') {
        const qMap = await getQueueMap();
        let activeCount = 0;
        for (const list of Object.values(qMap)) {
          for (const t of list) if (t.status === 'queued') activeCount++;
        }
        const embed = buildQueueEmbed(qMap, accounts);
        const components = buildControlComponents(accounts, activeCount > 0);
        return new Response(JSON.stringify({
          type: 4,
          data: { embeds: [embed], components: components }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      if (subName === 'clear') {
        for (const a of accounts) {
          const tasks = await helpers.getAccountTasks(env, a.id);
          const activeOnly = tasks.filter(t => t.status === 'queued');
          await helpers.saveAccountTasks(env, a.id, activeOnly);
        }
        if (helpers.notifyTaskScheduler) await helpers.notifyTaskScheduler(env);

        return new Response(JSON.stringify({
          type: 4,
          data: {
            embeds: [
              {
                title: '[QUEUE CLEANUP] Completed History Cleared',
                description: 'All past completed and failed task logs were purged from KV. Active queue preserved.',
                color: DISCORD_COLORS.SUCCESS,
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, false)
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      if (subName === 'run') {
        const appId = env.DISCORD_APP_ID || interaction.application_id;
        const token = interaction.token;

        if (ctx?.waitUntil) {
          ctx.waitUntil((async () => {
            const swept = await helpers.sweepDueTasks(env);
            const patchPayload = {
              embeds: [
                {
                  title: '[QUEUE RUN] Execution Swept',
                  description: Array.isArray(swept) && swept.length > 0
                    ? `Processed ${swept.length} task(s):\n` + swept.map(s => `• **${s.account}**: \`${s.result?.success ? 'Success' : 'Error'}\``).join('\n')
                    : 'No overdue tasks found. Edge sweep completed.',
                  color: DISCORD_COLORS.SUCCESS,
                  timestamp: new Date().toISOString()
                }
              ],
              components: buildControlComponents(accounts, false)
            };
            await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(patchPayload)
            }).catch(() => {});
          })());
        }

        return new Response(JSON.stringify({ type: 5 }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (subName === 'add') {
        const opts = subCmd.options || [];
        const accId = parseInt(opts.find(o => o.name === 'account')?.value || 1, 10);
        const rawUrl = (opts.find(o => o.name === 'url')?.value || '').trim();
        const rawTime = (opts.find(o => o.name === 'time')?.value || '').trim();
        const rawPrompt = (opts.find(o => o.name === 'prompt')?.value || 'continue').trim();

        // Validate URL
        const norm = helpers.normalizeClaudeChatUrl(rawUrl);
        if (!norm.valid) {
          return new Response(JSON.stringify({
            type: 4,
            data: {
              flags: 64, // Ephemeral (visible only to user)
              embeds: [{
                title: '[INVALID URL] Claude Chat Link Rejected',
                description: `Error: \`${norm.error}\`\n\nPlease provide a valid URL like: \`https://claude.ai/chat/uuid\``,
                color: DISCORD_COLORS.ERROR
              }]
            }
          }), { headers: { 'Content-Type': 'application/json' } });
        }

        // Parse Time
        let targetTimestamp = null;
        if (rawTime.toLowerCase() === 'immediate' || rawTime.toLowerCase() === 'now') {
          targetTimestamp = Date.now();
        } else if (helpers.calculateTargetTimestamp) {
          targetTimestamp = helpers.calculateTargetTimestamp(rawTime);
        }
        if (!targetTimestamp) {
          // Default to +5h 2m if unparseable
          targetTimestamp = Date.now() + (5 * 3600000) + (2 * 60000);
        }

        const matchedAcc = accounts.find(a => a.id === accId) || accounts[0];
        const newTask = {
          id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          accountId: accId,
          accountName: matchedAcc.name,
          chatUrl: norm.normalizedUrl,
          prompt: rawPrompt,
          targetType: 'time',
          targetTime: rawTime,
          targetTimestamp: targetTimestamp,
          status: 'queued',
          createdAt: new Date().toISOString()
        };

        const existingTasks = await helpers.getAccountTasks(env, accId);
        existingTasks.push(newTask);
        await helpers.saveAccountTasks(env, accId, existingTasks);
        if (helpers.notifyTaskScheduler) {
          await helpers.notifyTaskScheduler(env, {
            action: 'upsert',
            task: newTask
          });
        }

        if (newTask.targetType === 'time' && newTask.targetTimestamp && newTask.targetTimestamp <= (Date.now() + 2500) && ctx?.waitUntil && helpers.sweepDueTasks) {
          ctx.waitUntil(helpers.sweepDueTasks(env));
        }

        const card = buildTaskScheduledCard(newTask, matchedAcc);

        return new Response(JSON.stringify({
          type: 4,
          data: {
            embeds: [card.embed],
            components: card.components
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    // /schedule
    if (cmdName === 'schedule') {
      if (accounts.length > 1) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64, // Ephemeral (visible only to user)
            content: '**Select an Account for this Autopilot Task:**',
            components: [
              {
                type: 1,
                components: accounts.map(a => ({
                  type: 2,
                  style: 1, // Primary (Blurple)
                  label: a.name,
                  custom_id: `trigger_schedule_modal_${a.id}`
                }))
              }
            ]
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      const targetAcc = accounts[0] || { name: 'Account #1', id: 1 };
      return new Response(JSON.stringify({
        type: 9, // MODAL
        data: {
          title: `Schedule Task: ${targetAcc.name}`,
          custom_id: `modal_schedule_task_${targetAcc.id}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'chat_url',
                  label: 'Claude Chat URL or UUID',
                  style: 1,
                  min_length: 4,
                  max_length: 150,
                  placeholder: 'https://claude.ai/chat/... or UUID',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'execution_time',
                  label: 'Execution Time (IST or Relative)',
                  style: 1,
                  min_length: 2,
                  max_length: 40,
                  placeholder: '12:34 PM, +5h, now, or reset',
                  value: '12:34 PM',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'prompt',
                  label: 'Prompt to Submit',
                  style: 2,
                  min_length: 1,
                  max_length: 2000,
                  placeholder: 'continue',
                  value: 'continue',
                  required: true
                }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // /digest
    if (cmdName === 'digest') {
      const qMap = await getQueueMap();
      const digestEmbed = buildDigestEmbed(accounts, qMap);
      return new Response(JSON.stringify({
        type: 4,
        data: {
          embeds: [digestEmbed],
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 1, label: 'Schedule Task', custom_id: 'open_schedule_modal' },
                { type: 2, style: 2, label: 'Refresh Telemetry', custom_id: 'refresh_status' },
                { type: 2, style: 5, label: 'Web Dashboard', url: BASE_DASHBOARD_URL }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  // 3. Handle Message Components (Button clicks - type 3)
  if (interaction.type === 3) {
    const customId = interaction.data?.custom_id || '';
    const appId = env.DISCORD_APP_ID || interaction.application_id;
    const token = interaction.token;

    if (customId === 'refresh_status') {
      const qMap = await getQueueMap();
      let activeCount = 0;
      let completedCount = 0;
      for (const list of Object.values(qMap)) {
        for (const t of list) {
          if (t.status === 'queued') activeCount++;
          else completedCount++;
        }
      }
      const embed = buildTelemetryEmbed(accounts, request.cf?.colo, { active: activeCount, completed: completedCount }, null);
      const components = buildControlComponents(accounts, activeCount > 0);

      return new Response(JSON.stringify({
        type: 7, // UPDATE_MESSAGE
        data: { embeds: [embed], components: components }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (customId === 'clear_history') {
      for (const a of accounts) {
        const tasks = await helpers.getAccountTasks(env, a.id);
        const activeOnly = tasks.filter(t => t.status === 'queued');
        await helpers.saveAccountTasks(env, a.id, activeOnly);
      }
      if (helpers.notifyTaskScheduler) await helpers.notifyTaskScheduler(env);

      const qMap = await getQueueMap();
      let activeCount = 0;
      for (const list of Object.values(qMap)) {
        for (const t of list) if (t.status === 'queued') activeCount++;
      }
      const embed = buildQueueEmbed(qMap, accounts);
      const components = buildControlComponents(accounts, activeCount > 0);

      return new Response(JSON.stringify({
        type: 7,
        data: { embeds: [embed], components: components }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (customId === 'select_ping_accounts') {
      const selectedValues = interaction.data?.values || [];
      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let results = [];
          if (selectedValues.includes('all')) {
            results = await helpers.pingAllClaudeAccounts(env);
          } else {
            for (const val of selectedValues) {
              const accId = parseInt(val, 10);
              if (!isNaN(accId)) {
                const res = await helpers.pingSpecificAccount(env, accId);
                results.push(...res);
              }
            }
          }

          const qMap = await getQueueMap();
          let activeCount = 0;
          for (const list of Object.values(qMap)) {
            for (const t of list) if (t.status === 'queued') activeCount++;
          }

          let desc = '';
          let hasFailure = false;
          for (const r of results) {
            const ok = r.result?.success;
            if (!ok) hasFailure = true;
            desc += `• **${r.account}**: \`${ok ? '200 OK • Delivered' : 'Failed'}\`\n`;
            if (r.result?.error) desc += `  › Error: \`${r.result.error}\`\n`;
          }

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Selected Ping Execution', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: hasFailure ? '[PING NOTICE] One or more selected pings failed' : '[PING SUCCESS] Keep-Alive Dispatched',
                description: desc.trim() || 'No accounts were pinged.',
                color: hasFailure ? DISCORD_COLORS.WARNING : DISCORD_COLORS.SUCCESS,
                footer: { text: `Target Accounts: ${selectedValues.join(', ')}`, icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, activeCount > 0)
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(e => console.warn('[Discord] Patch selected ping error:', e.message));
        })());
      }

      return new Response(JSON.stringify({ type: 5 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (customId.startsWith('ping_acc_')) {
      const target = customId.replace('ping_acc_', '');

      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let results;
          if (target === 'all') {
            results = await helpers.pingAllClaudeAccounts(env);
          } else {
            const accId = parseInt(target, 10);
            results = await helpers.pingSpecificAccount(env, accId);
          }

          const qMap = await getQueueMap();
          let activeCount = 0;
          for (const list of Object.values(qMap)) {
            for (const t of list) if (t.status === 'queued') activeCount++;
          }

          let summary = '';
          let hasFailure = false;
          for (const r of results) {
            const ok = r.result?.success;
            if (!ok) hasFailure = true;
            summary += `• **${r.account}**: \`${ok ? '200 OK • Delivered' : 'Failed'}\`\n`;
          }

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Keep-Alive Executed', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: hasFailure ? '[PING NOTICE] Attention Required' : '[PING EXECUTED] Keep-Alive Dispatched',
                description: summary.trim(),
                color: hasFailure ? DISCORD_COLORS.WARNING : DISCORD_COLORS.SUCCESS,
                footer: { text: 'Claude Pulse • Cloudflare Edge', icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, activeCount > 0)
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(e => console.warn('[Discord] Patch button error:', e.message));
        })());
      }

      // DEFERRED_UPDATE_MESSAGE
      return new Response(JSON.stringify({ type: 6 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (customId === 'force_run_next') {
      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          const swept = await helpers.sweepDueTasks(env);
          const patchPayload = {
            embeds: [
              {
                title: '[QUEUE RUN] Execution Triggered',
                description: Array.isArray(swept) && swept.length > 0
                  ? `Swept ${swept.length} task(s):\n` + swept.map(s => `• **${s.account}**: \`${s.result?.success ? 'Success' : 'Error'}\``).join('\n')
                  : 'Queue sweep triggered. No pending overdue tasks found.',
                color: DISCORD_COLORS.SUCCESS,
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, false)
          };
          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(() => {});
        })());
      }

      return new Response(JSON.stringify({ type: 6 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (customId.startsWith('verify_session_')) {
      const accId = parseInt(customId.replace('verify_session_', ''), 10);
      const matchedAcc = accounts.find(a => a.id === accId) || accounts[0];

      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let testRes = null;
          if (helpers.pingSpecificAccount) {
            testRes = await helpers.pingSpecificAccount(env, accId);
          }
          const pingResult = testRes?.[0]?.result;
          const isAlive = Boolean(pingResult?.success);

          if (isAlive && env.TASK_QUEUE) {
            try {
              await env.TASK_QUEUE.delete(`alert_session_expired_${accId}`);
            } catch { }
          }

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Session Verification', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: isAlive ? `[SESSION VALIDATED] ${matchedAcc.name}` : `[SESSION STILL INVALID] ${matchedAcc.name}`,
                description: isAlive
                  ? `Authentication was verified successfully with Claude web.\n\n• Status: \`200 OK • Active\`\n• Autopilot keep-alives and scheduled prompts have resumed.`
                  : `Claude web rejected the session credentials.\n\n• Error: \`${pingResult?.error || '401 Unauthorized'}\`\n• Ensure the new session key was saved into \`CLAUDE_SESSION_KEY_${accId}\` on Cloudflare secrets.`,
                color: isAlive ? DISCORD_COLORS.SUCCESS : DISCORD_COLORS.ERROR,
                footer: { text: `Account ID: #${accId}`, icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: [
              {
                type: 1,
                components: isAlive
                  ? [
                    { type: 2, style: 5, label: 'Web Dashboard ↗', url: BASE_DASHBOARD_URL },
                    { type: 2, style: 2, label: 'Refresh Control Deck', custom_id: 'refresh_status' }
                  ]
                  : [
                    { type: 2, style: 1, label: 'Retry Verification', custom_id: `verify_session_${accId}` },
                    { type: 2, style: 5, label: 'Web Dashboard ↗', url: BASE_DASHBOARD_URL }
                  ]
              }
            ]
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(e => console.warn('[Discord] Patch verify session error:', e.message));
        })());
      }

      return new Response(JSON.stringify({ type: 6 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (customId.startsWith('retry_task_')) {
      const taskId = customId.replace('retry_task_', '');
      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let targetTask = null;
          let targetAcc = null;

          for (const a of accounts) {
            const tasks = await helpers.getAccountTasks(env, a.id);
            const t = (taskId === 'latest')
              ? tasks.slice().reverse().find(x => x.status === 'failed')
              : tasks.find(x => x.id === taskId);

            if (t) {
              targetTask = t;
              targetAcc = a;
              t.status = 'queued';
              delete t.failedAt;
              delete t.error;
              await helpers.saveAccountTasks(env, a.id, tasks);
              break;
            }
          }

          let directResult = null;
          if (targetTask && targetAcc && helpers.pingClaudeAccount) {
            try {
              directResult = await helpers.pingClaudeAccount(env, targetAcc.name, targetAcc.key, targetAcc.chatUrl, targetAcc.id, null, targetTask.id);
            } catch (execErr) {
              directResult = { success: false, error: execErr.message };
            }
          } else if (helpers.sweepDueTasks) {
            await helpers.sweepDueTasks(env);
          }

          const isSuccess = Boolean(directResult?.success);

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Task Retry Execution', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: isSuccess
                  ? `[RETRY COMPLETED] ${targetAcc?.name || 'Task Executed'}`
                  : `[RETRY FAILED] ${targetAcc?.name || 'Execution Failed'}`,
                description: isSuccess
                  ? `Task \`${targetTask?.id}\` was delivered directly to Claude web.\n\n• Status: \`200 OK • Stream Completed\`\n• Prompt: \`${targetTask?.prompt}\`\n• Chat Link: [${targetTask?.chatUrl?.replace('https://claude.ai/', '') || 'Claude'}](${targetTask?.chatUrl || BASE_DASHBOARD_URL})`
                  : (targetTask
                    ? `Task retry encountered an issue.\n\n• Error: \`${directResult?.error || 'Execution failed'}\`\n• Prompt: \`${targetTask.prompt}\`\n• Routine keep-alive was triggered automatically.`
                    : 'Task ID not found in queue records.'),
                color: isSuccess ? DISCORD_COLORS.SUCCESS : DISCORD_COLORS.WARNING,
                footer: { text: `Task: ${targetTask?.id || taskId}`, icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: [
              {
                type: 1,
                components: isSuccess
                  ? [
                    ...(targetTask?.chatUrl ? [{ type: 2, style: 5, label: 'Open Claude Chat', url: targetTask.chatUrl }] : []),
                    { type: 2, style: 5, label: 'Web Dashboard', url: BASE_DASHBOARD_URL }
                  ]
                  : [
                    ...(targetTask ? [{ type: 2, style: 4, label: 'Retry Again', custom_id: `retry_task_${targetTask.id}` }] : []),
                    { type: 2, style: 5, label: 'Web Dashboard', url: BASE_DASHBOARD_URL }
                  ]
              }
            ]
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(e => console.warn('[Discord] Patch retry error:', e.message));
        })());
      }

      return new Response(JSON.stringify({ type: 6 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Modal openers
    if (customId === 'open_schedule_modal') {
      if (accounts.length > 1) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64, // Ephemeral (visible only to user)
            content: '**Select an Account for this Autopilot Task:**',
            components: [
              {
                type: 1,
                components: accounts.map(a => ({
                  type: 2,
                  style: 1, // Primary (Blurple)
                  label: a.name,
                  custom_id: `trigger_schedule_modal_${a.id}`
                }))
              }
            ]
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      const targetAcc = accounts[0] || { name: 'Account #1', id: 1 };
      return new Response(JSON.stringify({
        type: 9,
        data: {
          title: `Schedule Task: ${targetAcc.name}`,
          custom_id: `modal_schedule_task_${targetAcc.id}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'chat_url',
                  label: 'Claude Chat URL or UUID',
                  style: 1,
                  min_length: 4,
                  max_length: 150,
                  placeholder: 'https://claude.ai/chat/... or UUID',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'execution_time',
                  label: 'Execution Time (IST or Relative)',
                  style: 1,
                  min_length: 2,
                  max_length: 40,
                  placeholder: '12:34 PM, +5h, now, or reset',
                  value: '12:34 PM',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'prompt',
                  label: 'Prompt to Submit',
                  style: 2,
                  min_length: 1,
                  max_length: 2000,
                  placeholder: 'continue',
                  value: 'continue',
                  required: true
                }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (customId.startsWith('trigger_schedule_modal_')) {
      const accId = parseInt(customId.replace('trigger_schedule_modal_', ''), 10) || 1;
      const targetAcc = accounts.find(a => a.id === accId) || { name: `Account #${accId}`, id: accId };

      return new Response(JSON.stringify({
        type: 9,
        data: {
          title: `Schedule Task: ${targetAcc.name}`,
          custom_id: `modal_schedule_task_${accId}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'chat_url',
                  label: 'Claude Chat URL or UUID',
                  style: 1,
                  min_length: 4,
                  max_length: 150,
                  placeholder: 'https://claude.ai/chat/... or UUID',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'execution_time',
                  label: 'Execution Time (IST or Relative)',
                  style: 1,
                  min_length: 2,
                  max_length: 40,
                  placeholder: '12:34 PM, +5h, now, or reset',
                  value: '12:34 PM',
                  required: true
                }
              ]
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'prompt',
                  label: 'Prompt to Submit',
                  style: 2,
                  min_length: 1,
                  max_length: 2000,
                  placeholder: 'continue',
                  value: 'continue',
                  required: true
                }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (customId.startsWith('open_session_modal_')) {
      const targetAccId = parseInt(customId.replace('open_session_modal_', ''), 10) || 1;
      const targetAcc = accounts.find(a => a.id === targetAccId) || { name: `Account #${targetAccId}`, id: targetAccId };

      return new Response(JSON.stringify({
        type: 9,
        data: {
          title: `Update Session Key (${targetAcc.name})`,
          custom_id: `modal_update_session_${targetAccId}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'session_key',
                  label: 'Paste sessionKey Cookie',
                  style: 2,
                  min_length: 20,
                  max_length: 500,
                  placeholder: 'sk-ant-sid01-...',
                  required: true
                }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (customId.startsWith('edit_prompt_')) {
      const taskId = customId.replace('edit_prompt_', '');
      let currentPrompt = 'continue';
      let taskIsDone = false;
      for (const a of accounts) {
        const tasks = await helpers.getAccountTasks(env, a.id);
        const t = tasks.find(x => x.id === taskId);
        if (t) {
          if (t.status === 'completed' || t.status === 'done') {
            taskIsDone = true;
          } else {
            currentPrompt = t.prompt || 'continue';
          }
          break;
        }
      }

      if (taskIsDone) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64,
            content: `Task \`${taskId}\` has already finished execution. Prompt cannot be edited.`
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        type: 9,
        data: {
          title: 'Edit Autopilot Prompt',
          custom_id: `modal_edit_prompt_${taskId}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'new_prompt',
                  label: 'Updated Prompt to Send',
                  style: 2,
                  min_length: 1,
                  max_length: 2000,
                  placeholder: 'Type prompt here...',
                  value: currentPrompt,
                  required: true
                }
              ]
            }
          ]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Snooze task (+1h or +5h Cascade)
    if (customId.startsWith('snooze_task_')) {
      const parts = customId.split('_');
      const duration = parts[parts.length - 1];
      const taskId = parts.slice(2, parts.length - 1).join('_');
      const addMs = (duration === '5h') ? (18120000) : (3600000);

      let matchedTask = null;
      let matchedAcc = null;

      for (const a of accounts) {
        const tasks = await helpers.getAccountTasks(env, a.id);
        const t = tasks.find(x => x.id === taskId);
        if (t) {
          if (t.status === 'completed' || t.status === 'done') {
            const retiredCard = buildTaskCompletedDisabledCard(t, a);
            return new Response(JSON.stringify({
              type: 7, // UPDATE_MESSAGE: cleans up card and removes buttons on Discord
              data: {
                embeds: [retiredCard.embed],
                components: retiredCard.components
              }
            }), { headers: { 'Content-Type': 'application/json' } });
          }
          t.targetTimestamp = (t.targetTimestamp || Date.now()) + addMs;
          matchedTask = t;
          matchedAcc = a;
          await helpers.saveAccountTasks(env, a.id, tasks);
          break;
        }
      }

      if (matchedTask) {
        if (helpers.notifyTaskScheduler) {
          await helpers.notifyTaskScheduler(env, {
            action: 'upsert',
            task: matchedTask
          });
        }
        const card = buildTaskScheduledCard(matchedTask, matchedAcc);
        return new Response(JSON.stringify({
          type: 7, // UPDATE_MESSAGE
          data: {
            embeds: [card.embed],
            components: card.components
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        type: 4,
        data: {
          flags: 64,
          content: `Task \`${taskId}\` not found in queue records.`
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Run Now for specific scheduled task
    if (customId.startsWith('force_run_task_')) {
      const taskId = customId.replace('force_run_task_', '');
      let targetTask = null;
      let targetAcc = null;

      for (const a of accounts) {
        const tasks = await helpers.getAccountTasks(env, a.id);
        const t = tasks.find(x => x.id === taskId);
        if (t) {
          targetTask = t;
          targetAcc = a;
          break;
        }
      }

      if (!targetTask) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64,
            content: `Task \`${taskId}\` not found in queue records.`
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      if (targetTask.status === 'completed' || targetTask.status === 'done') {
        const retiredCard = buildTaskCompletedDisabledCard(targetTask, targetAcc);
        return new Response(JSON.stringify({
          type: 7, // UPDATE_MESSAGE: retires buttons immediately
          data: {
            embeds: [retiredCard.embed],
            components: retiredCard.components
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      // Mark status as processing so duplicate clicks won't trigger duplicate browser jobs
      targetTask.status = 'processing';
      const tasks = await helpers.getAccountTasks(env, targetAcc.id);
      const idx = tasks.findIndex(x => x.id === taskId);
      if (idx >= 0) {
        tasks[idx].status = 'processing';
        await helpers.saveAccountTasks(env, targetAcc.id, tasks);
      }

      if (ctx?.waitUntil && helpers.pingClaudeAccount) {
        ctx.waitUntil(helpers.pingClaudeAccount(env, targetAcc.name, targetAcc.key, targetTask.chatUrl, targetAcc.id, null, targetTask.id));
      }

      // Return UPDATE_MESSAGE immediately replacing the card and retiring the action buttons!
      const runningCard = buildTaskExecutedCard(targetTask, targetAcc);
      return new Response(JSON.stringify({
        type: 7, // UPDATE_MESSAGE
        data: {
          embeds: [runningCard.embed],
          components: runningCard.components
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Prune stale keep-alive chats
    if (customId === 'prune_stale_chats') {
      const appId = env.DISCORD_APP_ID || interaction.application_id;
      const token = interaction.token;

      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          let prunedCount = 0;
          for (const a of accounts) {
            try {
              if (helpers.pruneAccountChats) {
                const count = await helpers.pruneAccountChats(env, a.id);
                prunedCount += (count || 0);
              }
            } catch { }
          }

          const patchPayload = {
            embeds: [
              {
                author: { name: 'Claude Pulse • Sidebar Pruner', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
                title: '[PRUNE COMPLETED] Stale Keep-Alive Chats Cleared',
                description: `Inspected conversations across accounts.\n\n• Cleaned duplicate keep-alive chats: \`${prunedCount}\`\n• Sidebar organized.`,
                color: DISCORD_COLORS.SUCCESS,
                footer: { text: 'Claude Pulse • Cloudflare Global', icon_url: CLAUDE_ICON_URL },
                timestamp: new Date().toISOString()
              }
            ],
            components: buildControlComponents(accounts, false)
          };

          await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload)
          }).catch(() => {});
        })());
      }

      return new Response(JSON.stringify({ type: 5 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 4. Handle Modal Submissions (type 5)
  if (interaction.type === 5) {
    const modalId = interaction.data?.custom_id || '';

    const modalValues = {};
    for (const row of interaction.data?.components || []) {
      for (const comp of row.components || []) {
        modalValues[comp.custom_id] = (comp.value || '').trim();
      }
    }

    if (modalId.startsWith('modal_schedule_task')) {
      let accId = 1;
      if (modalId.startsWith('modal_schedule_task_')) {
        accId = parseInt(modalId.replace('modal_schedule_task_', ''), 10) || 1;
      }
      let matchedAcc = accounts.find(a => a.id === accId);
      if (!matchedAcc && modalValues.account_selector) {
        const rawAcc = modalValues.account_selector;
        matchedAcc = accounts.find(a => a.name.toLowerCase() === rawAcc.toLowerCase());
        if (!matchedAcc) {
          const parsedId = parseInt(rawAcc, 10);
          matchedAcc = accounts.find(a => a.id === parsedId) || accounts[0];
        }
      }
      if (!matchedAcc) matchedAcc = accounts[0] || { name: `Account #${accId}`, id: accId };
      accId = matchedAcc.id;

      const rawUrl = modalValues.chat_url || '';
      const rawTime = modalValues.execution_time || '12:34 PM';
      const rawPrompt = modalValues.prompt || 'continue';

      const norm = helpers.normalizeClaudeChatUrl(rawUrl);
      if (!norm.valid) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: '[INVALID URL] Chat Link Rejected',
              description: `Error: \`${norm.error}\`\n\nProvide a valid URL like: \`https://claude.ai/chat/uuid\` or a bare UUID.`,
              color: DISCORD_COLORS.ERROR
            }]
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      let targetTimestamp = null;
      if (rawTime.toLowerCase() === 'immediate' || rawTime.toLowerCase() === 'now') {
        targetTimestamp = Date.now();
      } else if (helpers.calculateTargetTimestamp) {
        targetTimestamp = helpers.calculateTargetTimestamp(rawTime);
      }
      if (!targetTimestamp) {
        targetTimestamp = Date.now() + (5 * 3600000) + (2 * 60000);
      }

      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        accountId: accId,
        accountName: matchedAcc.name,
        chatUrl: norm.normalizedUrl,
        prompt: rawPrompt,
        targetType: 'time',
        targetTime: rawTime,
        targetTimestamp: targetTimestamp,
        status: 'queued',
        createdAt: new Date().toISOString()
      };

      const existingTasks = await helpers.getAccountTasks(env, accId);
      existingTasks.push(newTask);
      await helpers.saveAccountTasks(env, accId, existingTasks);
      if (helpers.notifyTaskScheduler) {
        await helpers.notifyTaskScheduler(env, {
          action: 'upsert',
          task: newTask
        });
      }

      if (newTask.targetType === 'time' && newTask.targetTimestamp && newTask.targetTimestamp <= (Date.now() + 2500) && ctx?.waitUntil && helpers.sweepDueTasks) {
        ctx.waitUntil(helpers.sweepDueTasks(env));
      }

      if (ctx?.waitUntil) {
        ctx.waitUntil((async () => {
          try {
            const appId = env.DISCORD_APP_ID || interaction.application_id;
            const token = interaction.token;
            if (appId && token) {
              const res = await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`);
              if (res.ok) {
                const msg = await res.json();
                if (msg?.id && msg?.channel_id) {
                  const tasks = await helpers.getAccountTasks(env, accId);
                  const t = tasks.find(x => x.id === newTask.id);
                  if (t) {
                    t.discordMessageId = msg.id;
                    t.discordChannelId = msg.channel_id;
                    await helpers.saveAccountTasks(env, accId, tasks);
                  }
                }
              }
            }
          } catch (e) {
            console.warn('[discord] Error caching original message id:', e.message);
          }
        })());
      }

      const card = buildTaskScheduledCard(newTask, matchedAcc);

      return new Response(JSON.stringify({
        type: 4,
        data: {
          embeds: [card.embed],
          components: card.components
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (modalId.startsWith('modal_update_session_')) {
      const accId = parseInt(modalId.replace('modal_update_session_', ''), 10) || 1;
      const targetAcc = accounts.find(a => a.id === accId) || { name: `Account #${accId}`, id: accId };
      const rawKey = modalValues.session_key || '';

      if (!rawKey || rawKey.length < 20) {
        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: '[SESSION REJECTED] Invalid Key Length',
              description: 'The session key provided is too short. Please copy the complete `sessionKey` cookie from claude.ai.',
              color: DISCORD_COLORS.ERROR
            }]
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      if (env.TASK_QUEUE) {
        await env.TASK_QUEUE.put(`account_session_key_${accId}`, rawKey);
      }

      return new Response(JSON.stringify({
        type: 4,
        data: {
          flags: 64,
          embeds: [{
            author: { name: 'Claude Pulse • Session Management', url: BASE_DASHBOARD_URL, icon_url: CLAUDE_ICON_URL },
            title: `[SESSION SAVED] ${targetAcc.name}`,
            description: `Session key for **${targetAcc.name}** was saved to secure edge KV storage.\n\n` +
              `• Account: \`${targetAcc.name}\` [ID #${accId}]\n` +
              `• Key Length: \`${rawKey.length} bytes\`\n\n` +
              'You can now tap **Verify Session** in `#session-alarms` or run `/ping` to resume keep-alive.',
            color: DISCORD_COLORS.SUCCESS,
            footer: { text: 'Claude Pulse • Cloudflare Global', icon_url: CLAUDE_ICON_URL },
            timestamp: new Date().toISOString()
          }]
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (modalId.startsWith('modal_edit_prompt_')) {
      const taskId = modalId.replace('modal_edit_prompt_', '');
      const newPrompt = modalValues.new_prompt || 'continue';

      let matchedTask = null;

      for (const a of accounts) {
        const tasks = await helpers.getAccountTasks(env, a.id);
        const t = tasks.find(x => x.id === taskId);
        if (t) {
          t.prompt = newPrompt;
          matchedTask = t;
          await helpers.saveAccountTasks(env, a.id, tasks);
          if (helpers.notifyTaskScheduler) {
            await helpers.notifyTaskScheduler(env, {
              action: 'upsert',
              task: matchedTask
            });
          }
          break;
        }
      }

      if (matchedTask) {
        if (matchedTask.discordMessageId && matchedTask.discordChannelId && env.DISCORD_BOT_TOKEN && ctx?.waitUntil) {
          ctx.waitUntil((async () => {
            try {
              const matchedAcc = accounts.find(a => Number(a.id) === Number(matchedTask.accountId)) || accounts[0];
              const updatedCard = buildTaskScheduledCard(matchedTask, matchedAcc);
              await fetch(`https://discord.com/api/v10/channels/${matchedTask.discordChannelId}/messages/${matchedTask.discordMessageId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  embeds: [updatedCard.embed],
                  components: updatedCard.components
                })
              });
            } catch (patchErr) {
              console.warn('[discord] Error updating message embed on prompt edit:', patchErr.message);
            }
          })());
        }

        return new Response(JSON.stringify({
          type: 4,
          data: {
            flags: 64,
            embeds: [{
              title: '[PROMPT UPDATED] Task Modified',
              description: `Prompt for task \`${taskId}\` has been updated.\n\n**New Prompt:**\n\`\`\`text\n${newPrompt}\n\`\`\``,
              color: DISCORD_COLORS.SUCCESS
            }]
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        type: 4,
        data: {
          flags: 64,
          content: `Task \`${taskId}\` not found in queue records.`
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response('Unhandled interaction', { status: 400 });
}

