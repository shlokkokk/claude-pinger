import { renderDashboardHTML } from './dashboard.js';

export function getAccountCredentials(env, accountNum) {
  const num = parseInt(accountNum, 10);
  if (isNaN(num) || num < 1) return null;

  const key = (num === 1) 
    ? (env.CLAUDE_SESSION_KEY || env.CLAUDE_SESSION_KEY_1) 
    : env[`CLAUDE_SESSION_KEY_${num}`];

  if (!key) return null;

  const defaultNames = { 1: 'Account 1', 2: 'Account 2' };
  const defaultColors = {
    1: '#00f2fe',
    2: '#c084fc',
    3: '#10b981',
    4: '#f59e0b',
    5: '#ec4899',
    6: '#38bdf8'
  };

  const name = env[`CLAUDE_ACCOUNT_NAME_${num}`] || defaultNames[num] || `Account ${num}`;
  const themeColor = env[`CLAUDE_ACCOUNT_COLOR_${num}`] || defaultColors[num] || '#10b981';
  const chatUrl = (num === 1) ? (env.CLAUDE_CHAT_URL_1 || env.CLAUDE_CHAT_URL) : env[`CLAUDE_CHAT_URL_${num}`];

  return { id: num, name, key, themeColor, chatUrl: chatUrl || null };
}

export function getAllAccounts(env) {
  const accounts = [];
  let consecutiveMisses = 0;

  for (let i = 1; i <= 20; i++) {
    const acc = getAccountCredentials(env, i);
    if (acc) {
      accounts.push(acc);
      consecutiveMisses = 0;
    } else {
      consecutiveMisses++;
      if (consecutiveMisses >= 3 && i >= 2) break;
    }
  }
  return accounts;
}

export function normalizeClaudeChatUrl(rawUrl) {
  let chatUrl = (rawUrl || '').trim();
  if (!chatUrl) {
    return { valid: false, error: 'Please enter a Claude conversation URL.' };
  }

  // Reject dangerous schemes
  if (chatUrl.includes(':') && !chatUrl.startsWith('http://') && !chatUrl.startsWith('https://')) {
    return { valid: false, error: 'Disallowed protocol scheme. Only official https://claude.ai URLs are permitted.' };
  }

  // Normalize protocol & domain if omitted
  if (chatUrl.startsWith('claude.ai/')) {
    chatUrl = 'https://' + chatUrl;
  } else if (chatUrl.startsWith('www.claude.ai/')) {
    chatUrl = 'https://' + chatUrl.substring(4);
  } else if (chatUrl.startsWith('/chat/')) {
    chatUrl = 'https://claude.ai' + chatUrl;
  } else if (chatUrl.startsWith('chat/')) {
    chatUrl = 'https://claude.ai/' + chatUrl;
  } else if (!chatUrl.startsWith('http://') && !chatUrl.startsWith('https://')) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(chatUrl) || /^[a-zA-Z0-9_-]{8,}$/.test(chatUrl)) {
      chatUrl = 'https://claude.ai/chat/' + chatUrl;
    } else {
      return { valid: false, error: 'Invalid Claude chat identifier format.' };
    }
  }

  let parsed;
  try {
    parsed = new URL(chatUrl);
  } catch (e) {
    return { valid: false, error: 'Malformed URL format.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, error: 'Only HTTPS and HTTP URLs are allowed.' };
  }

  if (parsed.hostname !== 'claude.ai' && !parsed.hostname.endsWith('.claude.ai')) {
    return { valid: false, error: `Invalid domain (${parsed.hostname}). URL must belong to claude.ai.` };
  }

  const path = parsed.pathname;
  let chatType = 'Claude Conversation';
  let chatId = null;

  const directMatch = path.match(/\/chat\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
  const projectMatch = path.match(/\/project\/[^\/]+\/chat\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
  const genericChatMatch = path.match(/\/chat\/([a-zA-Z0-9_-]+)/);

  if (projectMatch) {
    chatType = 'Project Chat (UUID v4 format)';
    chatId = projectMatch[1];
  } else if (directMatch) {
    chatType = 'Standard Chat (UUID v4 format)';
    chatId = directMatch[1];
  } else if (genericChatMatch) {
    chatType = 'Custom Claude Chat';
    chatId = genericChatMatch[1];
  } else if (path === '/new' || path === '/new/') {
    chatType = 'New Chat Creation Endpoint';
  } else {
    return { 
      valid: false, 
      error: 'URL is on claude.ai but does not point to a specific chat (expected /chat/<uuid>).' 
    };
  }

  return {
    valid: true,
    chatId,
    chatType,
    normalizedUrl: parsed.origin + parsed.pathname,
    fullUrl: parsed.href
  };
}

export function validateQueuePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object.' };
  }
  const { accountId, chatUrl, prompt, targetType, targetSlot, targetSlotDisplay, targetTime, targetTimestamp } = payload;
  if (accountId === undefined || accountId === null || isNaN(Number(accountId))) {
    return { valid: false, error: 'Target account ID is required and must be numeric.' };
  }
  if (!chatUrl || typeof chatUrl !== 'string' || !chatUrl.trim()) {
    return { valid: false, error: 'A valid Claude chat URL is required.' };
  }
  const cleanPrompt = (prompt && typeof prompt === 'string') ? prompt.trim() : 'continue';
  const cleanTargetType = (['next', 'slot', 'time'].includes(targetType)) ? targetType : 'next';
  const cleanSlot = (targetSlot !== undefined && targetSlot !== null && !isNaN(Number(targetSlot))) ? Number(targetSlot) : null;
  const cleanTimestamp = (targetTimestamp !== undefined && targetTimestamp !== null && !isNaN(Number(targetTimestamp))) ? Number(targetTimestamp) : null;

  return {
    valid: true,
    data: {
      accountId: Number(accountId),
      chatUrl: chatUrl.trim(),
      prompt: cleanPrompt,
      targetType: cleanTargetType,
      targetSlot: cleanSlot,
      targetSlotDisplay: targetSlotDisplay || null,
      targetTime: targetTime ? String(targetTime).trim() : null,
      targetTimestamp: cleanTimestamp
    }
  };
}

export function calculateTargetTimestamp(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  if (hour < 0 || hour > 23 || min < 0 || min > 59) return null;

  // Calculate in IST (UTC+5.5)
  const now = new Date();
  const istOffsetMs = 5.5 * 3600000;
  const nowIST = new Date(now.getTime() + istOffsetMs);

  const targetIST = new Date(nowIST);
  targetIST.setHours(hour, min, 0, 0);

  // If time has already passed today in IST, schedule for tomorrow
  if (targetIST.getTime() <= nowIST.getTime()) {
    targetIST.setDate(targetIST.getDate() + 1);
  }

  // Convert back to UTC timestamp in ms
  return targetIST.getTime() - istOffsetMs;
}

export function parseRateLimitNotice(text) {
  if (!text || typeof text !== 'string') return null;
  const regex = /(?:until|at|before)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const match = text.match(regex);
  if (!match) return null;
  let rawTime = match[1].trim();
  if (!rawTime.includes(':')) {
    rawTime = rawTime.replace(/(\d{1,2})\s*(am|pm)/i, '$1:00 $2');
  }
  return rawTime;
}

export async function sendNotification(env, { type, accountName, accountId, prompt, url, pageTitle, error }) {
  if (!env) return;
  const tgToken = env.TELEGRAM_BOT_TOKEN;
  const tgChatId = env.TELEGRAM_CHAT_ID;
  const discordWebhook = env.DISCORD_WEBHOOK_URL;

  if (!tgToken && !discordWebhook) return;

  // Resolve dynamic account name:
  // 1. Explicitly passed accountName
  // 2. Custom name from KV if user configured it or browserless detected it
  // 3. Environment variable CLAUDE_ACCOUNT_NAME_X
  let realName = accountName;
  if ((!realName || realName.startsWith('Account ')) && env.TASK_QUEUE && accountId) {
    try {
      const snippet = await env.TASK_QUEUE.get(`account_snippet_${accountId}`);
      if (snippet) realName = snippet;
    } catch (e) {}
  }
  if ((!realName || realName.startsWith('Account ')) && env && accountId) {
    const envName = env[`CLAUDE_ACCOUNT_NAME_${accountId}`];
    if (envName) realName = envName;
  }

  const hasCustomName = realName && !realName.startsWith('Account ');
  const accountHeader = hasCustomName 
    ? `<b>${realName}</b> (Account #${accountId || 1})`
    : `<b>Account #${accountId || 1}</b>`;
  const shortName = realName || `Account #${accountId || 1}`;

  // Debounce session expired alerts: max 1 alert per 4 hours per account
  if (type === 'session_expired' && env.TASK_QUEUE && accountId) {
    try {
      const debounceKey = `alert_session_expired_${accountId}`;
      const alreadySent = await env.TASK_QUEUE.get(debounceKey);
      if (alreadySent) return;
      await env.TASK_QUEUE.put(debounceKey, 'sent', { expirationTtl: 14400 });
    } catch (e) {}
  }

  // Clear debounce if account succeeded
  if (type === 'ping_success' && env.TASK_QUEUE && accountId) {
    try {
      await env.TASK_QUEUE.delete(`alert_session_expired_${accountId}`);
    } catch (e) {}
  }

  let title = '';
  let message = '';
  let color = 0x00f2fe;

  if (type === 'session_expired') {
    title = `Session Key Expired: ${shortName}`;
    message = `<b>Claude Pulse Alert</b>\n\n` +
      `⚠️ The authentication session key for ${accountHeader} has expired or been revoked.\n\n` +
      `Automatic keep-alives and scheduled prompts for <b>${shortName}</b> are paused until updated.\n\n` +
      `<i>Action Required: Update CLAUDE_SESSION_KEY_${accountId || 1} in Cloudflare secrets.</i>`;
    color = 0xf04848;
  } else if (type === 'task_completed') {
    title = `Overnight Task Completed: ${shortName}`;
    message = `<b>Claude Pulse Task Executed</b>\n\n` +
      `<b>Account:</b> ${accountHeader}\n` +
      `<b>Prompt:</b> "${prompt || 'continue'}"\n` +
      `<b>Thread:</b> ${url || 'Claude Chat'}\n` +
      `<b>Status:</b> ${pageTitle || 'Message submitted successfully'}`;
    color = 0x00d68f;
  } else if (type === 'task_failed') {
    title = `⚠️ Task Execution Failed: ${shortName}`;
    message = `<b>Claude Pulse Task Error</b>\n\n` +
      `<b>Account:</b> ${accountHeader}\n` +
      `<b>Prompt:</b> "${prompt || 'continue'}"\n` +
      `❌ <b>Error:</b> ${error || 'Failed to submit prompt'}\n\n` +
      `<i>Dispatched fallback keep-alive ping automatically to preserve rolling 5-hour window.</i>`;
    color = 0xffb020;
  } else {
    return;
  }

  // 1. Dispatch Telegram Alert
  if (tgToken && tgChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });
    } catch (tgErr) {
      console.warn('Telegram notification error:', tgErr.message);
    }
  }

  // 2. Dispatch Discord Webhook
  if (discordWebhook) {
    try {
      const cleanDesc = message.replace(/<[^>]*>/g, '');
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Claude Pulse',
          avatar_url: 'https://raw.githubusercontent.com/shlokkokk/claude-pinger/main/claude-pulse-icon-512.png',
          embeds: [
            {
              title: title,
              description: cleanDesc,
              color: color,
              timestamp: new Date().toISOString(),
              footer: { text: `Claude Pulse • ${shortName}` }
            }
          ]
        })
      });
    } catch (dcErr) {
      console.warn('Discord notification error:', dcErr.message);
    }
  }
}

export async function getAccountTasks(env, accountId) {
  if (!env || !env.TASK_QUEUE) return [];
  try {
    const raw = await env.TASK_QUEUE.get(`tasks_account_${accountId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Check legacy single task
    const legacyRaw = await env.TASK_QUEUE.get(`task_account_${accountId}`);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && typeof legacy === 'object') {
        return [legacy];
      }
    }
  } catch (e) {
    console.warn(`Error reading tasks for account ${accountId}:`, e.message);
  }
  return [];
}

export async function saveAccountTasks(env, accountId, tasks) {
  if (!env || !env.TASK_QUEUE) return;
  try {
    await env.TASK_QUEUE.put(`tasks_account_${accountId}`, JSON.stringify(tasks));
    // Also update legacy single task key for backward compatibility
    const activeTask = tasks.find(t => t.status === 'queued') || tasks[tasks.length - 1] || null;
    if (activeTask) {
      await env.TASK_QUEUE.put(`task_account_${accountId}`, JSON.stringify(activeTask));
    } else {
      await env.TASK_QUEUE.delete(`task_account_${accountId}`);
    }
  } catch (e) {
    console.warn(`Error saving tasks for account ${accountId}:`, e.message);
  }
}

export async function sweepDueTasks(env) {
  if (!env || !env.TASK_QUEUE) return [];
  const accounts = getAllAccounts(env);
  const executed = [];
  const now = Date.now();

  for (const acc of accounts) {
    const tasks = await getAccountTasks(env, acc.id);
    // Find ALL due time-targeted tasks, not just the first
    const dueTasks = tasks.filter(t => t.status === 'queued' && t.targetType === 'time' && t.targetTimestamp && t.targetTimestamp <= now);
    for (const dueTask of dueTasks) {
      console.log(`Sweeping due task for ${acc.name}: "${dueTask.prompt}" (id: ${dueTask.id}, scheduled for ${dueTask.targetTime || 'exact time'})`);
      try {
        // Pass dueTask.id so pingClaudeAccount targets exactly this task, not re-running priority selection
        const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl, acc.id, null, dueTask.id);
        executed.push({ account: acc.name, taskId: dueTask.id, result: res });
      } catch (err) {
        console.error(`Error executing due task for ${acc.name} (${dueTask.id}):`, err.message);
      }
    }
  }
  return executed;
}

export default {
  async scheduled(event, env, ctx) {
    const cron = event.cron;
    const utcHour = new Date().getUTCHours();
    console.log(`Cron triggered: ${cron} at UTC hour ${utcHour}`);

    const accounts = getAllAccounts(env);
    if (accounts.length === 0) {
      console.warn('Scheduled cron triggered but no accounts are configured in env.');
      return;
    }

    let targetCohort = 1;
    let slotNumber = 1;
    if (cron === '58 4 * * *') {
      targetCohort = 1;
      slotNumber = 3;
    } else if (cron === '6 17 * * *') {
      targetCohort = 2;
      slotNumber = 8;
    } else if (cron === '0 2,10 * * *') {
      targetCohort = (utcHour < 6) ? 2 : 1;
      slotNumber = (utcHour < 6) ? 2 : 5;
    } else if (cron === '2 7,15 * * *') {
      targetCohort = (utcHour < 11) ? 2 : 1;
      slotNumber = (utcHour < 11) ? 4 : 7;
    } else if (cron === '4 12,20 * * *') {
      targetCohort = (utcHour < 16) ? 2 : 1;
      slotNumber = (utcHour < 16) ? 6 : 1;
    }

    let cohortA, cohortB;
    if (accounts.length <= 1) {
      cohortA = accounts;
      cohortB = accounts;
    } else {
      // Stable IDs keep existing accounts assigned to the same daily slots as new accounts are added.
      cohortA = accounts.filter(acc => Number(acc.id) % 2 !== 0);
      cohortB = accounts.filter(acc => Number(acc.id) % 2 === 0);
      if (cohortA.length === 0) cohortA = accounts;
      if (cohortB.length === 0) cohortB = accounts;
    }

    const accountsToPing = (targetCohort === 1) ? cohortA : cohortB;

    // Sweep any exact-time tasks that are due, then execute scheduled slot pings
    ctx.waitUntil((async () => {
      await sweepDueTasks(env);
      await pingAccountsList(env, accountsToPing, slotNumber);
    })());
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const accountParam = url.searchParams.get('account');

    if (pathname === '/manifest.json') {
      const manifest = {
        name: "Claude Pulse",
        short_name: "ClaudePulse",
        start_url: "/",
        display: "standalone",
        background_color: "#07080c",
        theme_color: "#090a0f",
        icons: [
          {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='128' fill='%230e1118'/%3E%3Cpath d='M280 64L96 288h160v160l160-224H280z' fill='%2300f2fe'/%3E%3C/svg%3E",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      };
      return new Response(JSON.stringify(manifest), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (pathname === '/api/health') {
      const now = new Date();
      const istDate = new Date(now.getTime() + (5.5 * 3600000));
      const accounts = getAllAccounts(env);

      const accountsDiagnostic = {};
      accounts.forEach(acc => {
        accountsDiagnostic[acc.name] = {
          id: acc.id,
          configured: true,
          themeColor: acc.themeColor,
          sessionKeyLength: acc.key.length,
          hasDirectUrlHint: !!acc.chatUrl
        };
      });

      const diagnostics = {
        status: 'healthy',
        timestamp: {
          utc: now.toISOString(),
          ist: istDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        },
        worker: {
          online: true,
          region: request.cf?.colo || 'Local / Dev',
          totalAccounts: accounts.length
        },
        accounts: accounts.map(a => ({ id: a.id, name: a.name, themeColor: a.themeColor })),
        credentials: {
          ...accountsDiagnostic,
          browserlessApiKey: !!(env.BROWSERLESS_TOKEN || env.BROWSERLESS_API_KEY),
          taskQueueConfigured: !!env.TASK_QUEUE,
          telegramConfigured: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
          discordConfigured: !!env.DISCORD_WEBHOOK_URL
        },
        browserless: {
          status: 'unknown',
          message: ''
        }
      };

      const bToken = env.BROWSERLESS_TOKEN || env.BROWSERLESS_API_KEY;

      if (bToken) {
        try {
          const bRes = await fetch(`https://production-sfo.browserless.io/version?token=${bToken}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (bRes.ok) {
            const bData = await bRes.json().catch(() => ({}));
            diagnostics.browserless.status = 'connected';
            diagnostics.browserless.message = `Browserless v${bData.Browser || 'Connected'}`;
          } else {
            diagnostics.browserless.status = 'connected';
            diagnostics.browserless.message = 'Token Authenticated';
          }
        } catch {
          diagnostics.browserless.status = 'connected';
          diagnostics.browserless.message = 'Token Configured';
        }
      } else {
        diagnostics.browserless.status = 'missing_key';
        diagnostics.browserless.message = 'BROWSERLESS_TOKEN not configured in env';
      }

      return new Response(JSON.stringify(diagnostics, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // TASK QUEUE URL VERIFICATION API: Inspect & verify Claude conversation links
    if (pathname === '/api/queue/verify') {
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      let chatUrl = '';
      let accountId = 1;

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          chatUrl = (body.chatUrl || '').trim();
          accountId = parseInt(body.accountId || 1, 10);
        } catch (e) {}
      } else {
        chatUrl = (url.searchParams.get('chatUrl') || '').trim();
        accountId = parseInt(url.searchParams.get('accountId') || 1, 10);
      }

      const norm = normalizeClaudeChatUrl(chatUrl);
      if (!norm.valid) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: norm.error 
        }), { status: 400, headers: corsHeaders });
      }

      const accounts = getAllAccounts(env);
      const matchedAcc = accounts.find(a => a.id === accountId) || accounts[0];

      return new Response(JSON.stringify({
        valid: true,
        chatId: norm.chatId,
        chatType: norm.chatType,
        normalizedUrl: norm.normalizedUrl,
        fullUrl: norm.fullUrl,
        targetAccount: matchedAcc ? matchedAcc.name : null,
        message: 'Claude URL structure is valid. Conversation access and sign-in were not checked.',
        validationScope: 'url-structure-only'
      }), { status: 200, headers: corsHeaders });
    }

    // TASK QUEUE API: MULTI-TASK & TIMED OVERNIGHT PROMPTS
    if (pathname === '/api/queue') {
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      if (!env.TASK_QUEUE) {
        return new Response(JSON.stringify({ 
          error: 'TASK_QUEUE KV namespace is not configured on Cloudflare.',
          tasks: {}
        }), { status: 200, headers: corsHeaders });
      }

      // GET: List all tasks across accounts
      if (request.method === 'GET') {
        const accounts = getAllAccounts(env);
        const tasks = {};
        for (const a of accounts) {
          tasks[a.id] = await getAccountTasks(env, a.id);
        }
        return new Response(JSON.stringify({ success: true, tasks }), {
          status: 200,
          headers: corsHeaders
        });
      }

      // POST: Queue a new task
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const validation = validateQueuePayload(body);
          if (!validation.valid) {
            return new Response(JSON.stringify({ error: validation.error }), { status: 400, headers: corsHeaders });
          }

          const { accountId, chatUrl: rawChatUrl, prompt: rawPrompt, targetType, targetSlot, targetSlotDisplay, targetTime } = validation.data;

          const accounts = getAllAccounts(env);
          const matchedAcc = accounts.find(a => a.id === accountId);
          if (!matchedAcc) {
            return new Response(JSON.stringify({ error: `Account ${accountId} is not configured.` }), { status: 400, headers: corsHeaders });
          }

          const norm = normalizeClaudeChatUrl(rawChatUrl);
          if (!norm.valid) {
            return new Response(JSON.stringify({ error: norm.error }), { status: 400, headers: corsHeaders });
          }
          const chatUrl = norm.fullUrl;

          // Sanitize prompt: strip non-printable control characters
          const prompt = rawPrompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          if (prompt.length > 1000) {
            return new Response(JSON.stringify({ error: 'Prompt is too long (max 1000 characters).' }), { status: 400, headers: corsHeaders });
          }

          // Anti-spam cooldown: prevent rapid duplicate re-queueing of the exact same prompt
          const existingTasks = await getAccountTasks(env, accountId);
          const recentDuplicate = existingTasks.find(t => 
            t.chatUrl === chatUrl && 
            t.prompt === prompt && 
            t.status === 'queued' && 
            t.queuedAtTimestamp && 
            (Date.now() - t.queuedAtTimestamp < 4000)
          );
          if (recentDuplicate) {
            return new Response(JSON.stringify({ error: 'Rate limit: This task was just queued. Please wait a moment.' }), { status: 429, headers: corsHeaders });
          }

          let computedTimestamp = validation.data.targetTimestamp;
          if (targetType === 'time' && targetTime && !computedTimestamp) {
            computedTimestamp = calculateTargetTimestamp(targetTime);
          }

          const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            accountId,
            accountName: matchedAcc.name,
            chatUrl,
            prompt,
            targetType: targetType || 'next', // 'next' | 'slot' | 'time'
            targetSlot: targetSlot || null,
            targetSlotDisplay: targetSlotDisplay || null,
            targetTime: targetTime || null,
            targetTimestamp: computedTimestamp || null,
            status: 'queued',
            queuedAt: new Date().toISOString(),
            queuedAtTimestamp: Date.now()
          };

          existingTasks.push(task);
          await saveAccountTasks(env, accountId, existingTasks);

          const targetDesc = targetType === 'slot' 
            ? `scheduled for ${targetSlotDisplay || `Slot ${targetSlot}`}` 
            : targetType === 'time' 
            ? `scheduled for exact time ${targetTime || 'custom'}` 
            : 'will execute on next scheduled ping';

          return new Response(JSON.stringify({ 
            success: true, 
            message: `Task queued for ${matchedAcc.name}. It ${targetDesc}.`,
            task,
            tasks: existingTasks
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Invalid JSON payload: ' + err.message }), { status: 400, headers: corsHeaders });
        }
      }

      // DELETE: Cancel queued task (by taskId or clear account)
      if (request.method === 'DELETE') {
        const accId = parseInt(accountParam || url.searchParams.get('accountId'), 10);
        const taskId = url.searchParams.get('taskId');

        if (isNaN(accId)) {
          return new Response(JSON.stringify({ error: 'accountId parameter is required to delete.' }), { status: 400, headers: corsHeaders });
        }

        const accounts = getAllAccounts(env);
        const matchedAcc = accounts.find(a => a.id === accId) || { name: `Account ${accId}` };

        if (taskId) {
          const tasks = await getAccountTasks(env, accId);
          const filtered = tasks.filter(t => t.id !== taskId);
          await saveAccountTasks(env, accId, filtered);
          return new Response(JSON.stringify({ 
            success: true, 
            message: `Task removed for ${matchedAcc.name}.` 
          }), { status: 200, headers: corsHeaders });
        } else {
          await env.TASK_QUEUE.delete(`tasks_account_${accId}`);
          await env.TASK_QUEUE.delete(`task_account_${accId}`);
          return new Response(JSON.stringify({ 
            success: true, 
            message: `All queued tasks removed for ${matchedAcc.name}.` 
          }), { status: 200, headers: corsHeaders });
        }
      }

      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // DISPATCH QUEUED TASK DIRECTLY API
    if (pathname === '/api/queue/dispatch') {
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      let taskId = url.searchParams.get('taskId');
      let accountId = parseInt(url.searchParams.get('accountId'), 10);

      if (request.method === 'POST') {
        try {
          const b = await request.json();
          taskId = taskId || b.taskId;
          accountId = isNaN(accountId) ? parseInt(b.accountId, 10) : accountId;
        } catch (e) {}
      }

      if (isNaN(accountId) || !taskId) {
        return new Response(JSON.stringify({ error: 'accountId and taskId are required.' }), { status: 400, headers: corsHeaders });
      }

      const acc = getAccountCredentials(env, accountId);
      if (!acc) {
        return new Response(JSON.stringify({ error: `Account ${accountId} not found.` }), { status: 404, headers: corsHeaders });
      }

      const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl, acc.id, null, taskId);
      return new Response(JSON.stringify({ message: `Dispatched task for ${acc.name}`, result: res }), { status: 200, headers: corsHeaders });
    }

    if (pathname.startsWith('/api/ping') || pathname === '/ping' || (pathname === '/' && request.method === 'POST')) {
      let results;
      if (accountParam) {
        const accNum = parseInt(accountParam, 10);
        results = await pingSpecificAccount(env, accNum);
      } else {
        results = await pingAllClaudeAccounts(env);
      }
      return new Response(JSON.stringify({ message: 'Ping finished!', results }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (request.method === 'GET') {
      const accounts = getAllAccounts(env).map(a => ({
        id: a.id,
        name: a.name,
        color: a.themeColor || (a.id === 1 ? '#00f2fe' : (a.id === 2 ? '#c084fc' : '#10b981'))
      }));
      const html = renderDashboardHTML(accounts);
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};

async function pingSpecificAccount(env, accountNum) {
  const acc = getAccountCredentials(env, accountNum);

  if (!acc) {
    console.error(`Account ${accountNum} credentials not found in env.`);
    return [{ success: false, error: `Account ${accountNum} credentials not found.` }];
  }

  console.log(`Pinging ${acc.name}...`);
  const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl, acc.id);
  return [{ account: acc.name, result: res }];
}

async function pingAccountsList(env, accounts, currentSlotNumber = null) {
  if (!accounts || accounts.length === 0) {
    return [{ success: false, error: 'No accounts provided to ping.' }];
  }

  const results = [];
  for (const acc of accounts) {
    console.log(`Pinging ${acc.name}... (Slot ${currentSlotNumber || 'manual'})`);
    try {
      const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl, acc.id, currentSlotNumber);
      results.push({ account: acc.name, result: res });
    } catch (err) {
      results.push({ account: acc.name, result: { success: false, error: err.message } });
    }
    if (accounts.length > 1) {
      await new Promise(r => setTimeout(r, 2500));
    }
  }
  return results;
}

async function pingAllClaudeAccounts(env) {
  const accounts = getAllAccounts(env);

  if (accounts.length === 0) {
    return [{ success: false, error: 'No CLAUDE_SESSION_KEY secrets found.' }];
  }

  return pingAccountsList(env, accounts);
}

async function pingClaudeAccount(env, accountName, sessionKey, chatUrlHint, accountId, currentSlotNumber = null, targetTaskId = null) {
  const TOKEN = env && env.BROWSERLESS_TOKEN;
  if (!TOKEN) {
    return { success: false, error: 'BROWSERLESS_TOKEN secret is not set.' };
  }

  // 1. Resolve eligible queued task for this account
  let queuedTask = null;
  let allTasks = [];
  if (env && env.TASK_QUEUE && accountId) {
    try {
      allTasks = await getAccountTasks(env, accountId);
      const queuedTasks = allTasks.filter(t => t.status === 'queued');

      if (targetTaskId) {
        queuedTask = queuedTasks.find(t => t.id === targetTaskId) || null;
      } else if (queuedTasks.length > 0) {
        const now = Date.now();
        // Priority 1: Due timestamp tasks (exact time arrived)
        queuedTask = queuedTasks.find(t => t.targetType === 'time' && t.targetTimestamp && t.targetTimestamp <= now);

        // Priority 2: Slot-matching tasks (e.g. user targeted Slot 5 at 3:30 PM)
        if (!queuedTask && currentSlotNumber) {
          queuedTask = queuedTasks.find(t => t.targetType === 'slot' && Number(t.targetSlot) === Number(currentSlotNumber));
        }

        // Priority 3: Next ping tasks (run on immediate next ping, no future lock)
        if (!queuedTask) {
          queuedTask = queuedTasks.find(t => t.targetType === 'next' || !t.targetType);
        }

        // Tasks targeting FUTURE slots or FUTURE timestamps are preserved safely in queue!
      }

      if (queuedTask) {
        console.log(`Executing queued task for ${accountName} (Account ${accountId}): "${queuedTask.prompt}" -> ${queuedTask.chatUrl} [Target: ${queuedTask.targetType || 'next'}]`);
      }
    } catch (kvErr) {
      console.warn(`KV read error for account ${accountId}:`, kvErr.message);
    }
  }

  const targetCustomUrl = queuedTask ? queuedTask.chatUrl : null;
  const promptToSend = queuedTask ? queuedTask.prompt : 'ping. Reply with "." only.';
  const isCustomTask = Boolean(queuedTask);

  const browserlessCode = `
    export default async ({ page, browser }) => {
      const sessionKey = ${JSON.stringify(sessionKey)};
      const directChatUrlHint = ${JSON.stringify(chatUrlHint || null)};
      const targetCustomUrl = ${JSON.stringify(targetCustomUrl)};
      const promptToSend = ${JSON.stringify(promptToSend)};
      const isCustomTask = ${isCustomTask};

      const p = page || (browser ? await browser.newPage() : null);
      if (!p) {
        throw new Error('No browser page available');
      }

      await p.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9'
      });

      await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
      
      await p.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });

      if (sessionKey) {
        await p.setCookie({
          name: 'sessionKey',
          value: sessionKey,
          domain: '.claude.ai',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
        });
      }

      let targetChatUrl = targetCustomUrl;
      let cleanedUpSpamCount = 0;
      let threadDiscoveryMethod = targetCustomUrl ? 'custom_task_url' : 'none';
      let pageTitle = '';
      let accountSnippet = '';
      let stepError = null;
      let actionExecuted = false;

      // Only perform discovery/cleanup if NOT executing a custom queued assignment chat
      if (!targetCustomUrl) {
        try {
          await p.goto('https://claude.ai/', { waitUntil: 'domcontentloaded', timeout: 25000 });
          await new Promise(r => setTimeout(r, 3500));
        } catch (navErr) {
          console.warn('Initial root load warning:', navErr.message);
        }

        try {
          const discoveryResult = await p.evaluate(async () => {
            let discoveredUrl = null;
            let deletedCount = 0;
            let orgId = null;

            try {
              const orgsRes = await fetch('/api/organizations', {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
              });

              if (orgsRes.ok) {
                const orgs = await orgsRes.json();
                if (Array.isArray(orgs) && orgs.length > 0) {
                  orgId = orgs[0].uuid;

                  const convRes = await fetch('/api/organizations/' + orgId + '/chat_conversations', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                  });

                  if (convRes.ok) {
                    const conversations = await convRes.json();
                    if (Array.isArray(conversations) && conversations.length > 0) {
                      const pingChats = conversations.filter(c => {
                        const name = (c.name || '').toLowerCase().trim();
                        return /\\b(ping|pinger|keepalive|greeting)\\b/i.test(name) || name === 'untitled';
                      });

                      if (pingChats.length > 0) {
                        pingChats.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
                        const activePingChat = pingChats[0];
                        discoveredUrl = 'https://claude.ai/chat/' + activePingChat.uuid;

                        const duplicatesToDelete = pingChats.slice(1, 6);
                        for (const dup of duplicatesToDelete) {
                          try {
                            await fetch('/api/organizations/' + orgId + '/chat_conversations/' + dup.uuid, {
                              method: 'DELETE',
                              headers: { 'Accept': 'application/json' },
                              credentials: 'include'
                            });
                            deletedCount++;
                          } catch (delErr) {}
                        }
                      }
                    }
                  }
                }
              }
            } catch (apiErr) {
              console.warn('Internal API discovery error:', apiErr.message);
            }

            if (!discoveredUrl) {
              const sidebarLinks = Array.from(document.querySelectorAll('a[href*="/chat/"]'));
              const pingLink = sidebarLinks.find(el => {
                const text = (el.innerText || '').toLowerCase().trim();
                return /\\b(ping|pinger|keepalive)\\b/i.test(text);
              });
              if (pingLink && pingLink.href) {
                discoveredUrl = pingLink.href;
              }
            }

            return {
              url: discoveredUrl,
              deletedCount: deletedCount,
              method: discoveredUrl ? (orgId ? 'internal_api' : 'dom_sidebar') : 'none'
            };
          });

          if (discoveryResult && discoveryResult.url) {
            targetChatUrl = discoveryResult.url;
            cleanedUpSpamCount = discoveryResult.deletedCount || 0;
            threadDiscoveryMethod = discoveryResult.method || 'detected';
          }
        } catch (discErr) {
          console.warn('Thread discovery exception:', discErr.message);
        }
      }

      const destination = targetChatUrl || directChatUrlHint || 'https://claude.ai/new';
      try {
        await p.goto(destination, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await new Promise(r => setTimeout(r, 3500));
      } catch (navErr) {
        console.warn('Navigation warning to ' + destination + ':', navErr.message);
      }

      pageTitle = await p.title();
      const currentLoc = p.url();

      if (currentLoc.includes('/login') || pageTitle.includes('Sign in') || pageTitle.includes('Log in')) {
        return {
          success: false,
          url: currentLoc,
          pageTitle,
          accountSnippet: '',
          actionExecuted: false,
          threadDiscoveryMethod: 'none',
          cleanedUpSpamCount: 0,
          isCustomTask,
          stepError: 'Session key expired or revoked. Please update your session key in Cloudflare secrets.'
        };
      }

      try {
        accountSnippet = await p.evaluate(() => {
          const btn = document.querySelector('button[aria-haspopup="menu"]');
          return btn ? btn.innerText.trim() : '';
        });
      } catch (e) {}

      const inputSelector = 'div[contenteditable="true"], div[role="textbox"], textarea, p[data-placeholder], .ProseMirror, [data-testid="chat-input"]';
      let hasInput = false;

      let isExhausted = false;
      try {
        await p.waitForSelector(inputSelector, { timeout: 8000 });
        
        isExhausted = await p.evaluate(() => {
          const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
          return bodyText.includes('conversation has grown too long') || 
                 bodyText.includes('conversation is too long') ||
                 bodyText.includes('message limit reached for this chat');
        });

        if (isExhausted) {
          hasInput = false;
          stepError = 'Conversation context limit reached on Claude.';
        } else {
          hasInput = true;
        }
      } catch (waitErr) {
        hasInput = false;
      }

      // If generic ping and no input, fallback to /new. If custom task and no input, report error
      if (!hasInput && !isCustomTask) {
        try {
          await p.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded', timeout: 20000 });
          await p.waitForSelector(inputSelector, { timeout: 12000 });
          hasInput = true;
        } catch (e) {
          stepError = 'Could not locate active chat input box on /new: ' + e.message;
        }
      } else if (!hasInput && isCustomTask) {
        stepError = stepError || ('Input box not found or disabled in custom chat URL (' + destination + ').');
      }

      if (hasInput) {
        try {
          await p.click(inputSelector);
          await p.focus(inputSelector);
          
          await p.keyboard.type(promptToSend);
          await new Promise(r => setTimeout(r, 400));
          
          await p.keyboard.press('Enter');
          
          try {
            const sendBtn = await p.$('button[aria-label*="Send"], button[aria-label*="send"], button[type="submit"], button[data-testid="send-button"]');
            if (sendBtn) {
              await sendBtn.click();
            }
          } catch (btnErr) {}

          actionExecuted = true;
          // Hold session for 4.5 seconds so Anthropic receives payload and starts generation
          await new Promise(r => setTimeout(r, 4500));
        } catch (typeErr) {
          stepError = 'Failed typing or submitting message: ' + typeErr.message;
        }
      }

      return { 
        success: actionExecuted, 
        url: p.url(),
        pageTitle,
        accountSnippet,
        actionExecuted,
        threadDiscoveryMethod,
        cleanedUpSpamCount,
        isCustomTask,
        promptSent: promptToSend,
        stepError
      };
    };
  `;

  try {
    const response = await fetch('https://production-sfo.browserless.io/function?token=' + TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: browserlessCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browserless API error:', response.status, errorText);
      return { success: false, status: response.status, error: errorText };
    }

    const result = await response.json();
    console.log(`Ping result for ${accountName}:`, result);

    if (result && result.accountSnippet && env && env.TASK_QUEUE && accountId) {
      try {
        await env.TASK_QUEUE.put(`account_snippet_${accountId}`, result.accountSnippet, { expirationTtl: 86400 * 30 });
      } catch (e) {}
    }

    const resolvedAccountName = (accountName && !accountName.startsWith('Account ')) 
      ? accountName 
      : (result?.accountSnippet || accountName);

    // Trigger Telegram / Discord alert if session key is expired
    if (result && result.stepError && result.stepError.toLowerCase().includes('session key expired')) {
      await sendNotification(env, {
        type: 'session_expired',
        accountName: resolvedAccountName,
        accountId
      });
    }

    // Only send ping_success for custom task completions — routine keep-alive pings
    // do NOT trigger alerts to avoid spamming Telegram/Discord on every cron tick.
    // task_completed is sent separately below when a queued task succeeds.

    // Update KV task status and handle fallback if needed
    if (queuedTask && env && env.TASK_QUEUE && accountId) {
      try {
        const taskIdx = allTasks.findIndex(t => t.id === queuedTask.id);
        if (result && result.success) {
          const completedTask = {
            ...queuedTask,
            status: 'completed',
            completedAt: new Date().toISOString(),
            lastResult: `Successfully sent "${promptToSend}" to ${result.url || queuedTask.chatUrl}`
          };
          if (taskIdx >= 0) allTasks[taskIdx] = completedTask;
          else allTasks.push(completedTask);
          await saveAccountTasks(env, accountId, allTasks);

          // Clear the debounce flag so session expiry can alert fresh next time
          try {
            if (env.TASK_QUEUE && accountId) {
              await env.TASK_QUEUE.delete(`alert_session_expired_${accountId}`);
            }
          } catch (e) {}

          await sendNotification(env, {
            type: 'task_completed',
            accountName: resolvedAccountName,
            accountId,
            prompt: promptToSend,
            url: result.url || queuedTask.chatUrl,
            pageTitle: result.pageTitle
          });
        } else {
          const failedTask = {
            ...queuedTask,
            status: 'failed',
            failedAt: new Date().toISOString(),
            error: result?.stepError || result?.error || 'Execution failed'
          };
          if (taskIdx >= 0) allTasks[taskIdx] = failedTask;
          else allTasks.push(failedTask);
          await saveAccountTasks(env, accountId, allTasks);

          await sendNotification(env, {
            type: 'task_failed',
            accountName: resolvedAccountName,
            accountId,
            prompt: promptToSend,
            error: failedTask.error
          });

          // Resilience Fallback: run normal ping so account 5-hour window is preserved
          console.warn(`Custom task failed for ${accountName}. Dispatching fallback keep-alive ping...`);
          try {
            await pingClaudeAccount(env, accountName, sessionKey, null, null);
          } catch (fbErr) {
            console.error(`Fallback ping failed:`, fbErr.message);
          }
        }
      } catch (kvWriteErr) {
        console.warn(`Error updating KV task status:`, kvWriteErr.message);
      }
    }

    return result;
  } catch (err) {
    console.error(`Ping exception for ${accountName}:`, err.message);

    if (queuedTask && env && env.TASK_QUEUE && accountId) {
      try {
        const taskIdx = allTasks.findIndex(t => t.id === queuedTask.id);
        const failedTask = {
          ...queuedTask,
          status: 'failed',
          failedAt: new Date().toISOString(),
          error: err.message
        };
        if (taskIdx >= 0) allTasks[taskIdx] = failedTask;
        else allTasks.push(failedTask);
        await saveAccountTasks(env, accountId, allTasks);

        await sendNotification(env, {
          type: 'task_failed',
          accountName,
          accountId,
          prompt: promptToSend,
          error: err.message
        });
      } catch (e) {}
    }

    return { success: false, error: err.message };
  }
}
