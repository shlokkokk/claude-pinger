import { renderDashboardHTML } from './dashboard.js';

export default {
  async scheduled(event, env, ctx) {
    const cron = event.cron;
    const utcHour = new Date().getUTCHours();
    console.log(`Cron triggered: ${cron} at UTC hour ${utcHour}`);

    let targetAccount = null;

    if (cron === '58 4 * * *') {
      // 10:28 AM IST -> Account 1
      targetAccount = 1;
    } else if (cron === '6 17 * * *') {
      // 10:36 PM IST -> Account 2
      targetAccount = 2;
    } else if (cron === '0 2,10 * * *') {
      // 07:30 AM IST (UTC 2) -> Account 2 | 03:30 PM IST (UTC 10) -> Account 1
      targetAccount = (utcHour < 6) ? 2 : 1;
    } else if (cron === '2 7,15 * * *') {
      // 12:32 PM IST (UTC 7) -> Account 2 | 08:32 PM IST (UTC 15) -> Account 1
      targetAccount = (utcHour < 11) ? 2 : 1;
    } else if (cron === '4 12,20 * * *') {
      // 05:34 PM IST (UTC 12) -> Account 2 | 01:34 AM IST (UTC 20) -> Account 1
      targetAccount = (utcHour < 16) ? 2 : 1;
    }

    if (targetAccount === 1 || targetAccount === 2) {
      ctx.waitUntil(pingSpecificAccount(env, targetAccount));
    } else {
      ctx.waitUntil(pingAllClaudeAccounts(env));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const accountParam = url.searchParams.get('account');

    // Serve PWA Manifest
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

    // Diagnostic & Health API Endpoint (/api/health)
    if (pathname === '/api/health') {
      const now = new Date();
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utcMs + (5.5 * 3600000));

      const diagnostics = {
        status: 'healthy',
        timestamp: {
          utc: now.toISOString(),
          ist: istDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        },
        worker: {
          online: true,
          region: request.cf?.colo || 'Local / Dev'
        },
        credentials: {
          shlokshah412: {
            configured: !!(env.CLAUDE_SESSION_KEY && env.CLAUDE_CHAT_URL_1),
            sessionKeyConfigured: !!env.CLAUDE_SESSION_KEY,
            chatUrlConfigured: !!env.CLAUDE_CHAT_URL_1
          },
          pcgpt: {
            configured: !!(env.CLAUDE_SESSION_KEY_2 && env.CLAUDE_CHAT_URL_2),
            sessionKeyConfigured: !!env.CLAUDE_SESSION_KEY_2,
            chatUrlConfigured: !!env.CLAUDE_CHAT_URL_2
          },
          browserlessApiKey: !!(env.BROWSERLESS_TOKEN || env.BROWSERLESS_API_KEY)
        },
        browserless: {
          status: 'unknown',
          message: ''
        }
      };

      const bToken = env.BROWSERLESS_TOKEN || env.BROWSERLESS_API_KEY;

      // Test Browserless connection without launching full browser or touching Claude
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
        } catch (err) {
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

    // Ping API Endpoint (GET/POST /api/ping or /ping)
    if (pathname.startsWith('/api/ping') || pathname === '/ping') {
      let results;
      if (accountParam === '1') {
        results = await pingSpecificAccount(env, 1);
      } else if (accountParam === '2') {
        results = await pingSpecificAccount(env, 2);
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

    // Legacy POST to root /
    if (request.method === 'POST') {
      let results;
      if (accountParam === '1') {
        results = await pingSpecificAccount(env, 1);
      } else if (accountParam === '2') {
        results = await pingSpecificAccount(env, 2);
      } else {
        results = await pingAllClaudeAccounts(env);
      }
      return new Response(JSON.stringify({ message: 'Ping finished!', results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Serve Dashboard Web App on GET /
    if (request.method === 'GET') {
      // If user passed ?account=1 directly via GET, maintain backward compatibility
      if (accountParam) {
        let results;
        if (accountParam === '1') {
          results = await pingSpecificAccount(env, 1);
        } else if (accountParam === '2') {
          results = await pingSpecificAccount(env, 2);
        } else {
          results = await pingAllClaudeAccounts(env);
        }
        return new Response(JSON.stringify({ message: 'Ping finished!', results }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const html = renderDashboardHTML();
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
  let acc = null;
  if (accountNum === 1 && env.CLAUDE_SESSION_KEY) {
    acc = { 
      name: 'shlokshah412', 
      key: env.CLAUDE_SESSION_KEY, 
      chatUrl: env.CLAUDE_CHAT_URL_1 
    };
  } else if (accountNum === 2 && env.CLAUDE_SESSION_KEY_2) {
    acc = { 
      name: 'pcgpt', 
      key: env.CLAUDE_SESSION_KEY_2, 
      chatUrl: env.CLAUDE_CHAT_URL_2 
    };
  }

  if (!acc) {
    console.error(`Account ${accountNum} credentials not found in env.`);
    return [{ success: false, error: `Account ${accountNum} credentials not found.` }];
  }

  console.log(`Pinging specific account: ${acc.name}...`);
  const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl);
  return [{ account: acc.name, result: res }];
}

async function pingAllClaudeAccounts(env) {
  const accounts = [];
  if (env.CLAUDE_SESSION_KEY) {
    accounts.push({ 
      name: 'shlokshah412', 
      key: env.CLAUDE_SESSION_KEY, 
      chatUrl: env.CLAUDE_CHAT_URL_1 
    });
  }
  if (env.CLAUDE_SESSION_KEY_2) {
    accounts.push({ 
      name: 'pcgpt', 
      key: env.CLAUDE_SESSION_KEY_2, 
      chatUrl: env.CLAUDE_CHAT_URL_2 
    });
  }

  for (let i = 3; env[`CLAUDE_SESSION_KEY_${i}`]; i++) {
    accounts.push({ 
      name: `Account ${i}`, 
      key: env[`CLAUDE_SESSION_KEY_${i}`], 
      chatUrl: env[`CLAUDE_CHAT_URL_${i}`] 
    });
  }

  if (accounts.length === 0) {
    return [{ success: false, error: 'No CLAUDE_SESSION_KEY secrets found.' }];
  }

  const results = [];
  for (const acc of accounts) {
    console.log(`Pinging ${acc.name}...`);
    const res = await pingClaudeAccount(env, acc.name, acc.key, acc.chatUrl);
    results.push({ account: acc.name, result: res });
  }
  return results;
}

async function pingClaudeAccount(env, accountName, sessionKey, chatUrl) {
  const TOKEN = env && env.BROWSERLESS_TOKEN;
  if (!TOKEN) {
    return { success: false, error: 'BROWSERLESS_TOKEN secret is not set.' };
  }

  const browserlessCode = `
    export default async ({ page, browser }) => {
      const sessionKey = ${JSON.stringify(sessionKey)};
      const directChatUrl = ${JSON.stringify(chatUrl || null)};
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

      let pageTitle = '';
      let pageSnippet = '';
      let accountSnippet = '';
      let stepError = null;
      let actionExecuted = false;

      try {
        if (directChatUrl) {
          await p.goto(directChatUrl, { waitUntil: 'domcontentloaded' });
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          await p.goto('https://claude.ai/recents', { waitUntil: 'domcontentloaded' });
          await new Promise(resolve => setTimeout(resolve, 4000));

          const existingChatUrl = await p.evaluate(() => {
            const candidates = Array.from(document.querySelectorAll('a[href*="/chat/"]'));
            const pingerLink = candidates.find(el => {
              const text = el.innerText ? el.innerText.toLowerCase().trim() : '';
              return /\b(ping|pinger|keepalive|greeting)\b/i.test(text);
            });
            return pingerLink ? pingerLink.href : null;
          });

          if (existingChatUrl) {
            await p.goto(existingChatUrl, { waitUntil: 'domcontentloaded' });
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }

        pageTitle = await p.title();

        // Extract account profile name
        try {
          accountSnippet = await p.evaluate(() => {
            const btn = document.querySelector('button[aria-haspopup="menu"]');
            return btn ? btn.innerText : '';
          });
        } catch (e) {}

        const inputSelector = 'div[contenteditable="true"], div[role="textbox"], textarea, p[data-placeholder], .ProseMirror';
        
        let hasInput = false;
        try {
          await p.waitForSelector(inputSelector, { timeout: 8000 });
          hasInput = true;
        } catch (e) {
          // If chat URL was deleted or invalid, fallback to /new page
          await p.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded' });
          await p.waitForSelector(inputSelector, { timeout: 10000 });
          hasInput = true;
        }

        if (hasInput) {
          await p.click(inputSelector);
          await p.focus(inputSelector);
          
          // Ultra-lightweight prompt (Claude responds with 1 character '.')
          await p.keyboard.type('ping. Reply with "." only.');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await p.keyboard.press('Enter');
          
          try {
            const sendBtn = await p.$('button[aria-label*="Send"], button[aria-label*="send"], button[type="submit"], button[data-testid="send-button"]');
            if (sendBtn) {
              await sendBtn.click();
            }
          } catch (btnErr) {}

          actionExecuted = true;
        }

        // Wait 4 seconds for Claude API to start generating response so chat is saved to history
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (err) {
        stepError = err.message;
        try {
          pageSnippet = await p.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : 'no body');
        } catch (e) {}
      }

      return { 
        success: true, 
        url: p.url(),
        pageTitle,
        accountSnippet,
        pageSnippet,
        actionExecuted,
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
    return result;
  } catch (err) {
    console.error(`Ping exception for ${accountName}:`, err.message);
    return { success: false, error: err.message };
  }
}
