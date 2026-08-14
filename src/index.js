export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pingAllClaudeAccounts(env));
  },

  async fetch(request, env) {
    if (request.method === 'POST' || request.method === 'GET') {
      const results = await pingAllClaudeAccounts(env);
      return new Response(JSON.stringify({ message: 'Multi-account ping finished!', results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Send a request to trigger multi-account pings.', { status: 200 });
  }
};

async function pingAllClaudeAccounts(env) {
  const accounts = [];
  if (env.CLAUDE_SESSION_KEY) {
    accounts.push({ 
      name: 'Account 1 (shlokshah412)', 
      key: env.CLAUDE_SESSION_KEY,
      chatUrl: env.CLAUDE_CHAT_URL_1 
    });
  }
  if (env.CLAUDE_SESSION_KEY_2) {
    accounts.push({ 
      name: 'Account 2 (pcgpt)', 
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

