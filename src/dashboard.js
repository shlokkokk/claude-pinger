export function renderDashboardHTML(initialAccounts = []) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
  <title>Claude Pulse</title>
  <meta name="description" content="Real-time intelligent rate-limit autopilot and multi-account switcher for Claude.">
  <meta name="theme-color" content="#060810">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Claude Pulse">
  <link rel="manifest" href="/manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ===== DESIGN SYSTEM TOKENS ===== */
    :root {
      --bg-base: #060810;
      --bg-elevated: #0c0f1a;
      --bg-card: #101424;
      --bg-card-hover: #151a30;
      --bg-input: rgba(255, 255, 255, 0.035);

      --border-dim: rgba(255, 255, 255, 0.06);
      --border-default: rgba(255, 255, 255, 0.09);
      --border-hover: rgba(255, 255, 255, 0.18);
      --border-focus: rgba(0, 229, 240, 0.4);

      --cyan: #00e5f0;
      --cyan-bright: #22f7ff;
      --purple: #b07df0;
      --purple-bright: #c99dff;
      --green: #00d68f;
      --green-dim: #0a9e6e;
      --amber: #ffb020;
      --red: #f04848;

      --text-100: #f0f2f8;
      --text-200: #c0c8d8;
      --text-300: #8890a8;
      --text-400: #5c6480;

      --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;

      --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border-dim);
      --shadow-modal: 0 20px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-default);
      --transition: 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* ===== RESET & ACCESSIBILITY ===== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
      scroll-behavior: smooth;
    }

    body {
      background: var(--bg-base);
      color: var(--text-100);
      font-family: var(--font);
      line-height: 1.5;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: max(16px, env(safe-area-inset-top, 16px));
      padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
      padding-left: max(16px, env(safe-area-inset-left, 16px));
      padding-right: max(16px, env(safe-area-inset-right, 16px));
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
    }

    /* ===== SCROLLBARS ===== */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

    /* ===== APP WRAPPER ===== */
    .app {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ===== KEYFRAMES ===== */
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; box-shadow: 0 0 7px currentColor; }
      50% { opacity: 0.35; box-shadow: 0 0 2px currentColor; }
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slide-toast {
      from { opacity: 0; transform: translateY(-12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes fade-toast {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(-8px) scale(0.96); }
    }

    /* ===== TOAST NOTIFICATIONS ===== */
    #toastContainer {
      position: fixed;
      top: max(16px, env(safe-area-inset-top, 16px));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
      width: calc(100% - 32px);
      max-width: 440px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      background: rgba(14, 18, 32, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 9px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px var(--border-dim);
      animation: slide-toast 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .toast-item.hide {
      animation: fade-toast 0.18s ease forwards;
    }

    .toast-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--cyan);
      flex-shrink: 0;
    }

    .toast-ok .toast-dot { background: var(--green); }
    .toast-err .toast-dot { background: var(--red); }
    .toast-warn .toast-dot { background: var(--amber); }

    /* ===== HEADER ===== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0 6px;
      gap: 12px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 11px;
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .brand-logo svg { width: 20px; height: 20px; }

    .brand-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .brand-info h1 {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
      line-height: 1.2;
    }

    .brand-info .brand-sub {
      font-size: 0.68rem;
      color: var(--text-300);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .clock-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      background: var(--bg-card);
      border: 1px solid var(--border-dim);
      padding: 6px 11px;
      border-radius: 20px;
      font-family: var(--mono);
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-200);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      background: var(--green);
      border-radius: 50%;
      animation: pulse-glow 2s infinite ease-in-out;
      color: var(--green);
      flex-shrink: 0;
    }

    /* ===== MODE SWITCHER ===== */
    .mode-switch {
      display: flex;
      background: var(--bg-elevated);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      padding: 3px;
      gap: 3px;
    }

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 9px 8px;
      min-height: 42px;
      border-radius: 9px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-400);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition);
      -webkit-user-select: none;
      user-select: none;
    }

    .mode-btn:hover { color: var(--text-200); background: rgba(255,255,255,0.03); }
    .mode-btn:active { transform: scale(0.97); }
    .mode-btn svg { width: 15px; height: 15px; flex-shrink: 0; }

    .mode-btn.active-quick {
      background: rgba(0, 214, 143, 0.1);
      color: var(--green);
      border-color: rgba(0, 214, 143, 0.25);
    }

    .mode-btn.active-deep {
      background: rgba(0, 229, 240, 0.1);
      color: var(--cyan);
      border-color: rgba(0, 229, 240, 0.25);
    }

    /* ===== HERO RECOMMENDATION ===== */
    .hero-card {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 16px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 11px;
      box-shadow: var(--shadow-card);
    }

    .hero-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--cyan), var(--purple));
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 9px;
      border-radius: var(--radius-sm);
      background: rgba(0, 229, 240, 0.1);
      color: var(--cyan);
      border: 1px solid rgba(0, 229, 240, 0.22);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .hero-badge svg { width: 11px; height: 11px; }

    .hero-reset-text {
      font-family: var(--mono);
      font-size: 0.70rem;
      font-weight: 500;
      color: var(--text-300);
      white-space: nowrap;
      text-align: right;
    }

    .hero-title {
      font-size: 1.22rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #fff;
      line-height: 1.25;
    }

    .hero-reason {
      font-size: 0.80rem;
      color: var(--text-200);
      line-height: 1.5;
    }

    .hero-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      min-height: 48px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 0.86rem;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, rgba(0, 229, 240, 0.14), rgba(176, 125, 240, 0.09));
      border: 1px solid rgba(0, 229, 240, 0.32);
      cursor: pointer;
      transition: all var(--transition);
      text-decoration: none;
    }

    .hero-cta:hover { background: linear-gradient(135deg, rgba(0, 229, 240, 0.22), rgba(176, 125, 240, 0.16)); border-color: rgba(0, 229, 240, 0.5); transform: translateY(-1px); }
    .hero-cta:active { transform: scale(0.98) translateY(0); }
    .hero-cta svg { width: 16px; height: 16px; flex-shrink: 0; }

    /* ===== ACCOUNT CARDS GRID ===== */
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
      gap: 10px;
      width: 100%;
    }

    @media (min-width: 440px) {
      .accounts-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .acc-card {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      overflow: hidden;
      position: relative;
      transition: border-color var(--transition);
      box-shadow: var(--shadow-card);
    }

    .acc-card:hover { border-color: var(--border-hover); }

    .acc-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .acc-name {
      font-size: 0.82rem;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .acc-status-pill {
      font-size: 0.60rem;
      font-weight: 700;
      font-family: var(--mono);
      padding: 2px 7px;
      border-radius: 5px;
      background: rgba(255,255,255,0.05);
      color: var(--text-300);
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .acc-status-pill.active { background: rgba(0, 214, 143, 0.12); color: var(--green); border: 1px solid rgba(0, 214, 143, 0.25); }
    .acc-status-pill.warning { background: rgba(255, 176, 32, 0.12); color: var(--amber); border: 1px solid rgba(255, 176, 32, 0.25); }

    .acc-gauge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ring-box {
      position: relative;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }

    .ring-box > svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-box circle { fill: none; stroke-width: 5; stroke-linecap: round; }
    .ring-bg { stroke: rgba(255,255,255,0.06); }
    .ring-progress { transition: stroke-dashoffset 0.7s ease; }

    .ring-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      pointer-events: none;
    }

    .ring-icon svg { width: 18px; height: 18px; transform: none !important; }

    .acc-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .acc-time-left {
      font-size: 0.86rem;
      font-weight: 800;
      font-family: var(--mono);
      color: var(--text-100);
      white-space: nowrap;
    }

    .acc-next-info {
      font-size: 0.65rem;
      color: var(--text-300);
      font-family: var(--mono);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .acc-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .btn-card {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px 6px;
      border-radius: var(--radius-sm);
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-100);
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-dim);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition);
      text-decoration: none;
      min-height: 40px;
    }

    .btn-card:hover { background: rgba(255,255,255,0.08); border-color: var(--border-hover); }
    .btn-card:active { transform: scale(0.97); }
    .btn-card svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* ===== GENERIC CARD CONTAINER ===== */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-card);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .card-title {
      font-size: 0.86rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      min-width: 0;
    }

    .card-title svg { width: 16px; height: 16px; color: var(--cyan); flex-shrink: 0; }

    .card-badge {
      font-size: 0.62rem;
      font-weight: 700;
      font-family: var(--mono);
      color: var(--text-300);
      flex-shrink: 0;
    }

    /* ===== DIAGNOSTICS BAR ===== */
    .diag-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      gap: 10px;
    }

    .diag-status {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--mono);
      font-weight: 600;
      font-size: 0.72rem;
      color: var(--green);
      white-space: nowrap;
      min-width: 0;
    }

    .btn-diag {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-dim);
      color: var(--text-100);
      padding: 6px 12px;
      min-height: 34px;
      border-radius: var(--radius-sm);
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all var(--transition);
      font-family: var(--font);
    }

    .btn-diag:hover { background: rgba(255,255,255,0.1); border-color: var(--border-hover); }
    .btn-diag svg { width: 13px; height: 13px; }

    /* ===== MANUAL CONTROLS GRID ===== */
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 132px), 1fr));
      gap: 8px;
    }

    .btn-ping {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px 6px;
      min-height: 80px;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.025);
      border: 1px solid var(--border-dim);
      cursor: pointer;
      transition: all var(--transition);
      gap: 4px;
    }

    .btn-ping:hover { background: rgba(255,255,255,0.06); border-color: var(--border-hover); }
    .btn-ping:active { transform: scale(0.96); }

    .btn-ping-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
    }

    .btn-ping-icon svg { width: 15px; height: 15px; }

    .btn-ping-label {
      font-size: 0.74rem;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .btn-ping-sub {
      font-size: 0.62rem;
      color: var(--text-400);
      font-family: var(--mono);
      font-weight: 500;
      white-space: nowrap;
    }

    /* ===== CONSOLE LOG ===== */
    .console {
      background: var(--bg-base);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      font-family: var(--mono);
      font-size: 0.70rem;
      color: var(--text-300);
      max-height: 120px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .log-row {
      display: flex;
      align-items: baseline;
      gap: 7px;
      word-break: break-word;
      line-height: 1.45;
    }

    .log-ts { color: var(--text-400); flex-shrink: 0; font-size: 0.65rem; }
    .log-text { color: var(--text-200); }
    .log-text.ok { color: var(--green); }
    .log-text.info { color: var(--cyan); }
    .log-text.err { color: var(--red); }

    /* ===== SCHEDULED PROMPTS FORM ===== */
    .queue-desc {
      font-size: 0.78rem;
      color: var(--text-200);
      line-height: 1.5;
    }

    .queue-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 4px;
    }

    .queue-form .form-group {
      min-width:0;
      padding:clamp(12px, 1.35vw, 17px);
      border:1px solid var(--border-dim);
      border-radius:14px;
      background:linear-gradient(145deg, rgba(255,255,255,.026), rgba(255,255,255,.008));
      gap:10px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--text-300);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-label svg { width: 13px; height: 13px; color: var(--cyan); flex-shrink: 0; }

    .form-hint {
      font-size: 0.66rem;
      color: var(--text-400);
      line-height: 1.4;
    }

    .form-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 8px;
    }

    .select-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .select-wrap .left-icon {
      position: absolute;
      left: 12px;
      pointer-events: none;
      color: var(--cyan);
      display: flex;
      z-index: 1;
    }

    .select-wrap .left-icon svg { width: 16px; height: 16px; }

    .form-select {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-100);
      padding: 12px 38px 12px 38px;
      font-size: 0.84rem;
      font-family: var(--font);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition);
      min-height: 44px;
    }

    .form-select:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.05); }
    .form-select:focus { border-color: var(--cyan); outline: none; box-shadow: 0 0 0 3px rgba(0, 229, 240, 0.14); }
    .form-select option { background: var(--bg-card); color: var(--text-100); }

    .select-wrap .chevron {
      position: absolute;
      right: 12px;
      pointer-events: none;
      color: var(--text-400);
      display: flex;
      transition: color var(--transition);
    }

    .select-wrap:hover .chevron { color: var(--text-200); }
    .select-wrap .chevron svg { width: 14px; height: 14px; }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .input-wrap .left-icon {
      position: absolute;
      left: 12px;
      pointer-events: none;
      color: var(--text-400);
      display: flex;
      z-index: 1;
    }

    .input-wrap .left-icon svg { width: 15px; height: 15px; }

    .form-input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      color: var(--text-100);
      padding: 12px 36px 12px 38px;
      font-size: 0.82rem;
      font-family: var(--mono);
      outline: none;
      transition: all var(--transition);
      min-height: 44px;
    }

    .form-input:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.05); }
    .form-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0, 229, 240, 0.14); background: rgba(255,255,255,0.06); }
    .form-input::placeholder { color: var(--text-400); }
    .form-input[type="time"] { color-scheme: dark; }
    /* ===== QUANTUM CHRONO-DECK (Next-Gen 12-Hour Precision Controller) ===== */
    .chrono-deck {
      background: linear-gradient(145deg, rgba(12, 17, 32, 0.95), rgba(16, 23, 44, 0.95));
      border: 1px solid rgba(0, 229, 240, 0.22);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all var(--transition);
    }
    .chrono-deck:focus-within {
      border-color: rgba(0, 229, 240, 0.5);
      box-shadow: 0 10px 32px rgba(0, 229, 240, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .chrono-deck-main {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .chrono-clock-cluster {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chrono-stepper-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 70px;
    }

    .stepper-btn {
      width: 100%;
      height: 24px;
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid var(--border-dim);
      border-radius: 5px;
      color: var(--text-300);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      padding: 0;
      user-select: none;
    }
    .stepper-btn:hover {
      background: rgba(0, 229, 240, 0.15);
      border-color: var(--cyan);
      color: #22f7ff;
      transform: translateY(-1px);
    }
    .stepper-btn:active {
      transform: scale(0.94);
    }
    .stepper-btn svg {
      width: 13px;
      height: 13px;
    }

    .chrono-digit-box {
      width: 100%;
      height: 52px;
      background: rgba(6, 9, 18, 0.9);
      border: 1px solid rgba(0, 229, 240, 0.28);
      border-radius: 8px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
      cursor: text;
    }
    .chrono-digit-box:focus-within {
      border-color: #22f7ff;
      box-shadow: 0 0 14px rgba(0, 229, 240, 0.35), inset 0 2px 6px rgba(0, 0, 0, 0.6);
    }

    .chrono-digit-input {
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #22f7ff;
      font-family: var(--mono);
      font-size: 26px;
      font-weight: 800;
      text-align: center;
      letter-spacing: 0.5px;
      text-shadow: 0 0 10px rgba(34, 247, 255, 0.4);
      padding: 0 4px 6px 4px;
      caret-color: #22f7ff;
      cursor: text;
    }

    .chrono-digit-sub {
      position: absolute;
      bottom: 3px;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: var(--text-400);
      font-family: var(--font);
      pointer-events: none;
      user-select: none;
      text-transform: uppercase;
    }

    .chrono-colon {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 0 2px;
      user-select: none;
      margin-bottom: 2px;
    }
    .colon-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #22f7ff;
      box-shadow: 0 0 8px #22f7ff;
      animation: pulseColonDot 2s infinite ease-in-out;
    }
    @keyframes pulseColonDot {
      0%, 100% { opacity: 0.95; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.85); }
    }

    .meridiem-dock {
      display: flex;
      flex-direction: column;
      gap: 5px;
      height: 108px;
      justify-content: center;
      margin-left: 2px;
    }

    .btn-meridiem-switch {
      border: 1px solid var(--border-dim);
      background: rgba(14, 18, 34, 0.85);
      color: var(--text-400);
      font-family: var(--font);
      font-size: 11px;
      font-weight: 800;
      border-radius: 6px;
      padding: 7px 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
      min-width: 58px;
      justify-content: center;
    }
    .btn-meridiem-switch:hover:not(.active) {
      color: var(--text-200);
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--border-hover);
    }
    .btn-meridiem-switch.active.am {
      background: linear-gradient(135deg, rgba(0, 229, 240, 0.22), rgba(0, 214, 143, 0.18));
      border-color: var(--cyan);
      color: #22f7ff;
      box-shadow: 0 0 12px rgba(0, 229, 240, 0.25);
    }
    .btn-meridiem-switch.active.pm {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.2));
      border-color: #a855f7;
      color: #d8b4fe;
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.25);
    }
    .btn-meridiem-switch svg {
      width: 11px;
      height: 11px;
    }

    .chrono-divider {
      width: 1px;
      height: 48px;
      background: rgba(255, 255, 255, 0.08);
      margin: 0 2px;
    }

    .chrono-quick-adjust {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .btn-quick-adjust {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-dim);
      border-radius: 6px;
      color: var(--text-200);
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 700;
      padding: 7px 11px;
      cursor: pointer;
      transition: all var(--transition);
      white-space: nowrap;
    }
    .btn-quick-adjust:hover {
      background: rgba(0, 229, 240, 0.12);
      border-color: var(--cyan);
      color: #22f7ff;
      transform: translateY(-1px);
    }
    .btn-quick-adjust.now {
      background: rgba(0, 214, 143, 0.1);
      border-color: rgba(0, 214, 143, 0.3);
      color: var(--green);
    }
    .btn-quick-adjust.now:hover {
      background: rgba(0, 214, 143, 0.2);
      border-color: var(--green);
      color: #fff;
    }

    .chrono-presets-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .chrono-presets-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .chrono-presets-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: var(--text-400);
      text-transform: uppercase;
    }
    .preset-auto-badge {
      font-size: 8px;
      font-weight: 800;
      color: var(--cyan);
      background: rgba(0, 229, 240, 0.12);
      border: 1px solid rgba(0, 229, 240, 0.28);
      border-radius: 4px;
      padding: 1px 5px;
      font-family: var(--mono);
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .chrono-presets-sub {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-400);
      font-family: var(--font);
      white-space: nowrap;
    }
    .smart-queue-callout {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 7px 11px;
      background: linear-gradient(135deg, rgba(0, 229, 240, 0.08), rgba(176, 125, 240, 0.06));
      border: 1px solid rgba(0, 229, 240, 0.28);
      border-radius: var(--radius-sm);
      font-size: 0.72rem;
      color: var(--text-200);
      margin-bottom: 8px;
      animation: fade-in 0.2s ease;
    }
    .smart-queue-callout-text {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      flex-wrap: wrap;
    }
    .smart-queue-callout-text svg {
      color: var(--cyan);
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }
    .smart-queue-callout-text strong {
      color: #fff;
      font-family: var(--mono);
    }
    .btn-callout-apply {
      background: rgba(0, 229, 240, 0.15);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      font-family: var(--mono);
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition);
      flex-shrink: 0;
    }
    .btn-callout-apply:hover {
      background: var(--cyan);
      color: #000;
    }
    .chrono-presets-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    }
    .chrono-preset-pill {
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid var(--border-dim);
      border-radius: 6px;
      color: var(--text-200);
      padding: 6px 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      transition: all var(--transition);
      text-align: left;
    }
    .chrono-preset-pill:hover {
      background: rgba(0, 229, 240, 0.1);
      border-color: var(--cyan);
      transform: translateY(-1px);
    }
    .chrono-preset-pill.highlight-reset {
      background: rgba(0, 229, 240, 0.07);
      border-color: rgba(0, 229, 240, 0.35);
    }
    .chrono-preset-pill.highlight-reset:hover {
      background: rgba(0, 229, 240, 0.18);
      border-color: var(--cyan);
    }
    .chrono-preset-pill.current-selected {
      border-color: var(--cyan);
      background: rgba(0, 229, 240, 0.16);
      box-shadow: 0 0 10px rgba(0, 229, 240, 0.18);
    }
    .preset-pill-time {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .preset-pill-sub {
      font-size: 9px;
      font-weight: 600;
      color: var(--text-400);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .preset-dot-claude {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 6px var(--cyan);
      flex-shrink: 0;
    }

    /* Live HUD Status Readout */
    .chrono-hud-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 12px;
      background: rgba(0, 229, 240, 0.05);
      border: 1px solid rgba(0, 229, 240, 0.2);
      border-radius: var(--radius-sm);
      animation: fade-in 0.25s ease;
    }
    .hud-status-main {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-wrap: wrap;
    }
    .hud-pulse-ring {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 8px var(--cyan);
      flex-shrink: 0;
    }
    .hud-primary-time {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 800;
      color: #22f7ff;
      white-space: nowrap;
    }
    .hud-countdown-badge {
      font-family: var(--font);
      font-size: 10px;
      font-weight: 700;
      color: var(--text-300);
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .hud-tz-tag {
      font-family: var(--mono);
      font-size: 9px;
      font-weight: 700;
      color: var(--text-400);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    @media (max-width: 900px) {
      .chrono-presets-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 640px) {
      .chrono-deck {
        padding: 12px;
        gap: 10px;
      }
      .chrono-deck-main {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .chrono-clock-cluster {
        justify-content: center;
      }
      .chrono-divider {
        display: none;
      }
      .chrono-quick-adjust {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        width: 100%;
        gap: 6px;
      }
      .btn-quick-adjust {
        min-height: 38px;
        padding: 8px 4px;
        font-size: 11px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chrono-presets-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .chrono-hud-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      .hud-tz-tag {
        align-self: flex-end;
      }
    }

    /* Clear button inside input */
    .btn-clear-input {
      position: absolute;
      right: 10px;
      background: rgba(255,255,255,0.06);
      border: none;
      color: var(--text-400);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition);
      z-index: 2;
    }

    .btn-clear-input:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .btn-clear-input svg { width: 13px; height: 13px; }

    /* Mobile iOS font-size >= 16px to prevent automatic safari viewport zoom */
    @media (max-width: 768px) {
      .form-select, .form-input {
        font-size: 16px !important;
      }
    }

    .url-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      flex-wrap: wrap;
    }

    .url-bar .form-hint { flex: 1; min-width: 100px; }

    .url-btns {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .verify-badge {
      font-size: 0.62rem;
      font-weight: 700;
      font-family: var(--mono);
      padding: 3px 8px;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .verify-badge.idle { background: rgba(255,255,255,0.04); color: var(--text-400); border: 1px solid var(--border-dim); }
    .verify-badge.valid { background: rgba(0, 214, 143, 0.12); color: var(--green); border: 1px solid rgba(0, 214, 143, 0.3); }
    .verify-badge.warning { background: rgba(255, 176, 32, 0.12); color: var(--amber); border: 1px solid rgba(255, 176, 32, 0.3); }
    .verify-badge.invalid { background: rgba(240, 72, 72, 0.12); color: var(--red); border: 1px solid rgba(240, 72, 72, 0.3); }
    .verify-badge.checking { background: rgba(0, 229, 240, 0.1); color: var(--cyan); border: 1px solid rgba(0, 229, 240, 0.25); }

    .btn-link {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-dim);
      color: var(--text-100);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      min-height: 34px;
      font-size: 0.70rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all var(--transition);
      font-family: var(--font);
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-link:hover:not(:disabled) { background: rgba(0, 229, 240, 0.1); border-color: var(--cyan); color: var(--cyan); }
    .btn-link:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }

    .btn-link-accent {
      background: rgba(0, 229, 240, 0.1);
      border: 1px solid rgba(0, 229, 240, 0.3);
      color: var(--cyan);
    }

    .btn-link-accent:hover { background: rgba(0, 229, 240, 0.2); border-color: var(--cyan); }
    .btn-link svg, .btn-link-accent svg { width: 13px; height: 13px; flex-shrink: 0; }

    .url-preview {
      background: rgba(9, 16, 23, 0.72);
      border: 1px solid rgba(0, 229, 240, 0.2);
      border-radius: 9px;
      padding: 8px 10px;
      font-size: 0.68rem;
      font-family: var(--mono);
      display: flex;
      flex-direction: column;
      gap: 0;
      animation: fade-in 0.2s ease;
    }

    .url-preview.error { border-color: rgba(240, 72, 72, 0.28); background: rgba(240, 72, 72, 0.05); }

    .url-preview-head { display:flex; justify-content:space-between; align-items:center; font-weight:700; gap:8px; min-width:0; }
    .url-preview-head > span:first-child { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .url-preview-id { color:var(--text-400); font-size:.62rem; white-space:nowrap; }

    .url-preview-row {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-200);
      font-size: 0.68rem;
      word-break: break-all;
    }

    .queue-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 4px;
    }

    @media (max-width: 480px) {
      .queue-btns { grid-template-columns: 1fr; }
    }

    .btn-queue-primary {
      min-height: 48px;
      background: linear-gradient(135deg, rgba(0, 229, 240, 0.16), rgba(0, 214, 143, 0.12));
      border: 1px solid rgba(0, 229, 240, 0.38);
      color: var(--cyan);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all var(--transition);
      width: 100%;
      font-family: var(--font);
    }

    .btn-queue-primary:hover:not(:disabled) { background: linear-gradient(135deg, rgba(0, 229, 240, 0.26), rgba(0, 214, 143, 0.2)); border-color: var(--cyan); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(0, 229, 240, 0.22); }
    .btn-queue-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-queue-primary:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
    .btn-queue-primary svg { width: 16px; height: 16px; flex-shrink: 0; }

    .btn-queue-secondary {
      min-height: 48px;
      background: rgba(255,255,255,0.035);
      border: 1px solid var(--border-default);
      color: var(--text-100);
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-weight: 700;
      font-size: 0.84rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all var(--transition);
      width: 100%;
      font-family: var(--font);
    }

    .btn-queue-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: var(--border-hover); transform: translateY(-1px); }
    .btn-queue-secondary:active:not(:disabled) { transform: translateY(0); }
    .btn-queue-secondary:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
    .btn-queue-secondary svg { width: 15px; height: 15px; flex-shrink: 0; }

    /* ===== TIMING MODES & FLEXIBLE SLOTS ===== */
    .timing-pill-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid var(--border-dim);
      padding: 4px;
      border-radius: var(--radius-sm);
    }

    .timing-pill-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-300);
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all var(--transition);
      font-family: var(--font);
      white-space: nowrap;
    }

    .timing-pill-btn:hover { color: var(--text-100); background: rgba(255, 255, 255, 0.04); }
    .timing-pill-btn.active {
      background: rgba(0, 229, 240, 0.12);
      border-color: rgba(0, 229, 240, 0.35);
      color: var(--cyan);
    }

    .target-badge {
      font-family: var(--mono);
      font-weight: 700;
      font-size: 0.60rem;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-200);
      border: 1px solid var(--border-dim);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .target-badge.slot { background: rgba(176, 125, 240, 0.12); color: var(--purple-bright); border-color: rgba(176, 125, 240, 0.3); }
    .target-badge.time { background: rgba(0, 229, 240, 0.12); color: var(--cyan); border-color: rgba(0, 229, 240, 0.3); }

    .btn-dispatch-task {
      background: rgba(0, 229, 240, 0.08);
      border: 1px solid rgba(0, 229, 240, 0.28);
      color: var(--cyan);
      border-radius: var(--radius-sm);
      padding: 5px 9px;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all var(--transition);
      font-family: var(--font);
    }

    .btn-dispatch-task:hover { background: rgba(0, 229, 240, 0.18); border-color: var(--cyan); }
    .btn-dispatch-task svg { width: 12px; height: 12px; flex-shrink: 0; }
    .task-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    /* ===== ACTIVE QUEUED TASKS & EXECUTION HISTORY ===== */
    .tasks-divider {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border-dim);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .tasks-divider {
      margin-top: 26px;
      padding-top: 20px;
      border-top: 1px solid var(--border-dim);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .tasks-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .tasks-section.history-section {
      margin-top: 6px;
      padding-top: 22px;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.74rem;
      font-weight: 800;
      color: var(--text-200);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0 6px;
      margin-bottom: 2px;
    }

    .tasks-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .task-count {
      font-family: var(--mono);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 9px;
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      color: var(--text-100);
      letter-spacing: normal;
    }

    .task-count.queued {
      background: rgba(0, 229, 240, 0.12);
      color: var(--cyan);
      border: 1px solid rgba(0, 229, 240, 0.28);
    }

    .task-count.completed {
      background: rgba(0, 214, 143, 0.12);
      color: var(--green);
      border: 1px solid rgba(0, 214, 143, 0.28);
    }

    .btn-clear-completed {
      background: rgba(240, 72, 72, 0.08);
      border: 1px solid rgba(240, 72, 72, 0.22);
      color: var(--red);
      font-size: 0.68rem;
      font-weight: 700;
      border-radius: 6px;
      padding: 5px 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-family: var(--font);
      transition: all var(--transition);
      margin-right: 2px;
    }

    .btn-clear-completed:hover:not(:disabled) {
      background: rgba(240, 72, 72, 0.18);
      border-color: var(--red);
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(240, 72, 72, 0.2);
    }

    .btn-clear-completed:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      border-color: var(--border-dim);
      color: var(--text-400);
      background: transparent;
    }

    /* Ultra-Sleek Glassmorphism History Item */
    .history-card {
      background: rgba(13, 18, 32, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all var(--transition);
      backdrop-filter: blur(8px);
    }

    .history-card:hover {
      background: rgba(17, 24, 42, 0.9);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .history-card.failed {
      border-color: rgba(240, 72, 72, 0.24);
    }

    .history-card.failed:hover {
      border-color: rgba(240, 72, 72, 0.42);
    }

    .history-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .history-head-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .history-acc-tag {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .history-acc-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .history-pill {
      font-family: var(--mono);
      font-size: 0.60rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .history-pill.done {
      background: rgba(0, 214, 143, 0.12);
      color: var(--green);
      border: 1px solid rgba(0, 214, 143, 0.25);
    }

    .history-pill.failed {
      background: rgba(240, 72, 72, 0.12);
      color: var(--red);
      border: 1px solid rgba(240, 72, 72, 0.25);
    }

    .history-time-tag {
      font-family: var(--mono);
      font-size: 0.65rem;
      color: var(--text-300);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.03);
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid var(--border-dim);
    }

    .btn-history-del {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-400);
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition);
      flex-shrink: 0;
    }

    .btn-history-del:hover {
      background: rgba(240, 72, 72, 0.15);
      border-color: rgba(240, 72, 72, 0.3);
      color: var(--red);
    }

    .history-prompt-row {
      font-size: 0.80rem;
      color: var(--text-100);
      line-height: 1.45;
      font-family: var(--mono);
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.22);
      border-radius: 6px;
      border-left: 2px solid rgba(0, 214, 143, 0.4);
      word-break: break-word;
    }

    .history-card.failed .history-prompt-row {
      border-left-color: rgba(240, 72, 72, 0.4);
    }

    .history-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 0.66rem;
      color: var(--text-300);
      flex-wrap: wrap;
    }

    .history-url-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--cyan);
      text-decoration: none;
      font-family: var(--mono);
      font-size: 0.65rem;
      font-weight: 600;
      transition: opacity var(--transition);
      max-width: 280px;
    }

    .history-url-chip:hover {
      opacity: 0.8;
      text-decoration: underline;
    }

    .history-url-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-finished-text {
      font-family: var(--mono);
      color: var(--text-300);
      font-size: 0.65rem;
    }

    /* Accordion Button */
    .btn-queue-expand {
      width: 100%;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 9px 14px;
      color: var(--text-200);
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all var(--transition);
      font-family: var(--font);
      margin-top: 4px;
    }

    .btn-queue-expand:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    .btn-queue-expand svg {
      width: 12px;
      height: 12px;
      transition: transform var(--transition);
    }

    .btn-queue-expand.expanded svg {
      transform: rotate(180deg);
    }

    .expand-badge {
      background: rgba(0, 229, 240, 0.14);
      color: var(--cyan);
      font-family: var(--mono);
      font-size: 0.62rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 8px;
      border: 1px solid rgba(0, 229, 240, 0.25);
    }

    .expand-badge.completed {
      background: rgba(0, 214, 143, 0.14);
      color: var(--green);
      border-color: rgba(0, 214, 143, 0.25);
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-card {
      background: rgba(15, 20, 36, 0.95);
      border: 1px solid rgba(0, 229, 240, 0.2);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: border-color var(--transition);
    }

    .task-card.completed { border-color: rgba(0, 214, 143, 0.25); }
    .task-card.failed { border-color: rgba(240, 72, 72, 0.25); }

    .task-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .task-acc-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .task-acc-name {
      font-weight: 800;
      font-size: 0.84rem;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-status {
      font-family: var(--mono);
      font-weight: 800;
      font-size: 0.62rem;
      padding: 2px 8px;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .task-status.queued { background: rgba(0, 229, 240, 0.1); color: var(--cyan); border: 1px solid rgba(0, 229, 240, 0.25); }
    .task-status.completed { background: rgba(0, 214, 143, 0.1); color: var(--green); border: 1px solid rgba(0, 214, 143, 0.25); }
    .task-status.failed { background: rgba(240, 72, 72, 0.1); color: var(--red); border: 1px solid rgba(240, 72, 72, 0.25); }

    /* Custom prompt container without wrapping bugs */
    .task-prompt-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .task-prompt-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--cyan);
    }

    .task-prompt-badge svg { width: 11px; height: 11px; flex-shrink: 0; }

    .task-prompt-content {
      font-family: var(--mono);
      font-size: 0.74rem;
      color: var(--text-100);
      line-height: 1.55;
      overflow-wrap: anywhere;
      word-break: normal;
      white-space: pre-wrap;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.68rem;
      color: var(--text-300);
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 2px;
    }

    .task-url-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 229, 240, 0.08);
      border: 1px solid rgba(0, 229, 240, 0.22);
      border-radius: 6px;
      padding: 5px 9px;
      color: var(--cyan);
      text-decoration: none;
      font-family: var(--mono);
      font-size: 0.68rem;
      font-weight: 600;
      max-width: 100%;
      transition: all var(--transition);
    }

    .task-url-chip:hover {
      background: rgba(0, 229, 240, 0.16);
      border-color: var(--cyan);
    }

    .task-url-chip svg { width: 12px; height: 12px; flex-shrink: 0; }

    .task-url-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    .task-timing-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--mono);
      font-size: 0.66rem;
      color: var(--text-300);
      white-space: nowrap;
    }

    .task-timing-chip svg { width: 12px; height: 12px; flex-shrink: 0; }

    .btn-cancel-task {
      background: rgba(240, 72, 72, 0.08);
      border: 1px solid rgba(240, 72, 72, 0.24);
      border-radius: 6px;
      color: var(--red);
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 12px;
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all var(--transition);
      font-family: var(--font);
      flex-shrink: 0;
    }

    .btn-cancel-task:hover { background: rgba(240, 72, 72, 0.18); border-color: var(--red); }
    .btn-cancel-task svg { width: 12px; height: 12px; }

    /* ===== 24H TIMELINE ===== */
    .timeline-banner {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      padding: 9px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.72rem;
    }

    .timeline-pill {
      font-weight: 800;
      font-size: 0.66rem;
      padding: 3px 8px;
      border-radius: 5px;
      font-family: var(--mono);
      white-space: nowrap;
    }

    .timeline-pill.now { background: rgba(255,255,255,0.12); color: #fff; }

    .btn-timeline-reset {
      background: rgba(0, 229, 240, 0.1);
      border: 1px solid rgba(0, 229, 240, 0.25);
      color: var(--cyan);
      border-radius: 4px;
      font-size: 0.64rem;
      font-weight: 700;
      padding: 2px 7px;
      cursor: pointer;
      font-family: var(--font);
      transition: all var(--transition);
    }

    .btn-timeline-reset:hover { background: rgba(0, 229, 240, 0.2); }

    .timeline-lanes {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }

    .lane-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .lane-label {
      flex: 0 1 8ch;
      max-width: 35%;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--mono);
      flex-shrink: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .lane-track {
      flex: 1;
      height: 12px;
      background: rgba(255,255,255,0.04);
      border-radius: 6px;
      position: relative;
      overflow: visible;
      cursor: pointer;
    }

    .lane-band {
      position: absolute;
      top: 0; bottom: 0;
      border-radius: 6px;
      pointer-events: none;
    }

    .lane-node {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--bg-base);
      cursor: pointer;
      transition: all 0.16s ease;
      z-index: 5;
    }

    .lane-node:hover, .lane-node.selected {
      transform: translate(-50%, -50%) scale(1.4);
      border-color: #fff;
      z-index: 20;
    }

    .now-cursor {
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 2px;
      background: #fff;
      box-shadow: 0 0 6px #fff, 0 0 12px rgba(255,255,255,0.6);
      z-index: 10;
      pointer-events: none;
    }

    .time-axis {
      display: flex;
      justify-content: space-between;
      font-size: 0.64rem;
      color: var(--text-400);
      font-family: var(--mono);
      margin-top: 2px;
      padding-left: calc(8ch + 8px);
    }

    /* ===== SCHEDULE LIST ===== */
    .sched-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sched-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      font-size: 0.76rem;
      cursor: pointer;
      gap: 8px;
      min-width: 0;
      transition: all var(--transition);
    }

    .sched-item:hover, .sched-item.hl { background: rgba(255,255,255,0.05); border-color: var(--border-hover); }

    .sched-left {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      min-width: 0;
      overflow: hidden;
    }

    .sched-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .sched-time {
      font-family: var(--mono);
      font-weight: 700;
      color: #fff;
      font-size: 0.76rem;
    }

    .sched-name {
      font-size: 0.72rem;
      font-weight: 700;
      margin-left: 2px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sched-right {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--text-400);
      min-width: 0;
      flex: 0 1 auto;
    }

    .sched-right > span:last-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .sched-badge {
      font-size: 0.58rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 214, 143, 0.1);
      color: var(--green);
      font-family: var(--mono);
      font-weight: 700;
    }

    /* ===== CONFIRMATION MODAL ===== */
    .modal-bg {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.76);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }

    .modal-bg.open { opacity: 1; visibility: visible; }

    .modal-box {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      padding: 22px;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--shadow-modal);
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }

    .modal-bg.open .modal-box { transform: scale(1); }

    .modal-head {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(0, 229, 240, 0.1);
      border: 1px solid rgba(0, 229, 240, 0.25);
      color: var(--cyan);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon-box svg { width: 20px; height: 20px; }

    .modal-head-text h3 { font-size: 1.05rem; font-weight: 800; color: #fff; }
    .modal-head-text p { font-size: 0.70rem; color: var(--text-400); }

    .modal-body {
      font-size: 0.84rem;
      color: var(--text-200);
      line-height: 1.55;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-sm);
      padding: 14px;
    }

    .modal-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .btn-modal {
      padding: 12px 14px;
      min-height: 44px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);
      font-family: var(--font);
    }

    .btn-modal-cancel {
      background: rgba(255,255,255,0.05);
      color: var(--text-200);
      border: 1px solid var(--border-dim);
    }

    .btn-modal-cancel:hover { background: rgba(255,255,255,0.09); }

    .btn-modal-ok {
      background: linear-gradient(135deg, rgba(0, 229, 240, 0.16), rgba(0, 229, 240, 0.08));
      border: 1px solid rgba(0, 229, 240, 0.38);
      color: #fff;
      font-weight: 800;
    }

    .btn-modal-ok:hover { background: linear-gradient(135deg, rgba(0, 229, 240, 0.26), rgba(0, 229, 240, 0.15)); }

    .btn-modal-danger {
      background: linear-gradient(135deg, rgba(240, 72, 72, 0.22), rgba(240, 72, 72, 0.10));
      border: 1px solid rgba(240, 72, 72, 0.45);
      color: #ff7878;
      font-weight: 800;
    }

    .btn-modal-danger:hover {
      background: linear-gradient(135deg, rgba(240, 72, 72, 0.35), rgba(240, 72, 72, 0.18));
      border-color: var(--red);
      color: #fff;
    }

    .btn-modal-amber {
      background: linear-gradient(135deg, rgba(255, 176, 32, 0.22), rgba(255, 176, 32, 0.10));
      border: 1px solid rgba(255, 176, 32, 0.45);
      color: #ffc95c;
      font-weight: 800;
    }

    .btn-modal-amber:hover {
      background: linear-gradient(135deg, rgba(255, 176, 32, 0.35), rgba(255, 176, 32, 0.18));
      border-color: var(--amber);
      color: #fff;
    }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      color: var(--text-400);
      font-size: 0.74rem;
      text-align: center;
      padding: 22px 16px;
      background: rgba(255,255,255,0.015);
      border: 1px dashed rgba(255,255,255,0.08);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      line-height: 1.5;
    }

    .empty-state svg { opacity: 0.45; }

    /* ===== FOOTER ===== */
    .footer {
      text-align: center;
      font-size: 0.70rem;
      color: var(--text-400);
      padding: 8px 0 4px;
    }

    /* ===== ADAPTIVE RESPONSIVENESS ===== */
    @media (max-width: 400px) {
      .header { flex-wrap: wrap; gap: 8px; }
      .lane-label { flex-basis: 6ch; width: auto; font-size: 0.65rem; }
      .time-axis { padding-left: calc(6ch + 8px); }
      .hero-title { font-size: 1.10rem; }
      .task-url-text { max-width: 140px; }
      .sched-right span:not(.sched-badge) { display: none; }
    }

    /* ===== POLISHED PRODUCT LAYER ===== */
    :root {
      --bg-base: #080a0f;
      --bg-elevated: #0d1119;
      --bg-card: #111722;
      --bg-card-hover: #171f2b;
      --border-dim: rgba(193, 207, 227, 0.09);
      --border-default: rgba(193, 207, 227, 0.13);
      --border-hover: rgba(193, 207, 227, 0.25);
      --cyan: #78e3d2;
      --cyan-bright: #9bf2e3;
      --green: #83d6a4;
      --purple: #b9a2f6;
      --purple-bright: #cfc0ff;
      --text-100: #f4f5f7;
      --text-200: #c5cbd5;
      --text-300: #929bab;
      --text-400: #707b8d;
      --radius-sm: 10px;
      --radius-md: 14px;
      --radius-lg: 19px;
      --radius-xl: 24px;
      --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.22);
    }

    body {
      background:
        radial-gradient(ellipse at 50% -24%, rgba(71, 128, 135, 0.16), transparent 48%),
        var(--bg-base);
      padding-top: max(22px, env(safe-area-inset-top, 22px));
      padding-bottom: max(32px, env(safe-area-inset-bottom, 32px));
    }

    .app { width: min(100%, 1280px); max-width: none; gap: 18px; }
    .header { padding: 6px 2px 10px; }
    .brand { gap: 12px; }
    .brand-logo { width: 42px; height: 42px; border-radius: 14px; background: #121925; }
    .brand-info h1 { font-size: 1.12rem; letter-spacing: -0.04em; }
    .brand-info .brand-sub { font-size: 0.72rem; font-weight: 500; }
    .clock-pill { padding: 8px 12px; background: rgba(18, 25, 36, 0.82); }

    .mode-switch {
      padding: 5px;
      border-color: var(--border-default);
      border-radius: var(--radius-md);
      background: rgba(15, 20, 29, 0.92);
    }
    .mode-btn { min-height: 44px; font-size: 0.78rem; border-radius: 10px; }

    .hero-card {
      padding: 22px;
      gap: 13px;
      border-radius: var(--radius-xl);
      background: linear-gradient(145deg, rgba(24, 35, 44, 0.98), rgba(16, 21, 31, 0.98) 62%);
      border-color: rgba(120, 227, 210, 0.23);
      box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28), inset 0 1px rgba(255,255,255,.035);
    }
    .hero-card::before { height: 2px; opacity: .8; }
    .hero-title { font-size: clamp(1.28rem, 4vw, 1.58rem); letter-spacing: -0.04em; line-height: 1.22; }
    .hero-reason { max-width: 54ch; color: #b8c2ce; font-size: .86rem; }
    .hero-cta { min-height: 50px; border-radius: 13px; background: linear-gradient(120deg, rgba(120,227,210,.18), rgba(185,162,246,.12)); border-color: rgba(120,227,210,.4); }

    .accounts-grid { gap: 12px; }
    .acc-card, .card {
      border-color: var(--border-default);
      background: linear-gradient(150deg, rgba(18, 24, 35, .98), rgba(15, 20, 29, .98));
      box-shadow: var(--shadow-card), inset 0 1px rgba(255,255,255,.025);
    }
    .acc-card { padding: 16px; gap: 14px; border-radius: var(--radius-lg); }
    .card { padding: 20px; gap: 16px; border-radius: var(--radius-lg); }
    .card-title { font-size: .94rem; letter-spacing: -.015em; }
    .card-title svg, .form-label svg { color: var(--cyan); }
    .diag-bar { padding: 11px 13px; border-radius: 11px; background: rgba(255,255,255,.025); }
    .btn-diag, .btn-link, .btn-card { border-radius: 10px; }
    .form-group { gap: 8px; }
    .form-label { font-size: .7rem; letter-spacing: .065em; }
    .form-hint { font-size: .71rem; color: #8994a5; }
    .form-input, .form-select { border-radius: 11px; background: rgba(5,8,13,.42); }
    .form-input:focus, .form-select:focus { border-color: rgba(120,227,210,.62); box-shadow: 0 0 0 3px rgba(120,227,210,.12); }
    .timing-pill-group { gap: 5px; border-radius: 11px; }
    .timing-pill-btn { min-height: 38px; padding: 7px 6px; font-size: .72rem; border-radius: 8px; }
    .timing-pill-btn.active { color: var(--cyan-bright); background: rgba(120,227,210,.12); border-color: rgba(120,227,210,.3); }
    .timing-pill-btn > span { display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
    .timing-pill-btn svg { width: 15px; height: 15px; flex: 0 0 auto; }
    .console { border-radius: 11px; padding: 12px; }
    .timeline-banner { border-radius: 12px; }
    .footer { padding-top: 12px; font-size: .72rem; }

    /* Keep labels intact and controls comfortable on narrow phones. */
    button, .card-title, .form-label, .hero-badge, .card-badge { word-break: normal; overflow-wrap: normal; hyphens: none; }
    button { line-height: 1.25; }
    :focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }

    @media (max-width: 480px) {
      body { padding-left: max(14px, env(safe-area-inset-left, 14px)); padding-right: max(14px, env(safe-area-inset-right, 14px)); }
      .app { gap: 14px; }
      .hero-card { padding: 18px; }
      .card { padding: 16px; gap: 14px; }
      .card-title { white-space: normal; }
      .card-header { align-items: flex-start; }
      .card-badge { white-space: nowrap; padding-top: 2px; }
      .timing-pill-group { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .timing-pill-btn { white-space: normal; text-align: center; }
      .diag-status { font-size: .68rem; }
      .task-actions { width: 100%; }
      .task-actions > button { flex: 1 1 0; justify-content: center; min-height: 42px; }
      .tasks-header { padding: 0 4px; gap: 8px; margin-bottom: 4px; }
      .tasks-header-left { gap: 6px; }
      .tasks-header-left > span:first-child { font-size: 0.69rem; }
      .btn-clear-completed { padding: 4px 9px; font-size: 0.65rem; gap: 4px; }
      .history-card { padding: 10px 12px; gap: 7px; }
      .history-head-left { gap: 6px; }
      .history-prompt-row { font-size: 0.76rem; padding: 5px 8px; }
      .history-foot { font-size: 0.62rem; gap: 6px; }
      .history-url-chip { max-width: 170px; font-size: 0.62rem; }
    }

    @media (min-width: 960px) {
      .app {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        align-items: start;
        column-gap: clamp(18px, 2vw, 28px);
        row-gap: 20px;
      }
      .app > .header,
      .app > .mode-switch,
      .app > .hero-card,
      .app > .accounts-grid,
      .app > .footer { grid-column: 1 / -1; }
      .app > .manual-card,
      .app > #taskQueueSection { grid-column: 1 / -1; }
      .app > .schedule-card { grid-column: 1 / -1; }
      .accounts-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px; }
      .hero-card { padding: clamp(22px, 3vw, 34px); }
      .card { padding: clamp(20px, 2vw, 28px); }
      .queue-form { display:grid; grid-template-columns:minmax(0, 5fr) minmax(0, 7fr); gap:clamp(12px, 1.4vw, 18px); align-items:stretch; }
      .queue-column { display:contents; }
      #queueAccountGroup { grid-column:1; }
      #queueUrlGroup { grid-column:2; }
      #queuePromptGroup, #queueTimingGroup, .queue-form > .queue-btns { grid-column:1 / -1; }
      .queue-form > .queue-btns { min-width:0; }
      .queue-btns button { min-width:0; }
      .queue-btns button span { overflow-wrap:anywhere; text-align:center; }
    }

    @media (max-width:959px) {
      .queue-form { display:grid; grid-template-columns:minmax(0,1fr); gap:12px; }
      .queue-column { display:contents; }
      #queueAccountGroup, #queueUrlGroup, #queuePromptGroup, #queueTimingGroup, .queue-form > .queue-btns { grid-column:1; }
      .queue-btns { grid-template-columns:repeat(2,minmax(0,1fr)); }
    }

    @media (max-width:600px) {
      .queue-btns { grid-template-columns:minmax(0,1fr); }
    }

    /* ===== QUEUE EXPERIENCE REFINEMENT ===== */
    #taskQueueSection {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      border-color: var(--border-default);
      background: var(--bg-card);
      box-shadow: var(--shadow-card);
      gap: 18px;
    }

    #taskQueueSection > .card-header { margin-bottom: -8px; align-items: center; }
    #taskQueueSection .card-title { gap: 11px; letter-spacing: -.025em; }
    #taskQueueSection .card-title svg {
      box-sizing: content-box;
      width: 17px;
      height: 17px;
      padding: 9px;
      border: 1px solid rgba(0,229,240,.16);
      border-radius: 12px;
      background: rgba(0,229,240,.07);
    }
    #taskQueueStatus { border: 1px solid rgba(0,229,240,.2); border-radius: 999px; padding: 6px 10px; background: rgba(0,229,240,.055); font-size: .62rem; letter-spacing: .08em; }
    #taskQueueSection .queue-desc { max-width: 70ch; color: var(--text-300); font-size: .82rem; line-height: 1.65; margin-top: -3px; }

    #taskQueueSection .queue-form {
      margin-top: 0;
      gap: 14px;
      grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr);
      align-items: stretch;
    }
    #taskQueueSection .queue-form .form-group {
      min-width: 0;
      padding: clamp(14px, 1.65vw, 20px);
      border-color: rgba(255,255,255,.075);
      border-radius: 17px;
      background: rgba(255,255,255,.018);
      gap: 11px;
    }
    #taskQueueSection #queueAccountGroup { grid-column: 1; }
    #taskQueueSection #queueUrlGroup { grid-column: 2; }
    #taskQueueSection #queuePromptGroup,
    #taskQueueSection #queueTimingGroup,
    #taskQueueSection .queue-form > .queue-btns { grid-column: 1 / -1; }

    #taskQueueSection .form-label { color: var(--text-200); font-size: .67rem; letter-spacing: .09em; }
    #taskQueueSection .form-hint { font-size: .68rem; line-height: 1.5; }
    #taskQueueSection .form-input,
    #taskQueueSection .form-select {
      min-height: 48px;
      border-radius: 11px;
      border-color: rgba(255,255,255,.11);
      background-color: rgba(5, 9, 17, .72);
      transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
    }
    #taskQueueSection .form-input:focus,
    #taskQueueSection .form-select:focus {
      border-color: rgba(0,229,240,.65);
      background-color: rgba(5, 12, 21, .96);
      box-shadow: 0 0 0 3px rgba(0,229,240,.09), 0 8px 24px rgba(0,0,0,.15);
      outline: none;
    }
    #taskQueueSection .url-bar { align-items: center; }
    #taskQueueSection .verify-badge { border-radius: 999px; padding: 4px 9px; }
    #taskQueueSection .btn-link { min-height: 32px; border-radius: 8px; }
    #taskQueueSection .url-preview { border-radius: 11px; }

    #taskQueueSection #queuePromptGroup { min-height: 128px; }
    #taskQueueSection #queuePromptGroup .form-input { min-height: 50px; }
    #taskQueueSection #queueTimingGroup {
      padding: clamp(13px, 1.5vw, 18px);
      border-color: rgba(255,255,255,.065);
      background: rgba(7,12,21,.32);
      gap: 10px;
    }
    #taskQueueSection .timing-pill-group { gap: 7px; padding: 5px; border-radius: 12px; background: rgba(0,0,0,.2); }
    #taskQueueSection .timing-pill-btn { min-height: 44px; border-radius: 9px; font-size: .75rem; }
    #taskQueueSection .timing-pill-btn > span { display: inline-flex; align-items: center; gap: 8px; }
    #taskQueueSection .timing-pill-btn svg { width: 15px; height: 15px; }
    #taskQueueSection .timing-pill-btn.active { background: rgba(0,229,240,.12); box-shadow: inset 0 0 0 1px rgba(0,229,240,.12); }
    #taskQueueSection #timingSlotWrap { margin-top: 2px !important; }
    #taskQueueSection #timingExactWrap { margin-top: 4px !important; }
    #taskQueueSection .chrono-deck { padding: 10px 12px; border-radius: 12px; border-color: rgba(255,255,255,.055); background: rgba(3,7,14,.26); box-shadow: none; gap: 8px; }
    #taskQueueSection .chrono-deck:focus-within { box-shadow: none; }
    #taskQueueSection .chrono-deck-main { align-items: center; gap: 12px; }
    #taskQueueSection .chrono-clock-cluster { flex: 0 0 auto; gap: 7px; padding: 6px 8px; border: 1px solid rgba(255,255,255,.055); border-radius: 10px; background: rgba(255,255,255,.012); }
    #taskQueueSection .chrono-stepper-cell { width: 70px; gap: 3px; }
    #taskQueueSection .stepper-btn { height: 24px; border-radius: 7px; }
    #taskQueueSection .stepper-btn:focus-visible,
    #taskQueueSection .btn-meridiem-switch:focus-visible,
    #taskQueueSection .btn-quick-adjust:focus-visible,
    #taskQueueSection .chrono-preset-pill:focus-visible,
    #taskQueueSection .btn-callout-apply:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
    #taskQueueSection .chrono-digit-box { height: 50px; border-radius: 9px; background: rgba(4,8,15,.5); box-shadow: none; }
    #taskQueueSection .chrono-digit-box:focus-within { border-color: var(--cyan); box-shadow: 0 0 0 2px rgba(0,229,240,.09); }
    #taskQueueSection .chrono-digit-input { font-size: 25px; font-variant-numeric: tabular-nums; text-shadow: none; }
    #taskQueueSection .meridiem-dock { height: auto; gap: 4px; margin-left: 0; }
    #taskQueueSection .btn-meridiem-switch { min-height: 34px; min-width: 58px; border-radius: 8px; padding: 6px 8px; }
    #taskQueueSection .btn-meridiem-switch.active.am,
    #taskQueueSection .btn-meridiem-switch.active.pm { box-shadow: none; }
    #taskQueueSection .chrono-divider { align-self: center; height: 36px; }
    #taskQueueSection .chrono-quick-adjust { flex: 1 1 auto; align-self: center; flex-wrap: wrap; gap: 6px; }
    #taskQueueSection .btn-quick-adjust { min-height: 36px; padding: 6px 10px; border-radius: 8px; }
    #taskQueueSection .chrono-presets-row { gap: 8px; padding-top: 10px; }
    #taskQueueSection .chrono-presets-header { align-items: flex-start; }
    #taskQueueSection .chrono-presets-label { font-size: .64rem; letter-spacing: .09em; }
    #taskQueueSection .preset-auto-badge { padding: 3px 7px; border-radius: 999px; font-size: .58rem; }
    #taskQueueSection .chrono-presets-sub { font-size: .65rem; white-space: normal; text-align: right; }
    #taskQueueSection .chrono-presets-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
    #taskQueueSection .chrono-preset-pill { min-width: 0; min-height: 52px; justify-content: center; padding: 7px 9px; border-radius: 9px; }
    #taskQueueSection .chrono-preset-pill:hover { transform: none; box-shadow: none; }
    #taskQueueSection .preset-pill-time { gap: 7px; font-size: .76rem; font-variant-numeric: tabular-nums; }
    #taskQueueSection .preset-pill-sub { font-size: .62rem; line-height: 1.4; white-space: normal; }
    #taskQueueSection .smart-queue-callout { padding: 9px 11px; border-radius: 9px; background: rgba(0,229,240,.035); }
    #taskQueueSection .btn-callout-apply { min-height: 36px; padding: 6px 11px; border-radius: 8px; }
    #taskQueueSection .chrono-hud-status { min-height: 40px; padding: 8px 11px; border-radius: 9px; background: rgba(0,229,240,.035); }
    #taskQueueSection .hud-primary-time { font-size: .78rem; font-variant-numeric: tabular-nums; }
    #taskQueueSection .hud-countdown-badge { padding: 4px 9px; border: 1px solid rgba(255,255,255,.07); border-radius: 999px; font-variant-numeric: tabular-nums; }
    #taskQueueSection .hud-tz-tag { font-size: .62rem; }

    #taskQueueSection .queue-btns { gap: 12px; margin-top: 1px; }
    #taskQueueSection .queue-btns button { min-height: 54px; border-radius: 13px; font-size: .84rem; letter-spacing: .005em; }
    #taskQueueSection .btn-queue-primary { box-shadow: none; }
    #taskQueueSection .btn-queue-secondary { background: rgba(255,255,255,.035); }
    #taskQueueSection .queue-btns button:focus-visible,
    #taskQueueSection .timing-pill-btn:focus-visible,
    #taskQueueSection .btn-dispatch-task:focus-visible,
    #taskQueueSection .btn-cancel-task:focus-visible,
    #taskQueueSection .btn-clear-completed:focus-visible,
    #taskQueueSection .btn-queue-expand:focus-visible,
    #taskQueueSection .btn-history-del:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }

    #taskQueueSection .tasks-divider {
      margin-top: 5px;
      padding-top: 22px;
      gap: 24px;
      border-top-color: rgba(255,255,255,.09);
    }
    #taskQueueSection .tasks-section { gap: 12px; }
    #taskQueueSection .tasks-header { padding: 0 12px 0 6px; font-size: .7rem; letter-spacing: .095em; color: var(--text-300); }
    #taskQueueSection .tasks-header-left { gap: 9px; }
    #taskQueueSection .task-count { min-width: 27px; min-height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; }
    #taskQueueSection .tasks-list { gap: 11px; }
    #taskQueueSection .task-card,
    #taskQueueSection .history-card {
      position: relative;
      overflow: hidden;
      border-radius: 15px;
      padding: 16px 18px;
      gap: 12px;
      background: rgba(255,255,255,.018);
      box-shadow: 0 4px 14px rgba(0,0,0,.12);
      transition: border-color .18s ease, background .18s ease;
    }
    #taskQueueSection .task-card::before,
    #taskQueueSection .history-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 2px; background: rgba(0,229,240,.48); }
    #taskQueueSection .task-card:hover,
    #taskQueueSection .history-card:hover { border-color: rgba(0,229,240,.32); background: rgba(255,255,255,.028); }
    #taskQueueSection .task-card.completed::before,
    #taskQueueSection .history-card:not(.failed)::before { background: rgba(0,214,143,.55); }
    #taskQueueSection .task-card.failed::before,
    #taskQueueSection .history-card.failed::before { background: rgba(240,72,72,.55); }
    #taskQueueSection .task-top { align-items: flex-start; gap: 12px; }
    #taskQueueSection .task-acc-wrap { flex-wrap: wrap; gap: 7px; }
    #taskQueueSection .task-acc-name { margin-right: 3px; font-size: .9rem; }
    #taskQueueSection .task-status,
    #taskQueueSection .target-badge,
    #taskQueueSection .history-pill,
    #taskQueueSection .history-time-tag { min-height: 25px; display: inline-flex; align-items: center; border-radius: 7px; padding: 3px 9px; }
    #taskQueueSection .task-prompt-box { border-radius: 11px; padding: 11px 13px; background: rgba(0,0,0,.2); border-color: rgba(255,255,255,.065); }
    #taskQueueSection .task-prompt-content { font-size: .77rem; line-height: 1.65; }
    #taskQueueSection .task-footer { align-items: center; gap: 10px 16px; }
    #taskQueueSection .task-url-chip,
    #taskQueueSection .history-url-chip { max-width: min(100%, 420px); min-height: 32px; padding: 6px 10px; border-radius: 8px; }
    #taskQueueSection .task-url-text { max-width: clamp(120px, 28vw, 280px); }
    #taskQueueSection .task-timing-chip { display: inline-flex; align-items: center; gap: 7px; white-space: normal; line-height: 1.45; color: var(--text-300); }
    #taskQueueSection .task-actions { gap: 7px; }
    #taskQueueSection .btn-dispatch-task,
    #taskQueueSection .btn-cancel-task { min-height: 36px; padding: 7px 11px; border-radius: 8px; }
    #taskQueueSection .history-card { padding: 14px 17px; }
    #taskQueueSection .history-head { align-items: flex-start; }
    #taskQueueSection .history-head-left { gap: 7px; }
    #taskQueueSection .history-prompt-row { border-radius: 9px; padding: 9px 12px; background: rgba(0,0,0,.2); font-size: .77rem; line-height: 1.55; }
    #taskQueueSection .history-foot { gap: 8px 14px; }
    #taskQueueSection .history-finished-text { line-height: 1.5; }
    #taskQueueSection .btn-history-del { width: 34px; height: 34px; border-radius: 9px; border-color: rgba(255,255,255,.065); }
    #taskQueueSection .btn-clear-completed { min-height: 34px; padding: 6px 10px; border-radius: 8px; }
    #taskQueueSection .btn-queue-expand { min-height: 42px; border-radius: 10px; margin-top: 1px; background: rgba(255,255,255,.025); }
    #taskQueueSection .empty-state { min-height: 104px; border: 1px dashed rgba(255,255,255,.12); border-radius: 14px; background: rgba(255,255,255,.015); }
    #taskQueueSection .history-section { margin-top: 0; padding-top: 20px; border-top-color: rgba(255,255,255,.075); }

    @media (max-width: 959px) {
      #taskQueueSection .queue-form { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      #taskQueueSection .chrono-presets-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      #taskQueueSection #queueAccountGroup { grid-column: 1 / -1; }
      #taskQueueSection #queueUrlGroup { grid-column: 1 / -1; }
      #taskQueueSection #queuePromptGroup,
      #taskQueueSection #queueTimingGroup,
      #taskQueueSection .queue-form > .queue-btns { grid-column: 1 / -1; }
      #taskQueueSection .queue-form .form-group { padding: 15px; }
    }
    @media (max-width: 600px) {
      #taskQueueSection { gap: 15px; }
      #taskQueueSection > .card-header { align-items: flex-start; gap: 10px; flex-wrap: wrap; }
      #taskQueueSection .card-title { font-size: 1rem; }
      #taskQueueStatus { margin-left: 45px; margin-top: -8px; }
      #taskQueueSection .queue-desc { font-size: .76rem; }
      #taskQueueSection .queue-form { grid-template-columns: minmax(0, 1fr); gap: 10px; }
      #taskQueueSection .queue-form .form-group { padding: 14px; border-radius: 14px; }
      #taskQueueSection #queueAccountGroup,
      #taskQueueSection #queueUrlGroup,
      #taskQueueSection #queuePromptGroup,
      #taskQueueSection #queueTimingGroup,
      #taskQueueSection .queue-form > .queue-btns { grid-column: 1; }
      #taskQueueSection .timing-pill-group { gap: 3px; padding: 4px; }
      #taskQueueSection .timing-pill-btn { min-height: 42px; padding: 6px 3px; font-size: .67rem; }
      #taskQueueSection .timing-pill-btn > span { gap: 5px; }
      #taskQueueSection .timing-pill-btn svg { width: 13px; height: 13px; }
      #taskQueueSection .chrono-deck { padding: 12px; }
      #taskQueueSection .chrono-deck-main { gap: 12px; }
      #taskQueueSection .chrono-clock-cluster { justify-content: center; gap: 7px; padding: 9px 7px; }
      #taskQueueSection .chrono-stepper-cell { width: clamp(66px, 22vw, 84px); }
      #taskQueueSection .stepper-btn { height: 44px; min-height: 44px; }
      #taskQueueSection .chrono-digit-box { height: 66px; }
      #taskQueueSection .chrono-digit-input { font-size: 28px; }
      #taskQueueSection .meridiem-dock { height: auto; gap: 6px; margin-left: 1px; }
      #taskQueueSection .btn-meridiem-switch { min-width: 58px; min-height: 44px; justify-content: center; padding: 7px; }
      #taskQueueSection .chrono-quick-adjust { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
      #taskQueueSection .btn-quick-adjust { min-height: 44px; padding: 8px 3px; font-size: .68rem; }
      #taskQueueSection .chrono-presets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
      #taskQueueSection .chrono-preset-pill { min-height: 58px; padding: 8px; }
      #taskQueueSection .chrono-presets-header { flex-direction: column; gap: 5px; }
      #taskQueueSection .chrono-presets-sub { text-align: left; }
      #taskQueueSection .smart-queue-callout { align-items: stretch; flex-direction: column; }
      #taskQueueSection .btn-callout-apply { width: 100%; justify-content: center; }
      #taskQueueSection .chrono-hud-status { flex-direction: row; align-items: center; flex-wrap: wrap; }
      #taskQueueSection .hud-tz-tag { margin-left: auto; align-self: auto; }
      #taskQueueSection .hud-primary-time { white-space: normal; }
      #taskQueueSection .queue-btns { grid-template-columns: minmax(0, 1fr); gap: 9px; }
      #taskQueueSection .queue-btns button { min-height: 50px; }
      #taskQueueSection .tasks-divider { padding-top: 18px; gap: 20px; }
      #taskQueueSection .task-card { padding: 14px; }
      #taskQueueSection .task-top { flex-direction: column; }
      #taskQueueSection .task-acc-wrap { width: 100%; }
      #taskQueueSection .task-actions { width: 100%; }
      #taskQueueSection .task-actions > button { flex: 1 1 0; justify-content: center; }
      #taskQueueSection .task-footer { align-items: flex-start; flex-direction: column; }
      #taskQueueSection .task-url-chip,
      #taskQueueSection .history-url-chip { max-width: 100%; width: fit-content; }
      #taskQueueSection .task-url-text { max-width: min(62vw, 260px); }
      #taskQueueSection .history-card { padding: 12px; }
      #taskQueueSection .history-head { gap: 6px; }
      #taskQueueSection .history-head-left { align-items: flex-start; }
      #taskQueueSection .history-foot { align-items: flex-start; flex-direction: column; }
      #taskQueueSection .completed-header {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      #taskQueueSection .completed-header .tasks-header-left { min-width: 0; gap: 7px; }
      #taskQueueSection .completed-header .tasks-header-left > span:first-child { white-space: nowrap; }
      #taskQueueSection .btn-clear-completed { flex: 0 0 auto; min-height: 44px; padding: 7px 10px; font-size: .66rem; white-space: nowrap; }
      #taskQueueSection .btn-clear-completed svg { width: 11px; height: 11px; }
      #taskQueueSection .btn-history-del { width: 44px; height: 44px; }
      #taskQueueSection .btn-queue-expand { min-height: 44px; }
      #taskQueueSection .btn-callout-apply { min-height: 44px; }
    }

    @media (max-width: 360px) {
      #taskQueueSection .completed-header .tasks-header-left > span:first-child { font-size: .64rem; letter-spacing: .04em; }
      #taskQueueSection .btn-clear-completed { width: 44px; min-width: 44px; padding: 0; justify-content: center; }
      #taskQueueSection .btn-clear-completed span { display: none; }
      #taskQueueSection .btn-clear-completed svg { width: 14px; height: 14px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>

  <!-- TOAST CONTAINER -->
  <div id="toastContainer"></div>

  <div class="app">

    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gC" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#00e5f0"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>
              <linearGradient id="gP" x1="28" y1="4" x2="4" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#b07df0"/><stop offset="1" stop-color="#818cf8"/></linearGradient>
            </defs>
            <path d="M16 4C9.37 4 4 9.37 4 16C4 18.5 4.8 20.8 6.1 22.7" stroke="url(#gC)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M16 28C22.63 28 28 22.63 28 16C28 13.5 27.2 11.2 25.9 9.3" stroke="url(#gP)" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M17.5 7.5L9.5 16.5H16.5L14.5 24.5L22.5 15.5H15.5L17.5 7.5Z" fill="#ffffff"/>
          </svg>
        </div>
        <div class="brand-info">
          <h1>Claude Pulse</h1>
          <span class="brand-sub" id="headerSub">Autopilot Active</span>
        </div>
      </div>
      <div class="clock-pill">
        <div class="live-dot"></div>
        <span id="headerClock">--:--:--</span>
      </div>
    </header>

    <!-- MODE SWITCHER -->
    <div class="mode-switch">
      <button class="mode-btn active-quick" id="modeQuick" onclick="setTaskMode('quick')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Quick Query</span>
      </button>
      <button class="mode-btn" id="modeDeep" onclick="setTaskMode('deep')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        <span>Deep Work</span>
      </button>
    </div>

    <!-- HERO RECOMMENDATION -->
    <section class="hero-card" id="heroCard">
      <div class="hero-top">
        <div class="hero-badge" id="recBadge">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          <span id="recBadgeText">Calculating...</span>
        </div>
        <div class="hero-reset-text" id="recNextReset">Next reset: --</div>
      </div>
      <h2 class="hero-title" id="heroTitle">Analyzing Schedules...</h2>
      <p class="hero-reason" id="heroReason">Loading live rate-limit telemetry...</p>
      <button class="hero-cta" id="heroCta" onclick="openLaunchDialog(recommendedTargetAccount)">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        <span id="heroCtaText">Open Claude</span>
      </button>
    </section>

    <!-- ACCOUNT CARDS -->
    <section class="accounts-grid" id="accountsGrid"></section>

    <!-- MANUAL PING CONTROLS -->
    <section class="card manual-card">
      <div class="card-header">
        <h2 class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Manual Controls
        </h2>
        <span class="card-badge" style="color: var(--green);" id="pingStatusText">Ready</span>
      </div>

      <div class="diag-bar">
        <div class="diag-status" id="healthBadge">
          <span class="live-dot"></span>
          <span id="healthSummaryText">Cloudflare Online</span>
        </div>
        <button class="btn-diag" onclick="runDiagnostics()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          Test Wiring
        </button>
      </div>

      <div class="controls-grid" id="controlsGrid"></div>

      <div class="console" id="consoleLogs">
        <div class="log-row">
          <span class="log-ts">[System]</span>
          <span class="log-text">Autopilot active on Cloudflare</span>
        </div>
      </div>
    </section>

    <!-- SCHEDULED PROMPTS -->
    <section class="card" id="taskQueueSection">
      <div class="card-header">
        <h2 class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Scheduled Prompts
        </h2>
        <span class="card-badge" style="color: var(--cyan);" id="taskQueueStatus">Flexible Schedule</span>
      </div>

      <p class="queue-desc">Choose an account, conversation and instruction, then schedule it for the next ping, a specific slot, or an exact IST time.</p>

      <div class="queue-form">
        <div class="queue-column" id="queueAccountColumn">
        <div class="form-group" id="queueAccountGroup">
          <label class="form-label" for="queueAccountSelect">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Target Account
          </label>
          <div class="select-wrap">
            <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            <select class="form-select" id="queueAccountSelect"></select>
            <div class="chevron"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></div>
          </div>
          <span class="form-hint">Select which account will execute this instruction on reset.</span>
        </div>

        <div class="form-group" id="queueUrlGroup">
          <div class="form-label-row">
            <label class="form-label" for="queueChatUrl">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              Chat URL
            </label>
            <span class="verify-badge idle" id="urlVerifyBadge">Awaiting URL</span>
          </div>
          <div class="input-wrap">
            <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></div>
            <input type="text" class="form-input" id="queueChatUrl" placeholder="https://claude.ai/chat/..." autocomplete="off" spellcheck="false">
            <button type="button" class="btn-clear-input" id="btnClearUrl" onclick="confirmClearUrlInput()" style="display:none;" title="Clear URL">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="url-bar">
            <span class="form-hint">Format only. Sign-in and access are not checked.</span>
            <div class="url-btns">
              <button type="button" class="btn-link" id="btnPasteUrl" onclick="pasteFromClipboard()" style="display:none;">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Paste
              </button>
              <button type="button" class="btn-link" id="btnVerifyUrl" onclick="verifyChatUrl(true)" disabled>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Check Link
              </button>
            </div>
          </div>
          <div class="url-preview" id="urlPreviewCard" style="display:none;"></div>
        </div>

        <div class="form-group" id="queuePromptGroup">
          <label class="form-label" for="queuePrompt">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            Prompt
          </label>
          <div class="input-wrap">
            <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></div>
            <input type="text" class="form-input" id="queuePrompt" placeholder="Write the next instruction" autocomplete="off">
          </div>
          <span class="form-hint">Message sent to Claude when the reset window opens.</span>
        </div>

        </div>
        <div class="queue-column" id="queueTimingColumn">
        <div class="form-group" id="queueTimingGroup">
          <label class="form-label">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Execution Schedule
          </label>
          <div class="timing-pill-group" role="group" aria-label="Execution time mode">
            <button type="button" class="timing-pill-btn active" id="pillTimingNext" aria-pressed="true" onclick="setTimingMode('next')">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>Next Ping</span>
            </button>
            <button type="button" class="timing-pill-btn" id="pillTimingSlot" aria-pressed="false" onclick="setTimingMode('slot')">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path stroke-linecap="round" d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 14 2 2 4-4"/></svg>Scheduled</span>
            </button>
            <button type="button" class="timing-pill-btn" id="pillTimingTime" aria-pressed="false" onclick="setTimingMode('time')">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>Exact Time</span>
            </button>
          </div>

          <!-- SUB-VIEW: ACCOUNT SCHEDULE -->
          <div id="timingSlotWrap" style="display:none;margin-top:8px;">
            <div class="select-wrap">
              <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
              <select class="form-select" id="queueSlotSelect"></select>
              <div class="chevron"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></div>
            </div>
            <span class="form-hint" style="margin-top:4px;">Choose one of this account’s scheduled daily ping times.</span>
          </div>

          <!-- SUB-VIEW: EXACT RESET TIME (Chrono-Deck 12-Hour System) -->
          <div id="timingExactWrap" style="display:none;margin-top:10px;">
            <div class="chrono-deck">
              <div class="chrono-deck-main">
                <div class="chrono-clock-cluster">
                  <!-- Hour Stepper Cell -->
                  <div class="chrono-stepper-cell">
                    <button type="button" class="stepper-btn" onclick="stepHour(1)" title="Increase Hour" aria-label="Increase Hour">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <div class="chrono-digit-box">
                      <input type="text" id="queueExactHour" class="chrono-digit-input" value="12" maxlength="2" inputmode="numeric" autocomplete="off" spellcheck="false" onfocus="this.select()" oninput="handleHourInput(this)" onblur="normalizeHourInput(this)" onkeydown="handleTimeKeydown(event, 'hour')" aria-label="Hour (1-12)">
                      <span class="chrono-digit-sub">HR</span>
                    </div>
                    <button type="button" class="stepper-btn" onclick="stepHour(-1)" title="Decrease Hour" aria-label="Decrease Hour">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>

                  <!-- Glowing Cyber Colon -->
                  <div class="chrono-colon">
                    <div class="colon-dot"></div>
                    <div class="colon-dot"></div>
                  </div>

                  <!-- Minute Stepper Cell -->
                  <div class="chrono-stepper-cell">
                    <button type="button" class="stepper-btn" onclick="stepMinute(1)" title="Increase Minute" aria-label="Increase Minute">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <div class="chrono-digit-box">
                      <input type="text" id="queueExactMinute" class="chrono-digit-input" value="00" maxlength="2" inputmode="numeric" autocomplete="off" spellcheck="false" onfocus="this.select()" oninput="handleMinuteInput(this)" onblur="normalizeMinuteInput(this)" onkeydown="handleTimeKeydown(event, 'minute')" aria-label="Minute (0-59)">
                      <span class="chrono-digit-sub">MIN</span>
                    </div>
                    <button type="button" class="stepper-btn" onclick="stepMinute(-1)" title="Decrease Minute" aria-label="Decrease Minute">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>

                  <!-- AM / PM Tactical Toggle Deck -->
                  <div class="meridiem-dock" role="group" aria-label="Select period AM or PM">
                    <button type="button" class="btn-meridiem-switch active am" id="btnMeridiemAM" aria-pressed="true" onclick="setMeridiem('AM')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                      <span>AM</span>
                    </button>
                    <button type="button" class="btn-meridiem-switch" id="btnMeridiemPM" aria-pressed="false" onclick="setMeridiem('PM')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                      <span>PM</span>
                    </button>
                  </div>
                </div>

                <div class="chrono-divider" aria-hidden="true"></div>

                <!-- Quick Offset Controls (+15m, +30m, +1h, Now) -->
                <div class="chrono-quick-adjust">
                  <button type="button" class="btn-quick-adjust" onclick="adjustTimeMinutes(15)" title="Add 15 minutes">+15m</button>
                  <button type="button" class="btn-quick-adjust" onclick="adjustTimeMinutes(30)" title="Add 30 minutes">+30m</button>
                  <button type="button" class="btn-quick-adjust" onclick="adjustTimeMinutes(60)" title="Add 1 hour">+1h</button>
                  <button type="button" class="btn-quick-adjust now" onclick="setTimeToCurrentNow()" title="Set to one minute from now (IST)">+1m</button>
                </div>
              </div>

              <!-- Smart Presets Bar -->
              <div class="chrono-presets-row">
                <div class="chrono-presets-header">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="chrono-presets-label">Smart Reset &amp; Cascade Presets</span>
                    <span class="preset-auto-badge">+5h 2m Buffer</span>
                  </div>
                  <span class="chrono-presets-sub" id="chronoPresetsSub">Auto-computed from queue &amp; rate limits</span>
                </div>
                <div class="smart-queue-callout" id="smartQueueCallout" style="display:none;"></div>
                <div class="chrono-presets-grid" id="chronoPresetsGrid"></div>
              </div>

              <!-- Live Feedback HUD Readout -->
              <div class="chrono-hud-status" id="exactTimePreview">
                <div class="hud-status-main">
                  <div class="hud-pulse-ring"></div>
                  <span class="hud-primary-time" id="exactTimePreviewText" aria-live="polite">Will execute at 12:00 AM IST</span>
                  <span class="hud-countdown-badge" id="exactTimeCountdownText">in --</span>
                </div>
                <span class="hud-tz-tag">IST (UTC+5:30)</span>
              </div>
            </div>

            <!-- Hidden sync input for backward compatibility -->
            <input type="hidden" id="queueExactTime" value="12:00 AM">
          </div>
        </div>
        </div>

        <div class="queue-btns">
          <button class="btn-queue-primary" id="btnQueueTask" onclick="confirmQueueTask(false)" disabled>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span id="btnQueueText">Queue for Next Ping</span>
          </button>
          <button class="btn-queue-secondary" id="btnQueueNow" onclick="confirmQueueTask(true)" disabled>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
            <span id="btnQueueNowText">Dispatch Now</span>
          </button>
        </div>
      </div>

      <div class="tasks-divider">
        <!-- ACTIVE QUEUED TASKS SECTION -->
        <div class="tasks-section" id="activeTasksSection">
          <div class="tasks-header">
            <div class="tasks-header-left">
              <span>Active Queued Tasks</span>
              <span class="task-count queued" id="taskCountBadge">0</span>
            </div>
          </div>
          <div class="tasks-list" id="activeTasksList"></div>
        </div>

        <!-- COMPLETED & HISTORY SECTION -->
        <div class="tasks-section history-section" id="completedTasksSection" style="display:none;">
          <div class="tasks-header completed-header">
            <div class="tasks-header-left">
              <span>Execution History</span>
              <span class="task-count completed" id="taskCompletedCountBadge">0</span>
            </div>
            <button type="button" class="btn-clear-completed" id="btnClearCompletedTasks" onclick="confirmClearCompleted()" aria-label="Clear execution history" title="Clear execution history">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Clear History</span>
            </button>
          </div>
          <div class="tasks-list history-list" id="completedTasksList"></div>
        </div>
      </div>
    </section>

    <!-- 24H SCHEDULE -->
    <section class="card schedule-card">
      <div class="card-header">
        <h2 class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          24h Ping Schedule
        </h2>
        <span class="card-badge">+2m Buffer</span>
      </div>

      <div class="timeline-banner" id="timelineBubble">
        <div style="display:flex;align-items:center;gap:7px;min-width:0;">
          <span class="timeline-pill now" id="bubbleAccPill">LIVE NOW</span>
          <span style="font-weight:700;color:#fff;font-family:var(--mono);" id="bubbleTime">--:-- --</span>
          <button type="button" class="btn-timeline-reset" id="btnTimelineReset" onclick="inspectNow(event)" style="display:none;">Live</button>
        </div>
        <div style="font-family:var(--mono);color:var(--text-200);font-size:0.68rem;" id="bubbleDiff">Recommended account</div>
      </div>

      <div class="timeline-lanes" id="timelineContainer"></div>
      <div class="sched-list" id="scheduleList"></div>
    </section>

    <footer class="footer">
      <p id="footerText">Claude Pulse &bull; Intelligent Multi-Account Rate-Limit Autopilot</p>
    </footer>

  </div>

  <!-- CONFIRMATION MODAL -->
  <div class="modal-bg" id="confirmModal">
    <div class="modal-box">
      <div class="modal-head">
        <div class="modal-icon-box" id="modalIcon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div class="modal-head-text">
          <h3 id="modalTitle">Confirm Action</h3>
          <p id="modalSub">Claude Pulse Cloudflare Worker</p>
        </div>
      </div>
      <div class="modal-body" id="modalBody">Are you sure you want to trigger this action?</div>
      <div class="modal-btns" id="modalActions">
        <button class="btn-modal btn-modal-cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-modal btn-modal-ok" id="modalConfirmBtn">Proceed</button>
      </div>
    </div>
  </div>

  <script>
    let currentTaskMode = 'quick';
    let recommendedTargetAccount = 1;
    let selectedScheduleItem = null;
    let pinnedItem = null;

    let ACCOUNTS = ${JSON.stringify(initialAccounts && initialAccounts.length > 0 ? initialAccounts : [
      { id: 1, name: 'Account 1', color: '#00e5f0' },
      { id: 2, name: 'Account 2', color: '#b07df0' }
    ])};

    // Toast alert replacement for sleek native-app feel
    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const el = document.createElement('div');
      el.className = 'toast-item toast-' + type;
      el.innerHTML = '<span class="toast-dot"></span><span>' + escapeHtml(message) + '</span>';
      container.appendChild(el);
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
      setTimeout(() => {
        el.classList.add('hide');
        setTimeout(() => el.remove(), 200);
      }, 3600);
    }

    function generateScheduleForAccounts(accounts) {
      if (!accounts || accounts.length === 0) return [];
      const fixedSlots = [
        { slot: 1, hour: 1, min: 34, minsOfDay: 94, display: '01:34 AM', tag: 'Late Night' },
        { slot: 2, hour: 7, min: 30, minsOfDay: 450, display: '07:30 AM', tag: 'Morning' },
        { slot: 3, hour: 10, min: 28, minsOfDay: 628, display: '10:28 AM', tag: 'Workday' },
        { slot: 4, hour: 12, min: 32, minsOfDay: 752, display: '12:32 PM', tag: 'Midday' },
        { slot: 5, hour: 15, min: 30, minsOfDay: 930, display: '03:30 PM', tag: 'Afternoon' },
        { slot: 6, hour: 17, min: 34, minsOfDay: 1054, display: '05:34 PM', tag: 'Evening' },
        { slot: 7, hour: 20, min: 32, minsOfDay: 1232, display: '08:32 PM', tag: 'Night' },
        { slot: 8, hour: 22, min: 36, minsOfDay: 1356, display: '10:36 PM', tag: 'Midnight' }
      ];
      let cohortA, cohortB;
      if (accounts.length <= 1) { cohortA = accounts; cohortB = accounts; }
      else {
        // Account IDs stay stable as accounts are added, so existing schedules never reshuffle.
        cohortA = accounts.filter(acc => Number(acc.id) % 2 !== 0);
        cohortB = accounts.filter(acc => Number(acc.id) % 2 === 0);
        if (cohortA.length === 0) cohortA = accounts;
        if (cohortB.length === 0) cohortB = accounts;
      }
      const items = [];
      fixedSlots.forEach(s => {
        const cohort = (s.slot % 2 !== 0) ? cohortA : cohortB;
        cohort.forEach(acc => {
          items.push({ id: 'ping-' + s.slot + '-' + acc.id, slot: s.slot, account: acc.id, name: acc.name, hour: s.hour, min: s.min, minsOfDay: s.minsOfDay, display: s.display, tag: s.tag });
        });
      });
      return items.sort((a, b) => a.minsOfDay - b.minsOfDay);
    }

    let SCHEDULE = generateScheduleForAccounts(ACCOUNTS);
    const WINDOW_DURATION_MINS = 300;

    function setTaskMode(mode) {
      currentTaskMode = mode;
      document.getElementById('modeQuick').className = 'mode-btn ' + (mode === 'quick' ? 'active-quick' : '');
      document.getElementById('modeDeep').className = 'mode-btn ' + (mode === 'deep' ? 'active-deep' : '');
      updateUI();
    }

    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });

    function getISTClockParts(date = new Date()) {
      // Read IST wall-clock fields directly; never round-trip them through the
      // device timezone, which can shift values around local DST transitions.
      const parts = istFormatter.formatToParts(date);
      const p = {};
      for (const part of parts) p[part.type] = part.value;
      return {
        year: Number(p.year), month: Number(p.month), day: Number(p.day),
        hour: Number(p.hour), minute: Number(p.minute), second: Number(p.second)
      };
    }

    function fmtHM(m) { const h = Math.floor(m / 60), r = Math.floor(m % 60); return h === 0 ? r + 'm' : h + 'h ' + r + 'm'; }

    function fmtHMS(s) {
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
      const p = n => String(n).padStart(2, '0');
      return h === 0 ? m + 'm ' + p(sec) + 's' : h + 'h ' + p(m) + 'm ' + p(sec) + 's';
    }

    function fmtMinsToTime(mins) {
      const n = ((mins % 1440) + 1440) % 1440;
      const h24 = Math.floor(n / 60), min = Math.floor(n % 60);
      const pm = h24 >= 12, h12 = (h24 % 12 === 0) ? 12 : (h24 % 12);
      return String(h12).padStart(2, '0') + ':' + String(min).padStart(2, '0') + ' ' + (pm ? 'PM' : 'AM');
    }

    function timeInputValueToText(value) {
      const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
      return match ? fmtMinsToTime(Number(match[1]) * 60 + Number(match[2])) : (value || '');
    }

    function getNextPingDisplayForAccount(accountId) {
      if (!SCHEDULE || SCHEDULE.length === 0) return '';
      const accSchedule = SCHEDULE.filter(s => s.account === accountId);
      if (accSchedule.length === 0) return '';
      const istNow = getISTClockParts();
      const currentMins = istNow.hour * 60 + istNow.minute;
      const upcoming = accSchedule.find(s => s.minsOfDay > currentMins);
      return upcoming ? upcoming.display : accSchedule[0].display;
    }

    function fmtTime(d) { return d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

    function escapeHtml(s) {
      if (s == null) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function renderAccountCards() {
      const g = document.getElementById('accountsGrid');
      if (!g) return;
      g.innerHTML = '';
      ACCOUNTS.forEach(acc => {
        const c = acc.color || '#00e5f0';
        const el = document.createElement('div');
        el.className = 'acc-card';
        el.style.borderTopColor = c;
        el.style.borderTopWidth = '2px';
        el.innerHTML =
          '<div class="acc-card-head">' +
            '<span class="acc-name" style="color:' + c + ';">' + escapeHtml(acc.name) + '</span>' +
            '<span class="acc-status-pill" id="accStat_' + acc.id + '">STANDBY</span>' +
          '</div>' +
          '<div class="acc-gauge">' +
            '<div class="ring-box">' +
              '<svg viewBox="0 0 80 80"><circle class="ring-bg" cx="40" cy="40" r="34"></circle><circle class="ring-progress" id="accRing_' + acc.id + '" cx="40" cy="40" r="34" stroke="' + c + '" stroke-dasharray="213.6" stroke-dashoffset="0"></circle></svg>' +
              '<div class="ring-icon"><svg fill="none" stroke="' + c + '" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>' +
            '</div>' +
            '<div class="acc-meta">' +
              '<div class="acc-time-left" id="accTime_' + acc.id + '">--h --m</div>' +
              '<div class="acc-next-info" id="accNext_' + acc.id + '">Next: --</div>' +
            '</div>' +
          '</div>' +
          '<div class="acc-actions">' +
            '<button class="btn-card" onclick="openLaunchDialog(' + acc.id + ')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>Launch</button>' +
            '<button class="btn-card" onclick="confirmAndPing(' + acc.id + ')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>Ping</button>' +
          '</div>';
        g.appendChild(el);
      });
    }

    function renderManualControls() {
      const g = document.getElementById('controlsGrid');
      if (!g) return;
      g.innerHTML = '';
      ACCOUNTS.forEach(acc => {
        const c = acc.color || '#00e5f0';
        const b = document.createElement('button');
        b.className = 'btn-ping';
        b.onclick = () => confirmAndPing(acc.id, acc.name);
        b.innerHTML =
          '<div class="btn-ping-icon" style="background:' + c + '14;color:' + c + ';"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>' +
          '<span class="btn-ping-label" style="color:' + c + ';">' + escapeHtml(acc.name) + '</span>' +
          '<span class="btn-ping-sub">Account ' + acc.id + '</span>';
        g.appendChild(b);
      });
      const ab = document.createElement('button');
      ab.className = 'btn-ping';
      ab.onclick = () => confirmAndPing('all', 'All Accounts');
      ab.innerHTML =
        '<div class="btn-ping-icon" style="background:rgba(255,255,255,0.07);color:#fff;"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>' +
        '<span class="btn-ping-label" style="color:var(--text-100);">All</span>' +
        '<span class="btn-ping-sub">Ping Everything</span>';
      g.appendChild(ab);
    }

    function renderTimelineTracks() {
      const c = document.getElementById('timelineContainer');
      if (!c) return;
      c.innerHTML = '';
      ACCOUNTS.forEach(acc => {
        const row = document.createElement('div');
        row.className = 'lane-row';
        row.innerHTML =
          '<span class="lane-label" style="color:' + (acc.color || '#00e5f0') + ';" title="' + escapeHtml(acc.name) + '">' + escapeHtml(acc.name) + '</span>' +
          '<div class="lane-track" id="track_' + acc.id + '" onclick="handleTrackClick(event)">' +
            '<div class="now-cursor" id="cursor_' + acc.id + '" style="left:50%;"></div>' +
          '</div>';
        c.appendChild(row);
      });
      const lbl = document.createElement('div');
      lbl.className = 'time-axis';
      lbl.innerHTML = '<span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>';
      c.appendChild(lbl);
    }

    function calculateTelemetry() {
      const now = new Date();
      const istNow = getISTClockParts(now);
      const csd = istNow.hour * 3600 + istNow.minute * 60 + istNow.second;
      const cmd = csd / 60;
      const WDS = WINDOW_DURATION_MINS * 60;

      if (!ACCOUNTS || ACCOUNTS.length === 0) {
        return { nowIST: now, currentMinsOfDay: cmd, accountStates: [], recommendedAcc: null, reason: 'No accounts detected', isStandby: true };
      }

      const states = ACCOUNTS.map(acc => {
        const pings = SCHEDULE.filter(s => s.account === acc.id);
        let mr = (pings && pings.length > 0) ? pings[0] : { hour: 0, min: 0, minsOfDay: 0, display: '--' };
        let elap = Infinity;
        for (const p of pings) { let d = csd - (p.hour * 3600 + p.min * 60); if (d < 0) d += 86400; if (d < elap) { elap = d; mr = p; } }

        let np = (pings && pings.length > 0) ? pings[0] : { hour: 0, min: 0, minsOfDay: 0, display: '--' };
        let sn = Infinity;
        for (const p of pings) { let d = (p.hour * 3600 + p.min * 60) - csd; if (d < 0) d += 86400; if (d < sn) { sn = d; np = p; } }

        const act = elap < WDS, sl = act ? WDS - elap : 0, ml = Math.floor(sl / 60);
        const pct = Math.max(0, Math.min(100, Math.round((sl / WDS) * 100)));
        const wem = (mr.minsOfDay + WINDOW_DURATION_MINS) % 1440;
        return { id: acc.id, name: acc.name, color: acc.color, mostRecent: mr, nextPing: np, windowEndDisplay: fmtMinsToTime(wem), elapsedSinceRecentSeconds: elap, secondsLeftInWindow: sl, minsLeftInWindow: ml, secondsUntilNext: sn, minsUntilNext: Math.floor(sn / 60), percentLeft: pct, isActive: act };
      });

      const active = states.filter(a => a.isActive);
      let rec = states[0], reason = '', standby = false;
      if (active.length > 0) {
        if (currentTaskMode === 'quick') { rec = active.reduce((m, a) => a.secondsLeftInWindow < m.secondsLeftInWindow ? a : m, active[0]); reason = rec.name + ' resets sooner (' + fmtHMS(rec.secondsLeftInWindow) + ' left until ' + rec.windowEndDisplay + ').'; }
        else { rec = active.reduce((m, a) => a.secondsLeftInWindow > m.secondsLeftInWindow ? a : m, active[0]); reason = rec.name + ' has the most time left (' + fmtHMS(rec.secondsLeftInWindow) + ' remaining).'; }
      } else { standby = true; rec = states.reduce((m, a) => a.secondsUntilNext < m.secondsUntilNext ? a : m, states[0]); reason = 'All accounts in standby. Next window opens on ' + rec.name + ' at ' + rec.nextPing.display + ' (in ' + fmtHMS(rec.secondsUntilNext) + ').'; }
      recommendedTargetAccount = rec ? rec.id : 1;
      return { nowIST: now, currentMinsOfDay: cmd, accountStates: states, recommendedAcc: rec, reason, isStandby: standby };
    }

    function updateUI() {
      const d = calculateTelemetry();
      const ck = document.getElementById('headerClock');
      if (ck) ck.innerText = fmtTime(d.nowIST);
      const rb = document.getElementById('recBadge'), hc = document.getElementById('heroCta'), r = d.recommendedAcc;
      if (r) {
        if (d.isStandby) {
          if (rb) { rb.className = 'hero-badge'; rb.style.cssText = 'background:rgba(255,255,255,0.06);color:var(--text-200);border-color:var(--border-dim);'; document.getElementById('recBadgeText').innerText = 'STANDBY'; }
          document.getElementById('heroTitle').innerText = 'System Standby';
          document.getElementById('heroReason').innerText = d.reason;
          if (hc) hc.onclick = () => openLaunchDialog(r.id, r.name);
          document.getElementById('heroCtaText').innerText = 'Open Claude (' + r.name + ')';
          document.getElementById('recNextReset').innerText = 'Next in ' + fmtHMS(r.secondsUntilNext);
        } else {
          const c = r.color || '#00e5f0';
          if (rb) { rb.style.cssText = 'color:' + c + ';border-color:' + c + '44;background:' + c + '18;'; document.getElementById('recBadgeText').innerText = 'OPTIMAL: ' + r.name.toUpperCase(); }
          document.getElementById('heroTitle').innerText = 'Use ' + r.name;
          document.getElementById('heroReason').innerText = d.reason;
          if (hc) hc.onclick = () => openLaunchDialog(r.id, r.name);
          document.getElementById('heroCtaText').innerText = 'Open Claude as ' + r.name;
          document.getElementById('recNextReset').innerText = 'Reset in ' + fmtHMS(r.secondsLeftInWindow);
        }
      }
      const circ = 213.6;
      d.accountStates.forEach(a => {
        const ring = document.getElementById('accRing_' + a.id);
        if (ring) ring.style.strokeDashoffset = circ * (1 - a.percentLeft / 100);
        const t = document.getElementById('accTime_' + a.id);
        if (t) t.innerText = a.isActive ? fmtHMS(a.secondsLeftInWindow) + ' Left' : 'Standby';
        const n = document.getElementById('accNext_' + a.id);
        if (n) n.innerText = a.isActive ? 'Resets ' + a.windowEndDisplay + ' \u2022 Next ' + a.nextPing.display : 'Next: ' + a.nextPing.display;
        const s = document.getElementById('accStat_' + a.id);
        if (s) { if (a.isActive) { s.className = a.minsLeftInWindow <= 45 ? 'acc-status-pill warning' : 'acc-status-pill active'; s.innerText = a.minsLeftInWindow <= 45 ? 'EXPIRING' : 'ACTIVE'; } else { s.className = 'acc-status-pill'; s.innerText = 'STANDBY'; } }
        const cur = document.getElementById('cursor_' + a.id);
        if (cur) cur.style.left = (d.currentMinsOfDay / 1440 * 100) + '%';
      });
      if (!selectedScheduleItem && d.recommendedAcc) {
        const p = document.getElementById('bubbleAccPill');
        if (p) { p.className = 'timeline-pill now'; p.innerText = 'LIVE NOW'; }
        const rbtn = document.getElementById('btnTimelineReset');
        if (rbtn) rbtn.style.display = 'none';
        document.getElementById('bubbleTime').innerText = fmtTime(d.nowIST);
        document.getElementById('bubbleDiff').innerText = 'Recommended: ' + d.recommendedAcc.name;
      }
      if (selectedTimingMode === 'time') {
        updateExactTimeCountdownOnly();
      }
      updateSmartPresets();
    }

    function inspectScheduleItem(item) {
      selectedScheduleItem = item;
      const nowIST = getISTClockParts();
      const csd = nowIST.hour * 3600 + nowIST.minute * 60 + nowIST.second;
      const ps = item.hour * 3600 + item.min * 60;
      let ds = ps - csd, dt = '';
      if (ds > 0) dt = 'in ' + fmtHMS(ds); else if (ds < 0) { let pd = csd - ps; dt = pd > 43200 ? 'in ' + fmtHMS(ds + 86400) : fmtHMS(pd) + ' ago'; } else dt = 'Right now';
      const p = document.getElementById('bubbleAccPill');
      if (p) { p.className = 'timeline-pill'; p.style.background = '#1e293b'; p.innerText = item.name; }
      const rbtn = document.getElementById('btnTimelineReset');
      if (rbtn) rbtn.style.display = 'inline-block';
      document.getElementById('bubbleTime').innerText = item.display + ' (' + item.tag + ')';
      document.getElementById('bubbleDiff').innerText = dt;
      document.querySelectorAll('.lane-node').forEach(n => { n.classList.toggle('selected', n.dataset.id === item.id); });
      document.querySelectorAll('.sched-item').forEach(r => { if (r.dataset.id === item.id) { r.className = 'sched-item hl'; r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } else { r.className = 'sched-item'; } });
    }

    function inspectNow(e) {
      if (e) e.stopPropagation();
      selectedScheduleItem = null;
      pinnedItem = null;
      const rbtn = document.getElementById('btnTimelineReset');
      if (rbtn) rbtn.style.display = 'none';
      document.querySelectorAll('.lane-node').forEach(n => n.classList.remove('selected'));
      document.querySelectorAll('.sched-item').forEach(r => r.className = 'sched-item');
      updateUI();
    }

    function handleTrackClick(e) { if (!e.target.classList.contains('lane-node')) inspectNow(e); }

    function renderScheduleList() {
      const list = document.getElementById('scheduleList');
      if (!list) return;
      list.innerHTML = '';
      ACCOUNTS.forEach(acc => { const t = document.getElementById('track_' + acc.id); if (t) t.querySelectorAll('.lane-node, .lane-band').forEach(n => n.remove()); });
      SCHEDULE.forEach(item => {
        const sm = item.minsOfDay, em = sm + 300;
        const track = document.getElementById('track_' + item.account);
        const ai = ACCOUNTS.find(a => a.id === item.account) || { color: '#00e5f0' };
        const c = ai.color || '#00e5f0';
        if (track) {
          if (em <= 1440) {
            const bd = document.createElement('div'); bd.className = 'lane-band'; bd.style.cssText = 'background:' + c + '22;left:' + (sm/1440*100) + '%;width:' + ((em-sm)/1440*100) + '%;'; track.appendChild(bd);
          } else {
            const bA = document.createElement('div'); bA.className = 'lane-band'; bA.style.cssText = 'background:' + c + '22;left:' + (sm/1440*100) + '%;width:' + ((1440-sm)/1440*100) + '%;'; track.appendChild(bA);
            const bB = document.createElement('div'); bB.className = 'lane-band'; bB.style.cssText = 'background:' + c + '22;left:0%;width:' + ((em-1440)/1440*100) + '%;'; track.appendChild(bB);
          }
          const nd = document.createElement('div'); nd.className = 'lane-node'; nd.style.cssText = 'background:' + c + ';box-shadow:0 0 6px ' + c + ';left:' + (sm/1440*100) + '%;'; nd.dataset.id = item.id;
          nd.onclick = e => { e.stopPropagation(); pinnedItem = pinnedItem === item.id ? null : item.id; inspectScheduleItem(item); };
          nd.onmouseenter = () => { if (!pinnedItem) inspectScheduleItem(item); };
          nd.onmouseleave = () => { if (!pinnedItem) inspectNow(); };
          track.appendChild(nd);
        }
        const row = document.createElement('div'); row.className = 'sched-item'; row.dataset.id = item.id;
        row.onclick = () => { pinnedItem = pinnedItem === item.id ? null : item.id; inspectScheduleItem(item); };
        row.onmouseenter = () => { if (!pinnedItem) inspectScheduleItem(item); };
        row.onmouseleave = () => { if (!pinnedItem) inspectNow(); };
        row.innerHTML =
          '<div class="sched-left">' +
            '<div class="sched-dot" style="background:' + c + ';"></div>' +
            '<span class="sched-time">' + item.display + '</span>' +
            '<span class="sched-name" style="color:' + c + ';">' + escapeHtml(item.name) + '</span>' +
          '</div>' +
          '<div class="sched-right">' +
            '<span class="sched-badge">+2m</span>' +
            '<span>' + item.tag + '</span>' +
          '</div>';
        list.appendChild(row);
      });
    }

    function addConsoleLog(msg, type) {
      const box = document.getElementById('consoleLogs');
      if (!box) return;
      const ln = document.createElement('div'); ln.className = 'log-row';
      const t = new Date().toLocaleTimeString('en-US', { hour12: false });
      ln.innerHTML = '<span class="log-ts">[' + t + ']</span><span class="log-text ' + (type || '') + '">' + msg + '</span>';
      box.appendChild(ln); box.scrollTop = box.scrollHeight;
    }

    function closeModal() {
      const m = document.getElementById('confirmModal');
      if (m) m.classList.remove('open');
      const cb = document.querySelector('.btn-modal-cancel');
      if (cb) cb.style.display = '';
      const ma = document.getElementById('modalActions');
      if (ma) ma.style.gridTemplateColumns = '1fr 1fr';
    }

    function showConfirmDialog({
      title = 'Confirm Action',
      sub = 'Claude Pulse',
      body = 'Are you sure you want to proceed?',
      iconSvg = null,
      iconColor = 'var(--cyan)',
      confirmText = 'Proceed',
      confirmClass = 'btn-modal-ok',
      cancelText = 'Cancel',
      onConfirm = null
    }) {
      const modal = document.getElementById('confirmModal');
      if (!modal) return;
      const titleEl = document.getElementById('modalTitle');
      const subEl = document.getElementById('modalSub');
      const bodyEl = document.getElementById('modalBody');
      const btnOk = document.getElementById('modalConfirmBtn');
      const btnCancel = modal.querySelector('.btn-modal-cancel');
      const iconBox = document.getElementById('modalIcon');
      const ma = document.getElementById('modalActions');

      if (titleEl) titleEl.innerText = title;
      if (subEl) subEl.innerText = sub;
      if (bodyEl) bodyEl.innerHTML = body;
      if (btnCancel) {
        btnCancel.innerText = cancelText;
        btnCancel.style.display = '';
      }
      if (ma) ma.style.gridTemplateColumns = '1fr 1fr';

      if (iconBox) {
        if (iconSvg) {
          iconBox.innerHTML = iconSvg;
        } else {
          iconBox.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
        }
        iconBox.style.color = iconColor;
        iconBox.style.borderColor = iconColor;
        const isRed = iconColor.includes('red') || iconColor.includes('#f04848');
        const isAmber = iconColor.includes('amber') || iconColor.includes('#ffb020');
        iconBox.style.background = isRed ? 'rgba(240, 72, 72, 0.12)' : (isAmber ? 'rgba(255, 176, 32, 0.12)' : 'rgba(0, 229, 240, 0.12)');
      }

      if (btnOk) {
        btnOk.className = 'btn-modal ' + confirmClass;
        btnOk.innerText = confirmText;
        btnOk.onclick = () => {
          closeModal();
          if (typeof onConfirm === 'function') onConfirm();
        };
      }

      modal.classList.add('open');
    }

    function confirmClearUrlInput() {
      const input = document.getElementById('queueChatUrl');
      if (!input || !input.value.trim()) {
        clearChatUrlInput();
        return;
      }
      showConfirmDialog({
        title: 'Clear Chat URL?',
        sub: 'Autopilot URL Input',
        body: 'Clear the currently entered Claude conversation link from the input box?',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
        iconColor: 'var(--amber)',
        confirmText: 'Clear URL',
        confirmClass: 'btn-modal-amber',
        onConfirm: () => clearChatUrlInput()
      });
    }

    async function runDiagnostics() {
      addConsoleLog('Running live diagnostic check...', 'info');
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const btn = document.getElementById('modalConfirmBtn');
      const ma = document.getElementById('modalActions');
      title.innerText = 'System Diagnostics';
      body.innerHTML = '<div style="display:flex;align-items:center;gap:8px;justify-content:center;padding:18px 0;"><span class="live-dot"></span><span>Checking live infrastructure...</span></div>';
      modal.classList.add('open');
      try {
        const start = performance.now();
        const res = await fetch('/api/health');
        const lat = Math.round(performance.now() - start);
        const data = await res.json();
        const bc = data.browserless?.status === 'connected';
        let h = '<div style="display:flex;flex-direction:column;gap:10px;font-size:0.84rem;">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;"><span>Cloudflare Edge:</span><strong style="color:var(--green);">ONLINE (' + lat + 'ms)</strong></div>';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;"><span>Browserless API:</span><strong style="color:' + (bc ? 'var(--green)' : 'var(--red)') + ';">' + (bc ? 'CONNECTED' : 'ERROR') + '</strong></div>';
        if (data.accounts && Array.isArray(data.accounts)) { data.accounts.forEach(a => { h += '<div style="display:flex;justify-content:space-between;align-items:center;"><span>' + escapeHtml(a.name) + ':</span><strong style="color:' + (a.themeColor || 'var(--cyan)') + ';">ACTIVE</strong></div>'; }); }
        const istRaw = data.timestamp?.ist || '';
        const istDisplay = istRaw.includes(',') ? istRaw.split(',')[1].trim() : (istRaw || '--');
        h += '<div style="display:flex;justify-content:space-between;align-items:center;"><span>Server IST:</span><strong style="color:#fff;font-family:var(--mono);">' + escapeHtml(istDisplay) + '</strong></div>';
        h += '</div>';
        body.innerHTML = h;
        const cb = modal.querySelector('.btn-modal-cancel'); if (cb) cb.style.display = 'none';
        ma.style.gridTemplateColumns = '1fr';
        btn.className = 'btn-modal btn-modal-ok'; btn.innerText = 'Close'; btn.onclick = closeModal;
        addConsoleLog('Health: Edge ' + lat + 'ms | Browserless ' + (bc ? 'Online' : 'Failed'), bc ? 'ok' : 'err');
        showToast('Diagnostics completed (' + lat + 'ms)', 'ok');
      } catch (err) {
        body.innerHTML = '<div style="color:var(--red);">Check failed: ' + escapeHtml(err.message) + '</div>';
        addConsoleLog('Diagnostic Error: ' + err.message, 'err');
        showToast('Diagnostics failed: ' + err.message, 'err');
      }
    }

    function confirmAndPing(target, label) {
      if (!label) { if (target === 'all') label = 'All Accounts'; else { const f = ACCOUNTS.find(a => a.id === target); label = f ? f.name : 'Account ' + target; } }
      showConfirmDialog({
        title: 'Ping ' + label + '?',
        sub: 'Keep-Alive Automation',
        body: 'Sends a 1-character keep-alive (<code style="color:#fff;font-family:var(--mono);padding:2px 5px;background:rgba(255,255,255,0.06);border-radius:4px;">.</code>) via Browserless to refresh your 5-hour limit window on Claude.ai.',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>',
        iconColor: 'var(--cyan)',
        confirmText: 'Send Ping',
        confirmClass: 'btn-modal-ok',
        onConfirm: () => triggerPing(target)
      });
    }

    function openLaunchDialog(accNum, accName) {
      if (!accName) { const f = ACCOUNTS.find(a => a.id === accNum); accName = f ? f.name : 'Account ' + accNum; }
      showConfirmDialog({
        title: 'Open Claude as ' + accName,
        sub: 'Claude Web Session',
        body: 'Make sure your browser is currently signed into <strong style="color:var(--cyan);">' + escapeHtml(accName) + '</strong> before continuing.',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
        iconColor: 'var(--purple)',
        confirmText: 'Open Claude.ai',
        confirmClass: 'btn-modal-ok',
        onConfirm: () => window.open('https://claude.ai', '_blank', 'noopener,noreferrer')
      });
    }

    async function triggerPing(target) {
      const st = document.getElementById('pingStatusText');
      if (st) { st.innerText = 'Pinging...'; st.style.color = 'var(--amber)'; }
      const ep = target === 'all' ? '/api/ping' : '/api/ping?account=' + target;
      const lbl = target === 'all' ? 'All Accounts' : 'Account ' + target;
      addConsoleLog('Dispatching headless browser for ' + lbl + '...', '');
      showToast('Dispatching ping for ' + lbl + '...', 'info');
      try {
        const res = await fetch(ep, { method: 'POST' });
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          data.results.forEach(r => {
            if (r.result && r.result.success) {
              const cl = r.result.cleanedUpSpamCount > 0 ? ' [Cleaned ' + r.result.cleanedUpSpamCount + ']' : '';
              addConsoleLog('OK: ' + r.account + ' \u27a4 ' + (r.result.pageTitle || 'Ping sent') + cl, 'ok');
              showToast('Ping succeeded for ' + r.account, 'ok');
            } else {
              addConsoleLog('FAIL: ' + r.account + ' \u27a4 ' + (r.result?.error || 'Failed'), 'err');
              showToast('Ping failed for ' + r.account, 'err');
            }
          });
        } else { addConsoleLog('Response: ' + JSON.stringify(data), ''); }
        if (st) { st.innerText = 'Success'; st.style.color = 'var(--green)'; setTimeout(() => { st.innerText = 'Ready'; st.style.color = 'var(--green)'; }, 3000); }
      } catch (err) {
        addConsoleLog('Error: ' + err.message, 'err');
        showToast('Network error pinging ' + lbl, 'err');
        if (st) { st.innerText = 'Failed'; st.style.color = 'var(--red)'; }
      }
    }

    function populateQueueAccountSelect() {
      const sel = document.getElementById('queueAccountSelect');
      if (!sel) return;
      const cv = sel.value;
      sel.innerHTML = '';
      ACCOUNTS.forEach(a => { const o = document.createElement('option'); o.value = a.id; o.innerText = a.name + ' (Account ' + a.id + ')'; sel.appendChild(o); });
      if (cv && ACCOUNTS.some(a => a.id === parseInt(cv, 10))) sel.value = cv;
    }

    let verifyDebounceTimer = null;

    function clearChatUrlInput() {
      const input = document.getElementById('queueChatUrl');
      if (input) {
        input.value = '';
        input.focus();
        updateQueueActionButtons();
        const badge = document.getElementById('urlVerifyBadge');
        if (badge) { badge.className = 'verify-badge idle'; badge.innerText = 'Awaiting URL'; }
        const preview = document.getElementById('urlPreviewCard');
        if (preview) preview.style.display = 'none';
      }
    }

    async function pasteFromClipboard() {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        const text = await navigator.clipboard.readText();
        if (text) {
          const input = document.getElementById('queueChatUrl');
          if (input) {
            input.value = text.trim();
            updateQueueActionButtons();
            verifyChatUrl(false);
            showToast('Pasted link from clipboard', 'ok');
          }
        }
      } catch (e) {
        showToast('Clipboard access unavailable: please paste directly into the box', 'warn');
      }
    }

    async function verifyChatUrl(interactive) {
      const input = document.getElementById('queueChatUrl');
      const badge = document.getElementById('urlVerifyBadge');
      const preview = document.getElementById('urlPreviewCard');
      const sel = document.getElementById('queueAccountSelect');
      if (!input || !badge) return;
      let v = input.value.trim();
      if (!v) {
        badge.className = 'verify-badge idle'; badge.innerText = 'Awaiting URL';
        if (preview) preview.style.display = 'none';
        return;
      }
      const uuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
      if (uuid.test(v)) { v = 'https://claude.ai/chat/' + v; input.value = v; }
      else if (v.startsWith('claude.ai/')) { v = 'https://' + v; input.value = v; }
      else if (v.startsWith('/chat/')) { v = 'https://claude.ai' + v; input.value = v; }
      badge.className = 'verify-badge checking'; badge.innerText = 'Verifying...';
      const aid = sel ? parseInt(sel.value, 10) : 1;
      try {
        const res = await fetch('/api/queue/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatUrl: v, accountId: aid }) });
        const data = await res.json();
        if (res.ok && data.valid) {
          badge.className = 'verify-badge valid';
          badge.innerHTML = '<svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Format Valid';
          if (preview) {
            preview.className = 'url-preview'; preview.style.display = 'flex';
            const sid = data.chatId ? data.chatId.substring(0, 14) + '...' : 'OK';
            const rawType = String(data.chatType || 'Claude conversation');
            const chatTypeLabel = rawType.includes('(') ? rawType.split('(')[0].trim() : rawType;
            preview.innerHTML =
              '<div class="url-preview-head"><span style="color:var(--green);display:flex;align-items:center;gap:6px;"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01-18 0z"/></svg>' + escapeHtml(chatTypeLabel) + ' format matches</span><span class="url-preview-id">ID ' + escapeHtml(sid) + '</span></div>';
          }
          if (interactive) {
            addConsoleLog('Claude URL format valid: ' + data.chatType, 'ok');
            showToast('Claude URL format looks valid', 'ok');
          }
        } else {
          badge.className = 'verify-badge invalid';
          badge.innerHTML = '<svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>Invalid';
          if (preview) {
            preview.className = 'url-preview error'; preview.style.display = 'flex';
            preview.innerHTML = '<div style="color:var(--red);font-weight:700;display:flex;align-items:center;gap:5px;"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>Notice</div><div style="color:#fca5a5;font-size:0.66rem;">' + escapeHtml(data.error || 'Enter a valid Claude URL.') + '</div>';
          }
          if (interactive) showToast(data.error || 'Enter a valid Claude URL.', 'err');
        }
      } catch (err) {
        badge.className = 'verify-badge warning'; badge.innerText = 'Format Only';
      }
    }

    let selectedTimingMode = 'next';

    function setTimingMode(mode) {
      selectedTimingMode = mode;
      const pN = document.getElementById('pillTimingNext');
      const pS = document.getElementById('pillTimingSlot');
      const pT = document.getElementById('pillTimingTime');
      if (pN) pN.className = 'timing-pill-btn ' + (mode === 'next' ? 'active' : '');
      if (pS) pS.className = 'timing-pill-btn ' + (mode === 'slot' ? 'active' : '');
      if (pT) pT.className = 'timing-pill-btn ' + (mode === 'time' ? 'active' : '');
      if (pN) pN.setAttribute('aria-pressed', String(mode === 'next'));
      if (pS) pS.setAttribute('aria-pressed', String(mode === 'slot'));
      if (pT) pT.setAttribute('aria-pressed', String(mode === 'time'));

      const slotWrap = document.getElementById('timingSlotWrap');
      const timeWrap = document.getElementById('timingExactWrap');
      if (slotWrap) slotWrap.style.display = mode === 'slot' ? 'block' : 'none';
      if (timeWrap) timeWrap.style.display = mode === 'time' ? 'block' : 'none';

      if (mode === 'slot') populateQueueSlotSelect();
      updateQueueButtonLabels();
      updateQueueActionButtons();
    }

    let currentMeridiem = 'AM';

    function paintMeridiemButtons() {
      const bAM = document.getElementById('btnMeridiemAM');
      const bPM = document.getElementById('btnMeridiemPM');
      if (bAM) {
        bAM.className = 'btn-meridiem-switch ' + (currentMeridiem === 'AM' ? 'active am' : '');
        bAM.setAttribute('aria-pressed', String(currentMeridiem === 'AM'));
      }
      if (bPM) {
        bPM.className = 'btn-meridiem-switch ' + (currentMeridiem === 'PM' ? 'active pm' : '');
        bPM.setAttribute('aria-pressed', String(currentMeridiem === 'PM'));
      }
    }

    function setMeridiem(mer) {
      currentMeridiem = mer;
      paintMeridiemButtons();
      onExactTimeChanged();
    }

    function getExact12hTime() {
      const hEl = document.getElementById('queueExactHour');
      const mEl = document.getElementById('queueExactMinute');
      let h = parseInt(hEl ? hEl.value : '12', 10);
      let m = parseInt(mEl ? mEl.value : '00', 10);
      if (isNaN(h) || h < 1 || h > 12) h = 12;
      if (isNaN(m) || m < 0 || m > 59) m = 0;
      return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' ' + currentMeridiem;
    }

    function stepHour(delta, notify = true) {
      const hEl = document.getElementById('queueExactHour');
      if (!hEl) return;
      let val = parseInt(hEl.value || '12', 10);
      if (isNaN(val) || val < 1 || val > 12) val = 12;
      const previousHour = val;
      val += delta;
      if (val > 12) val = 1;
      if (val < 1) val = 12;
      hEl.value = String(val).padStart(2, '0');
      if ((previousHour === 11 && val === 12) || (previousHour === 12 && val === 11)) {
        currentMeridiem = currentMeridiem === 'AM' ? 'PM' : 'AM';
        paintMeridiemButtons();
      }
      if (notify) onExactTimeChanged();
    }

    function stepMinute(delta) {
      const mEl = document.getElementById('queueExactMinute');
      if (!mEl) return;
      let val = parseInt(mEl.value || '00', 10);
      if (isNaN(val)) val = 0;
      val = val + delta;
      if (val >= 60) {
        val = 0;
        stepHour(1, false);
      } else if (val < 0) {
        val = 59;
        stepHour(-1, false);
      }
      mEl.value = String(val).padStart(2, '0');
      onExactTimeChanged();
    }

    function handleHourInput(el) {
      let raw = el.value.replace(/\D/g, '');
      if (raw.length > 2) raw = raw.slice(-2);
      el.value = raw;
      if (raw.length === 2 || (raw.length === 1 && parseInt(raw, 10) >= 2)) {
        const mEl = document.getElementById('queueExactMinute');
        if (mEl) {
          mEl.focus();
          mEl.select();
        }
      }
      onExactTimeChanged();
    }

    function normalizeHourInput(el) {
      let val = parseInt(el.value, 10);
      if (isNaN(val) || val < 1) val = 12;
      if (val > 12) val = 12;
      el.value = String(val).padStart(2, '0');
      onExactTimeChanged();
    }

    function handleMinuteInput(el) {
      let raw = el.value.replace(/\D/g, '');
      if (raw.length > 2) raw = raw.slice(-2);
      el.value = raw;
      onExactTimeChanged();
    }

    function normalizeMinuteInput(el) {
      let val = parseInt(el.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 59) val = 59;
      el.value = String(val).padStart(2, '0');
      onExactTimeChanged();
    }

    function handleTimeKeydown(event, type) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (type === 'hour') stepHour(1); else stepMinute(1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (type === 'hour') stepHour(-1); else stepMinute(-1);
      }
    }

    function adjustTimeMinutes(deltaMinutes) {
      const hEl = document.getElementById('queueExactHour');
      const mEl = document.getElementById('queueExactMinute');
      let h12 = parseInt(hEl ? hEl.value : '12', 10);
      let m = parseInt(mEl ? mEl.value : '00', 10);
      if (isNaN(h12) || h12 < 1 || h12 > 12) h12 = 12;
      if (isNaN(m) || m < 0 || m > 59) m = 0;
      let h24 = (h12 % 12) + (currentMeridiem === 'PM' ? 12 : 0);
      let totalMins = (h24 * 60 + m + deltaMinutes) % 1440;
      if (totalMins < 0) totalMins += 1440;

      let newH24 = Math.floor(totalMins / 60);
      let newM = totalMins % 60;
      let newMer = newH24 >= 12 ? 'PM' : 'AM';
      let newH12 = newH24 % 12 === 0 ? 12 : newH24 % 12;

      if (hEl) hEl.value = String(newH12).padStart(2, '0');
      if (mEl) mEl.value = String(newM).padStart(2, '0');
      setMeridiem(newMer);
    }

    function setTimeToCurrentNow() {
      const istNow = getISTClockParts();
      let h24 = istNow.hour;
      let m = istNow.minute + 1;
      if (m >= 60) {
        m = 0;
        h24 = (h24 + 1) % 24;
      }
      let mer = h24 >= 12 ? 'PM' : 'AM';
      let h12 = h24 % 12 === 0 ? 12 : h24 % 12;

      const hEl = document.getElementById('queueExactHour');
      const mEl = document.getElementById('queueExactMinute');
      if (hEl) hEl.value = String(h12).padStart(2, '0');
      if (mEl) mEl.value = String(m).padStart(2, '0');
      setMeridiem(mer);
    }

    function applyTimePreset(timeStr) {
      const match = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return;
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      let mer = match[3] ? match[3].toUpperCase() : null;
      if (minute > 59) return;
      if (mer) {
        if (hour < 1 || hour > 12) return;
      } else {
        if (hour < 0 || hour > 23) return;
        mer = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
      }

      // Commit the whole picker state together. This avoids rebuilding the smart
      // preset buttons halfway through a click and keeps the preview in sync.
      if (selectedTimingMode !== 'time') setTimingMode('time');
      currentMeridiem = mer;
      const hEl = document.getElementById('queueExactHour');
      const mEl = document.getElementById('queueExactMinute');
      if (hEl) hEl.value = String(hour).padStart(2, '0');
      if (mEl) mEl.value = String(minute).padStart(2, '0');
      paintMeridiemButtons();
      onExactTimeChanged();
    }

    function updateExactTimeCountdownOnly() {
      const hEl = document.getElementById('queueExactHour');
      const mEl = document.getElementById('queueExactMinute');
      if (!hEl || !mEl) return;
      let h12 = parseInt(hEl.value || '12', 10);
      let m = parseInt(mEl.value || '0', 10);
      if (isNaN(h12)) h12 = 12;
      if (isNaN(m)) m = 0;
      let h24 = (h12 % 12) + (currentMeridiem === 'PM' ? 12 : 0);
      const nowMs = Date.now();
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(nowMs + istOffsetMs);
      let targetTimestamp = Date.UTC(
        istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(), h24, m, 0, 0
      ) - istOffsetMs;

      // Match calculateTargetTimestamp(): the selected minute must still be in
      // the future, otherwise the task is scheduled for its next daily run.
      const isTomorrow = targetTimestamp <= nowMs;
      if (isTomorrow) targetTimestamp += 24 * 60 * 60 * 1000;
      const remainingSeconds = Math.max(0, Math.ceil((targetTimestamp - nowMs) / 1000));
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      let diffH = Math.floor(remainingMinutes / 60);
      let diffRemM = remainingMinutes % 60;
      let countdownStr = '';
      if (remainingSeconds < 60) countdownStr = 'in ' + remainingSeconds + 's';
      else if (diffH > 0 && diffRemM > 0) countdownStr = 'in ' + diffH + 'h ' + diffRemM + 'm';
      else if (diffH > 0) countdownStr = 'in ' + diffH + 'h';
      else countdownStr = 'in ' + diffRemM + 'm';

      if (isTomorrow) countdownStr += ' (Tomorrow)';

      const previewCountdown = document.getElementById('exactTimeCountdownText');
      if (previewCountdown && previewCountdown.textContent !== countdownStr) {
        previewCountdown.textContent = countdownStr;
      }
    }

    function onExactTimeChanged() {
      const formatted = getExact12hTime();
      const hiddenInp = document.getElementById('queueExactTime');
      if (hiddenInp) hiddenInp.value = formatted;

      const preview = document.getElementById('exactTimePreviewText');
      if (preview) {
        preview.textContent = 'Will execute at ' + formatted + ' IST';
      }
      updateExactTimeCountdownOnly();
      updateQueueButtonLabels();
      updateQueueActionButtons();
      updateSmartPresets();
    }

    function parseTimeToMinsOfDay(str) {
      if (!str) return null;
      const clean = String(str).trim().replace(/\s*(IST|UTC|GMT)$/i, '').trim();
      const match = clean.match(/^(\d{1,2}):(\d{1,2})(?:\s*(AM|PM))?$/i);
      if (!match) return null;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const mer = match[3] ? match[3].toUpperCase() : null;
      if (mer === 'PM' && h < 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      if (h < 0 || h > 23 || m < 0 || m > 59) return null;
      return h * 60 + m;
    }

    function getTaskScheduledMinsOfDay(task) {
      if (!task) return null;
      if (task.targetTime) {
        const mins = parseTimeToMinsOfDay(task.targetTime);
        if (mins !== null) return mins;
      }
      if (task.targetTimestamp) {
        try {
          const d = new Date(task.targetTimestamp);
          const parts = istFormatter.formatToParts(d);
          const p = {};
          for (const part of parts) p[part.type] = part.value;
          let h = parseInt(p.hour, 10);
          let m = parseInt(p.minute, 10);
          if (!isNaN(h) && !isNaN(m)) return (h % 24) * 60 + m;
        } catch (_) {}
      }
      if (task.targetSlot) {
        const slotItem = SCHEDULE.find(s => s.slot === task.targetSlot && s.account === task.accountId);
        if (slotItem) return slotItem.minsOfDay;
      }
      if (task.targetType === 'next') {
        const nextPingStr = getNextPingDisplayForAccount(task.accountId);
        if (nextPingStr) {
          const mins = parseTimeToMinsOfDay(nextPingStr);
          if (mins !== null) return mins;
        }
      }
      if (task.queuedAtTimestamp) {
        try {
          const d = new Date(task.queuedAtTimestamp);
          const parts = istFormatter.formatToParts(d);
          const p = {};
          for (const part of parts) p[part.type] = part.value;
          let h = parseInt(p.hour, 10);
          let m = parseInt(p.minute, 10);
          if (!isNaN(h) && !isNaN(m)) return (h % 24) * 60 + m;
        } catch (_) {}
      }
      return null;
    }

    function getTaskQueuedAtTimestamp(task) {
      const numeric = Number(task && task.queuedAtTimestamp);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
      const parsed = Date.parse((task && task.queuedAt) || '');
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function getLatestTaskScheduledMinsOfDay(tasks) {
      if (!tasks || tasks.length === 0) return null;
      const scheduledTasks = tasks.filter(task => getTaskScheduledMinsOfDay(task) !== null);
      if (scheduledTasks.length === 0) return null;
      const chronological = scheduledTasks.sort((a, b) =>
        getTaskQueuedAtTimestamp(b) - getTaskQueuedAtTimestamp(a) ||
        (Number(b.targetTimestamp) || 0) - (Number(a.targetTimestamp) || 0)
      );
      if (getTaskQueuedAtTimestamp(chronological[0]) > 0) {
        return getTaskScheduledMinsOfDay(chronological[0]);
      }

      // Older queue records may not have a creation timestamp. Prefer the
      // latest scheduled instant when available, then fall back to time of day.
      const withTimestamp = chronological
        .filter(task => Number.isFinite(Number(task.targetTimestamp)) && Number(task.targetTimestamp) > 0)
        .sort((a, b) => Number(b.targetTimestamp) - Number(a.targetTimestamp));
      if (withTimestamp.length) return getTaskScheduledMinsOfDay(withTimestamp[0]);
      return chronological.reduce((latest, task) => {
        const mins = getTaskScheduledMinsOfDay(task);
        return mins !== null && (latest === null || mins > latest) ? mins : latest;
      }, null);
    }

    let lastSmartPresetKey = '';

    function updateSmartPresets(force = false) {
      const grid = document.getElementById('chronoPresetsGrid');
      const callout = document.getElementById('smartQueueCallout');
      if (!grid) return;

      const currentPickerTime = getExact12hTime();
      const currentPickerMins = parseTimeToMinsOfDay(currentPickerTime) ?? 0;
      const accSel = document.getElementById('queueAccountSelect');
      const targetAccId = accSel ? parseInt(accSel.value, 10) : 1;
      const targetAcc = ACCOUNTS.find(a => a.id === targetAccId) || ACCOUNTS[0] || { id: 1, name: 'Account 1' };
      const otherAcc = ACCOUNTS.find(a => a.id !== targetAccId) || (ACCOUNTS.length > 1 ? ACCOUNTS[1] : null);

      const telemetry = calculateTelemetry();
      const targetState = telemetry.accountStates.find(a => a.id === targetAccId);
      const otherState = otherAcc ? telemetry.accountStates.find(a => a.id === otherAcc.id) : null;

      const activeQueued = (cachedAllQueueTasks || []).filter(t => t.status === 'queued' || t.status === 'processing');
      const targetTasks = activeQueued.filter(t => t.accountId === targetAccId);
      const otherTasks = otherAcc ? activeQueued.filter(t => t.accountId === otherAcc.id) : [];

      const targetLatestTaskMins = getLatestTaskScheduledMinsOfDay(targetTasks);
      const otherLatestTaskMins = getLatestTaskScheduledMinsOfDay(otherTasks);

      const stateKey = [
        currentPickerTime,
        targetAccId,
        targetTasks.map(t => [getTaskScheduledMinsOfDay(t), getTaskQueuedAtTimestamp(t)].join(':')).join(','),
        otherTasks.map(t => [getTaskScheduledMinsOfDay(t), getTaskQueuedAtTimestamp(t)].join(':')).join(','),
        targetState ? (targetState.isActive ? 'act' : 'sb') : 'na',
        otherState ? (otherState.isActive ? 'act' : 'sb') : 'na'
      ].join('||');

      // 1. Update the dedicated smart context callout banner for this account
      if (callout) {
        if (targetLatestTaskMins !== null) {
          const postTaskMins = (targetLatestTaskMins + 302) % 1440;
          const postTaskTime = fmtMinsToTime(postTaskMins);
          const taskTimeStr = fmtMinsToTime(targetLatestTaskMins);
          callout.style.display = 'flex';
          const calloutMarkup =
            '<div class="smart-queue-callout-text">' +
              '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' +
              '<span><strong>' + escapeHtml(targetAcc.name) + '</strong> has a task queued for <strong>' + taskTimeStr + '</strong>. Suggested reset: <strong>' + postTaskTime + '</strong> (+5h 2m).</span>' +
            '</div>' +
            '<button type="button" class="btn-callout-apply" onclick="applyTimePreset(&quot;' + postTaskTime + '&quot;)">Set ' + postTaskTime + '</button>';
          // Keep the active Set button mounted while only the picker value changes.
          if (callout.innerHTML !== calloutMarkup) callout.innerHTML = calloutMarkup;
        } else {
          callout.style.display = 'none';
        }
      }

      if (!force && stateKey === lastSmartPresetKey) return;
      lastSmartPresetKey = stateKey;

      const presets = [];
      const targetAccLabel = targetAcc.name.replace(/^Account\s*/i, 'Acc ');
      const otherAccLabel = otherAcc ? otherAcc.name.replace(/^Account\s*/i, 'Acc ') : 'Other';

      // 1. Primary Suggestion 1: Selected Account's Next Scheduled Reset
      if (targetState && targetState.isActive && targetState.mostRecent) {
        const actResetMins = (targetState.mostRecent.minsOfDay + 302) % 1440;
        presets.push({
          time: fmtMinsToTime(actResetMins),
          sub: targetAccLabel + ' Next Reset',
          tooltip: targetAcc.name + ' active 5h quota resets at ' + fmtMinsToTime(actResetMins),
          highlight: true,
          dot: true
        });
      } else if (targetState && targetState.nextPing) {
        presets.push({
          time: targetState.nextPing.display,
          sub: targetAccLabel + ' Next Reset',
          tooltip: targetAcc.name + ' scheduled autopilot reset at ' + targetState.nextPing.display,
          highlight: true,
          dot: true
        });
      }

      // 2. Primary Suggestion 2: +5h (and buffer) from Last Queued Task on this Account
      if (targetLatestTaskMins !== null) {
        const postTaskMins = (targetLatestTaskMins + 302) % 1440;
        const postTaskTime = fmtMinsToTime(postTaskMins);
        presets.push({
          time: postTaskTime,
          sub: '+5h from Last Queue',
          tooltip: '5h limit reset after ' + targetAcc.name + ' task at ' + fmtMinsToTime(targetLatestTaskMins),
          highlight: true,
          dot: true
        });

        // 3. Exact 5h without buffer from Last Queued Task
        const exact5hMins = (targetLatestTaskMins + 300) % 1440;
        const exact5hTime = fmtMinsToTime(exact5hMins);
        presets.push({
          time: exact5hTime,
          sub: '+5h Exact (No Buffer)',
          tooltip: 'Exact 5h window (no buffer) after ' + targetAcc.name + ' task at ' + fmtMinsToTime(targetLatestTaskMins),
          highlight: false
        });
      } else {
        // If no tasks on this account yet, suggest +5h 2m cascade from dialed time
        const cascade1Mins = (currentPickerMins + 302) % 1440;
        presets.push({
          time: fmtMinsToTime(cascade1Mins),
          sub: '+5h 2m Limit Reset',
          tooltip: '5h limit window + 2m buffer from dialed time (' + currentPickerTime + ')',
          highlight: true,
          dot: true
        });

        const cascade2Mins = (currentPickerMins + 604) % 1440;
        presets.push({
          time: fmtMinsToTime(cascade2Mins),
          sub: '+10h 4m (Cycle 2)',
          tooltip: 'Two full limit cycles (+10h 4m) from dialed time (' + currentPickerTime + ')',
          highlight: false
        });
      }

      // 4. Other Account: From Queue OR Next Reset
      if (otherAcc && otherState) {
        if (otherLatestTaskMins !== null) {
          const oResetMins = (otherLatestTaskMins + 302) % 1440;
          presets.push({
            time: fmtMinsToTime(oResetMins),
            sub: otherAccLabel + ' from Queue',
            tooltip: '5h limit reset after ' + otherAcc.name + ' task at ' + fmtMinsToTime(otherLatestTaskMins),
            highlight: false
          });
        } else if (otherState.isActive && otherState.mostRecent) {
          const oActResetMins = (otherState.mostRecent.minsOfDay + 302) % 1440;
          presets.push({
            time: fmtMinsToTime(oActResetMins),
            sub: otherAccLabel + ' Next Reset',
            tooltip: otherAcc.name + ' active quota clears at ' + fmtMinsToTime(oActResetMins),
            highlight: false
          });
        } else if (otherState.nextPing) {
          presets.push({
            time: otherState.nextPing.display,
            sub: otherAccLabel + ' Next Reset',
            tooltip: otherAcc.name + ' scheduled autopilot ping at ' + otherState.nextPing.display,
            highlight: false
          });
        }
      }

      // 5. Claude Global Daily Reset (03:30 AM)
      presets.push({
        time: '03:30 AM',
        sub: 'Claude Global Reset',
        tooltip: 'Daily midnight quota reset (03:30 AM IST)',
        highlight: false,
        dot: true
      });

      // 6. Earliest Upcoming Autopilot Cron Slot
      const upcomingCron = SCHEDULE.find(s => s.minsOfDay > telemetry.currentMinsOfDay) || SCHEDULE[0];
      if (upcomingCron) {
        presets.push({
          time: upcomingCron.display,
          sub: 'Next System Ping',
          tooltip: 'Earliest upcoming autopilot ping across all accounts at ' + upcomingCron.display,
          highlight: false
        });
      }

      const fallbackPresets = [
        { time: '12:00 AM', sub: 'Midnight', tooltip: '12:00 AM Midnight' },
        { time: '07:30 AM', sub: 'Morning Reset', tooltip: '07:30 AM Morning' },
        { time: '12:00 PM', sub: 'Midday Reset', tooltip: '12:00 PM Midday' },
        { time: '03:30 PM', sub: 'Afternoon Reset', tooltip: '03:30 PM Afternoon' },
        { time: '08:00 PM', sub: 'Evening Reset', tooltip: '08:00 PM Evening' },
        { time: '10:36 PM', sub: 'Night Reset', tooltip: '10:36 PM Night' }
      ];

      const finalPresets = [];
      const seenTimes = new Set();

      for (const p of presets) {
        if (!seenTimes.has(p.time) && finalPresets.length < 6) {
          seenTimes.add(p.time);
          finalPresets.push(p);
        }
      }

      for (const fb of fallbackPresets) {
        if (finalPresets.length >= 6) break;
        if (!seenTimes.has(fb.time)) {
          seenTimes.add(fb.time);
          finalPresets.push(fb);
        }
      }

      grid.innerHTML = '';
      finalPresets.forEach(p => {
        const isSelected = p.time === currentPickerTime;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chrono-preset-pill' + (p.highlight ? ' highlight-reset' : '') + (isSelected ? ' current-selected' : '');
        btn.title = p.tooltip || ('Set time to ' + p.time);
        btn.onclick = () => {
          applyTimePreset(p.time);
          showToast('Time set to ' + p.time + ' (' + p.sub + ')', 'info');
        };

        const dotHtml = p.dot ? '<span class="preset-dot-claude"></span>' : '';
        btn.innerHTML =
          '<span class="preset-pill-time">' + dotHtml + escapeHtml(p.time) + '</span>' +
          '<span class="preset-pill-sub">' + escapeHtml(p.sub) + '</span>';
        grid.appendChild(btn);
      });
    }

    function initChronoDeckWheelEvents() {
      const hInput = document.getElementById('queueExactHour');
      if (hInput) {
        hInput.addEventListener('wheel', (e) => {
          e.preventDefault();
          stepHour(e.deltaY < 0 ? 1 : -1);
        }, { passive: false });
      }
      const mInput = document.getElementById('queueExactMinute');
      if (mInput) {
        mInput.addEventListener('wheel', (e) => {
          e.preventDefault();
          stepMinute(e.deltaY < 0 ? 1 : -1);
        }, { passive: false });
      }
    }

    function updateQueueButtonLabels() {
      const buttonText = document.getElementById('btnQueueText');
      if (!buttonText) return;
      let label = 'Queue for Next Ping';
      if (selectedTimingMode === 'slot') {
        const slotSelect = document.getElementById('queueSlotSelect');
        const selected = slotSelect && slotSelect.options[slotSelect.selectedIndex];
        if (selected && selected.value) label = 'Queue for ' + selected.textContent;
        else label = 'No scheduled times';
      } else if (selectedTimingMode === 'time') {
        const chosenTime = getExact12hTime();
        label = 'Queue for ' + chosenTime + ' IST';
      }
      buttonText.textContent = label;
    }

    function populateQueueSlotSelect() {
      const sel = document.getElementById('queueSlotSelect');
      const accSel = document.getElementById('queueAccountSelect');
      if (!sel) return;
      const targetAccId = accSel ? parseInt(accSel.value, 10) : 1;
      const accSchedule = SCHEDULE.filter(s => s.account === targetAccId);
      sel.innerHTML = '';
      sel.disabled = accSchedule.length === 0;
      if (accSchedule.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No scheduled times for this account';
        sel.appendChild(opt);
      }
      accSchedule.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.slot;
        opt.dataset.display = s.display + ' · ' + s.tag;
        opt.innerText = s.display + ' · ' + s.tag;
        sel.appendChild(opt);
      });
      updateQueueButtonLabels();
      updateQueueActionButtons();
    }

    let cachedAllQueueTasks = [];
    const QUEUE_COLLAPSE_THRESHOLD = 3;
    let isQueuedExpanded = false;
    let isCompletedExpanded = false;

    function toggleQueuedExpand() {
      isQueuedExpanded = !isQueuedExpanded;
      fetchQueueTasks();
    }

    function toggleCompletedExpand() {
      isCompletedExpanded = !isCompletedExpanded;
      fetchQueueTasks();
    }

    function buildTaskCardElement(task) {
      const acc = ACCOUNTS.find(a => a.id === task.accountId) || { name: task.accountName || ('Account ' + task.accountId), color: '#00e5f0' };
      const su = (task.chatUrl && (task.chatUrl.startsWith('http://') || task.chatUrl.startsWith('https://'))) ? escapeHtml(task.chatUrl) : '#';
      const suClean = su.startsWith('https://') ? su.slice(8) : (su.startsWith('http://') ? su.slice(7) : su);
      const isHistory = task.status === 'completed' || task.status === 'failed';

      if (isHistory) {
        const el = document.createElement('div');
        el.className = 'history-card ' + task.status;
        const isDone = task.status === 'completed';
        const statusBadge = isDone
          ? '<span class="history-pill done"><span style="width:5px;height:5px;border-radius:50%;background:var(--green);display:inline-block;"></span>Done</span>'
          : '<span class="history-pill failed"><span style="width:5px;height:5px;border-radius:50%;background:var(--red);display:inline-block;"></span>Failed</span>';

        let finishTimeStr = 'Recently';
        if (task.completedAt) {
          try {
            finishTimeStr = new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          } catch (_) {}
        }

        const scheduledTimeTag = task.targetTime
          ? ('<span class="history-time-tag"><svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + escapeHtml(task.targetTime) + '</span>')
          : '';

        el.innerHTML =
          '<div class="history-head">' +
            '<div class="history-head-left">' +
              '<span class="history-acc-tag" style="color:' + (acc.color || '#00e5f0') + ';">' +
                '<span class="history-acc-dot" style="background:' + (acc.color || '#00e5f0') + ';"></span>' +
                escapeHtml(acc.name) +
              '</span>' +
              statusBadge +
              scheduledTimeTag +
            '</div>' +
            '<button type="button" class="btn-history-del" onclick="confirmClearSingleTask(' + task.accountId + ', &quot;' + task.id + '&quot;)" title="Remove record">' +
              '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="history-prompt-row">' +
            '&ldquo;' + escapeHtml(task.prompt || 'continue') + '&rdquo;' +
          '</div>' +
          '<div class="history-foot">' +
            '<a href="' + su + '" target="_blank" rel="noopener noreferrer" class="history-url-chip">' +
              '<svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' +
              '<span class="history-url-text">' + suClean + '</span>' +
              '<svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
            '</a>' +
            '<span class="history-finished-text">' + (isDone ? ('Finished ' + finishTimeStr) : ('Failed: ' + escapeHtml(task.error || 'Execution error'))) + '</span>' +
          '</div>';
        return el;
      }

      // Active Queued Card
      const el = document.createElement('div');
      el.className = 'task-card ' + (task.status || 'queued');

      let sb = '<span class="task-status queued"><span style="width:6px;height:6px;border-radius:50%;background:var(--cyan);display:inline-block;box-shadow:0 0 5px var(--cyan);"></span>Queued</span>';

      let tb = '<span class="target-badge"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Next Ping</span>';
      let tt = 'Fires on next scheduled reset ping';

      if (task.targetType === 'slot') {
        const slotText = task.targetSlotDisplay || ('Slot ' + task.targetSlot);
        tb = '<span class="target-badge slot"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' + escapeHtml(slotText) + '</span>';
        tt = 'Scheduled for ' + escapeHtml(slotText);
      } else if (task.targetType === 'time') {
        let timeText = '';
        if (task.targetTimestamp) {
          try {
            timeText = new Date(task.targetTimestamp).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';
          } catch (_) {}
        }
        if (!timeText && task.targetTime) {
          const formatted = timeInputValueToText(task.targetTime);
          timeText = formatted.includes('IST') ? formatted : (formatted + ' IST');
        }
        if (timeText) {
          tb = '<span class="target-badge time"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + escapeHtml(timeText) + '</span>';
          tt = 'Scheduled for exact reset at ' + escapeHtml(timeText);
        } else {
          const nextPing = getNextPingDisplayForAccount(task.accountId);
          const npLabel = nextPing ? ('Next Ping (' + escapeHtml(nextPing) + ')') : 'Next Ping';
          tb = '<span class="target-badge"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' + npLabel + '</span>';
          tt = 'Fires on next scheduled reset ping' + (nextPing ? (' at ' + escapeHtml(nextPing) + ' IST') : '');
        }
      } else {
        const nextPing = getNextPingDisplayForAccount(task.accountId);
        if (nextPing) {
          tb = '<span class="target-badge"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Next Ping (' + escapeHtml(nextPing) + ')</span>';
          tt = 'Fires on next scheduled reset ping at ' + escapeHtml(nextPing) + ' IST';
        }
      }

      const actionBtns = '<div class="task-actions">' +
        '<button type="button" class="btn-dispatch-task" onclick="confirmDispatchSingleTask(&quot;' + task.id + '&quot;, ' + task.accountId + ')" title="Execute this prompt immediately"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Run Now</button>' +
        '<button type="button" class="btn-cancel-task" onclick="confirmCancelTask(' + task.accountId + ', &quot;' + task.id + '&quot;)"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>Cancel</button>' +
      '</div>';

      el.innerHTML =
        '<div class="task-top">' +
          '<div class="task-acc-wrap">' +
            '<span class="task-acc-name" style="color:' + (acc.color || '#00e5f0') + ';">' + escapeHtml(acc.name) + '</span>' +
            sb +
            tb +
          '</div>' +
          actionBtns +
        '</div>' +
        '<div class="task-prompt-box">' +
          '<div class="task-prompt-badge">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>' +
            '<span>Prompt Instruction</span>' +
          '</div>' +
          '<div class="task-prompt-content">\u201c' + escapeHtml(task.prompt || 'continue') + '\u201d</div>' +
        '</div>' +
        '<div class="task-footer">' +
          '<a href="' + su + '" target="_blank" rel="noopener noreferrer" class="task-url-chip">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>' +
            '<span class="task-url-text">' + suClean + '</span>' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>' +
          '</a>' +
          '<div class="task-timing-chip">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
            '<span>' + escapeHtml(tt) + '</span>' +
          '</div>' +
        '</div>';
      return el;
    }

    async function fetchQueueTasks() {
      const qList = document.getElementById('activeTasksList');
      const cList = document.getElementById('completedTasksList');
      const qBadge = document.getElementById('taskCountBadge');
      const cBadge = document.getElementById('taskCompletedCountBadge');
      const compSection = document.getElementById('completedTasksSection');
      const clearBtn = document.getElementById('btnClearCompletedTasks');

      if (!qList) return;
      try {
        const res = await fetch('/api/queue');
        if (!res.ok) return;
        const data = await res.json();
        const rawTasks = data.tasks || {};
        
        // Flatten tasks: support both array of tasks and legacy single task object
        const allItems = [];
        Object.entries(rawTasks).forEach(([accIdStr, val]) => {
          const accId = parseInt(accIdStr, 10);
          if (Array.isArray(val)) {
            val.forEach(t => allItems.push({ ...t, accountId: accId }));
          } else if (val && typeof val === 'object') {
            allItems.push({ ...val, accountId: accId });
          }
        });

        cachedAllQueueTasks = allItems;
        updateSmartPresets();

        // Split into queued and completed
        const queuedItems = allItems.filter(t => t.status === 'queued' || t.status === 'processing');
        const completedItems = allItems.filter(t => t.status !== 'queued' && t.status !== 'processing');

        // Sort queued items: earliest due or newest queued first
        queuedItems.sort((a, b) => {
          if (a.targetTimestamp && b.targetTimestamp) return a.targetTimestamp - b.targetTimestamp;
          return (b.queuedAtTimestamp || 0) - (a.queuedAtTimestamp || 0);
        });

        // Sort completed items: newest completed first
        completedItems.sort((a, b) => {
          const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.queuedAtTimestamp || 0);
          const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.queuedAtTimestamp || 0);
          return tB - tA;
        });

        if (qBadge) qBadge.innerText = String(queuedItems.length);
        if (cBadge) cBadge.innerText = String(completedItems.length);

        // 1. Render Active Queued Section
        qList.innerHTML = '';
        if (queuedItems.length === 0) {
          qList.innerHTML = '<div class="empty-state"><svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>No active tasks queued. Enter a Claude chat link and prompt above to automate your reset.</span></div>';
        } else {
          const visibleQueuedCount = isQueuedExpanded ? queuedItems.length : Math.min(QUEUE_COLLAPSE_THRESHOLD, queuedItems.length);
          for (let i = 0; i < visibleQueuedCount; i++) {
            qList.appendChild(buildTaskCardElement(queuedItems[i]));
          }
          if (queuedItems.length > QUEUE_COLLAPSE_THRESHOLD) {
            const expBtn = document.createElement('button');
            expBtn.type = 'button';
            expBtn.className = 'btn-queue-expand' + (isQueuedExpanded ? ' expanded' : '');
            expBtn.onclick = toggleQueuedExpand;
            if (isQueuedExpanded) {
              expBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg><span>Show less (' + QUEUE_COLLAPSE_THRESHOLD + ' visible)</span>';
            } else {
              const remaining = queuedItems.length - QUEUE_COLLAPSE_THRESHOLD;
              expBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg><span>Show ' + remaining + ' more queued task' + (remaining === 1 ? '' : 's') + '</span><span class="expand-badge">+' + remaining + '</span>';
            }
            qList.appendChild(expBtn);
          }
        }

        // 2. Render Completed & History Section
        if (cList) {
          cList.innerHTML = '';
          if (completedItems.length > 0) {
            // Keep the section's column layout so its header-to-list gap applies.
            if (compSection) compSection.style.display = 'flex';
            if (clearBtn) clearBtn.disabled = false;

            const visibleCompCount = isCompletedExpanded ? completedItems.length : Math.min(QUEUE_COLLAPSE_THRESHOLD, completedItems.length);
            for (let i = 0; i < visibleCompCount; i++) {
              cList.appendChild(buildTaskCardElement(completedItems[i]));
            }
            if (completedItems.length > QUEUE_COLLAPSE_THRESHOLD) {
              const expBtn = document.createElement('button');
              expBtn.type = 'button';
              expBtn.className = 'btn-queue-expand' + (isCompletedExpanded ? ' expanded' : '');
              expBtn.onclick = toggleCompletedExpand;
              if (isCompletedExpanded) {
                expBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg><span>Collapse history (showing all ' + completedItems.length + ')</span>';
              } else {
                const remaining = completedItems.length - QUEUE_COLLAPSE_THRESHOLD;
                expBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg><span>View ' + remaining + ' more completed execution' + (remaining === 1 ? '' : 's') + '</span><span class="expand-badge completed">+' + remaining + '</span>';
              }
              cList.appendChild(expBtn);
            }
          } else {
            if (compSection) compSection.style.display = 'none';
            if (clearBtn) clearBtn.disabled = true;
          }
        }
      } catch (e) { console.warn('Queue fetch skipped:', e.message); }
    }

    function confirmQueueTask(runNow) {
      const sel = document.getElementById('queueAccountSelect'), ci = document.getElementById('queueChatUrl'), pi = document.getElementById('queuePrompt');
      const aid = sel ? parseInt(sel.value, 10) : 1;
      const cu = ci ? ci.value.trim() : '', pr = pi ? pi.value.trim() : '';

      if (!pr) {
        showToast('Write the instruction to send to Claude.', 'warn');
        if (pi) pi.focus();
        return;
      }

      if (!cu) {
        showToast('Please paste your Claude Chat URL first!', 'warn');
        if (ci) ci.focus();
        return;
      }
      if (!cu.includes('claude.ai') && !cu.match(/^[a-zA-Z0-9_-]{8,}$/)) {
        showToast('Please enter a valid Claude conversation URL.', 'warn');
        if (ci) ci.focus();
        return;
      }

      const acc = ACCOUNTS.find(a => a.id === aid) || { name: 'Account ' + aid, color: 'var(--cyan)' };
      let timingDesc = 'Next scheduled reset ping';
      if (selectedTimingMode === 'slot') {
        const slotEl = document.getElementById('queueSlotSelect');
        if (slotEl && slotEl.options[slotEl.selectedIndex]) {
          timingDesc = slotEl.options[slotEl.selectedIndex].dataset.display || ('Slot ' + slotEl.value);
        }
      } else if (selectedTimingMode === 'time') {
        const exactTime = getExact12hTime();
        if (!exactTime) {
          showToast('Choose an exact reset time.', 'warn');
          return;
        }
        timingDesc = 'Exact time: ' + exactTime + ' IST';
      }

      const cuClean = cu.startsWith('https://') ? cu.slice(8) : (cu.startsWith('http://') ? cu.slice(7) : cu);
      const displayPrompt = pr.length > 120 ? (pr.substring(0, 117) + '...') : pr;

      if (runNow) {
        showConfirmDialog({
          title: 'Dispatch Task Now?',
          sub: 'Immediate Headless Browser Execution',
          body: '<div style="display:flex;flex-direction:column;gap:8px;">' +
                  '<div>Send prompt to <strong style="color:' + (acc.color || 'var(--cyan)') + ';">' + escapeHtml(acc.name) + '</strong> immediately?</div>' +
                  '<div style="background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:6px;font-family:var(--mono);font-size:0.75rem;color:var(--text-100);line-height:1.4;">&ldquo;' + escapeHtml(displayPrompt) + '&rdquo;</div>' +
                  '<div style="font-size:0.72rem;color:var(--text-300);word-break:break-all;"><strong>URL:</strong> ' + escapeHtml(cuClean) + '</div>' +
                '</div>',
          iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>',
          iconColor: 'var(--cyan)',
          confirmText: 'Dispatch Now',
          confirmClass: 'btn-modal-ok',
          onConfirm: () => submitQueuedTask(true)
        });
      } else {
        showConfirmDialog({
          title: 'Queue Task for ' + acc.name + '?',
          sub: 'Overnight Task Autopilot',
          body: '<div style="display:flex;flex-direction:column;gap:8px;">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;"><span>Account:</span><strong style="color:' + (acc.color || 'var(--cyan)') + ';">' + escapeHtml(acc.name) + '</strong></div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;"><span>Timing:</span><strong style="color:var(--cyan);font-family:var(--mono);">' + escapeHtml(timingDesc) + '</strong></div>' +
                  '<div style="margin-top:2px;background:rgba(0,0,0,0.3);padding:8px 10px;border-radius:6px;font-family:var(--mono);font-size:0.75rem;color:var(--text-100);line-height:1.4;">&ldquo;' + escapeHtml(displayPrompt) + '&rdquo;</div>' +
                  '<div style="font-size:0.72rem;color:var(--text-300);word-break:break-all;"><strong>URL:</strong> ' + escapeHtml(cuClean) + '</div>' +
                '</div>',
          iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
          iconColor: 'var(--cyan)',
          confirmText: 'Confirm & Queue',
          confirmClass: 'btn-modal-ok',
          onConfirm: () => submitQueuedTask(false)
        });
      }
    }

    async function submitQueuedTask(runNow) {
      const sel = document.getElementById('queueAccountSelect'), ci = document.getElementById('queueChatUrl'), pi = document.getElementById('queuePrompt');
      const bq = document.getElementById('btnQueueTask'), bn = document.getElementById('btnQueueNow');
      const tq = document.getElementById('btnQueueText'), tn = document.getElementById('btnQueueNowText');
      const aid = sel ? parseInt(sel.value, 10) : 1;
      const cu = ci ? ci.value.trim() : '', pr = pi ? pi.value.trim() : '';

      if (!pr) {
        showToast('Write the instruction to send to Claude.', 'warn');
        if (pi) pi.focus();
        return;
      }

      if (!cu) {
        showToast('Please paste your Claude Chat URL first!', 'warn');
        if (ci) ci.focus();
        return;
      }
      if (!cu.includes('claude.ai') && !cu.match(/^[a-zA-Z0-9_-]{8,}$/)) {
        showToast('Please enter a valid Claude conversation URL.', 'warn');
        if (ci) ci.focus();
        return;
      }

      const payload = {
        accountId: aid,
        chatUrl: cu,
        prompt: pr,
        targetType: selectedTimingMode
      };

      if (selectedTimingMode === 'slot') {
        const slotEl = document.getElementById('queueSlotSelect');
        if (slotEl && slotEl.value) {
          payload.targetSlot = parseInt(slotEl.value, 10);
          const selOpt = slotEl.options[slotEl.selectedIndex];
          payload.targetSlotDisplay = selOpt ? selOpt.dataset.display : ('Slot ' + payload.targetSlot);
        }
      } else if (selectedTimingMode === 'time') {
        const exactTime = getExact12hTime();
        if (!exactTime) {
          showToast('Choose an exact reset time.', 'warn');
          return;
        }
        payload.targetTime = exactTime;
      }

      if (bq) bq.disabled = true;
      if (bn) bn.disabled = true;
      const ot = runNow ? (tn ? tn.innerText : '') : (tq ? tq.innerText : '');
      if (runNow && tn) tn.innerText = 'Dispatching...';
      if (!runNow && tq) tq.innerText = 'Queueing...';

      const acc = ACCOUNTS.find(a => a.id === aid) || { name: 'Account ' + aid };
      addConsoleLog('Queueing for ' + acc.name + '...', 'info');

      try {
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          addConsoleLog('Queued for ' + acc.name + ': "' + pr + '"', 'ok');
          showToast('Task successfully queued for ' + acc.name, 'ok');
          if (ci) ci.value = '';
          const b = document.getElementById('urlVerifyBadge'); if (b) { b.className = 'verify-badge idle'; b.innerText = 'Awaiting URL'; }
          const pc = document.getElementById('urlPreviewCard'); if (pc) pc.style.display = 'none';
          await fetchQueueTasks();
          if (runNow && data.task && data.task.id) {
            addConsoleLog('Executing queued task for ' + acc.name + ' now...', 'info');
            dispatchSingleTask(data.task.id, aid);
          }
        } else {
          addConsoleLog('Queue Error: ' + (data.error || 'Failed'), 'err');
          showToast('Could not queue: ' + (data.error || 'Unknown error'), 'err');
        }
      } catch (err) {
        addConsoleLog('Network Error: ' + err.message, 'err');
        showToast('Network error: ' + err.message, 'err');
      } finally {
        updateQueueActionButtons();
        if (runNow && tn) tn.innerText = ot || 'Dispatch Now';
        if (!runNow && tq) updateQueueButtonLabels();
      }
    }

    function confirmDispatchSingleTask(taskId, aid) {
      const acc = ACCOUNTS.find(a => a.id === aid) || { name: 'Account ' + aid, color: 'var(--cyan)' };
      showConfirmDialog({
        title: 'Run Queued Task Now?',
        sub: 'Manual Immediate Execution',
        body: 'Execute this queued autopilot prompt right now on <strong style="color:' + (acc.color || 'var(--cyan)') + ';">' + escapeHtml(acc.name) + '</strong>?',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>',
        iconColor: 'var(--cyan)',
        confirmText: 'Run Now',
        confirmClass: 'btn-modal-ok',
        onConfirm: () => dispatchSingleTask(taskId, aid)
      });
    }

    async function dispatchSingleTask(taskId, aid) {
      const acc = ACCOUNTS.find(a => a.id === aid) || { name: 'Account ' + aid };
      addConsoleLog('Dispatching task for ' + acc.name + ' now...', 'info');
      showToast('Dispatching task for ' + acc.name + '...', 'info');
      try {
        const res = await fetch('/api/queue/dispatch?taskId=' + encodeURIComponent(taskId) + '&accountId=' + aid, { method: 'POST' });
        const data = await res.json();
        if (data.result && data.result.success) {
          showToast('Task completed for ' + acc.name, 'ok');
          addConsoleLog('Success: ' + acc.name + ' ➔ ' + (data.result.pageTitle || 'Completed'), 'ok');
        } else {
          showToast('Task failed: ' + (data.result?.stepError || data.result?.error || 'Failed'), 'err');
          addConsoleLog('Failed: ' + acc.name + ' ➔ ' + (data.result?.stepError || 'Error'), 'err');
        }
        await fetchQueueTasks();
      } catch (e) {
        showToast('Dispatch error: ' + e.message, 'err');
      }
    }

    function confirmCancelTask(aid, taskId) {
      const acc = ACCOUNTS.find(a => a.id === aid) || { name: 'Account ' + aid, color: 'var(--cyan)' };
      showConfirmDialog({
        title: 'Cancel Queued Task?',
        sub: 'Task Queue Cancellation',
        body: 'Cancel this queued task for <strong style="color:' + (acc.color || 'var(--cyan)') + ';">' + escapeHtml(acc.name) + '</strong>? This will disarm its edge alarm trigger.',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
        iconColor: 'var(--red)',
        confirmText: 'Cancel Task',
        confirmClass: 'btn-modal-danger',
        onConfirm: () => cancelQueuedTask(aid, taskId)
      });
    }

    function confirmClearSingleTask(aid, taskId) {
      showConfirmDialog({
        title: 'Remove Task Record?',
        sub: 'Task History Clean',
        body: 'Remove this finished task record from your history?',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
        iconColor: 'var(--red)',
        confirmText: 'Remove',
        confirmClass: 'btn-modal-danger',
        onConfirm: () => cancelQueuedTask(aid, taskId)
      });
    }

    function confirmClearCompleted() {
      showConfirmDialog({
        title: 'Clear Completed History?',
        sub: 'Execution History Clean',
        body: 'Are you sure you want to clear all completed and failed tasks? <strong>Active queued tasks will not be affected.</strong>',
        iconSvg: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
        iconColor: 'var(--red)',
        confirmText: 'Clear History',
        confirmClass: 'btn-modal-danger',
        onConfirm: () => clearCompletedTasks()
      });
    }

    async function clearCompletedTasks() {
      addConsoleLog('Clearing completed tasks history...', 'info');
      showToast('Clearing completed history...', 'info');
      try {
        const res = await fetch('/api/queue?clearCompleted=true', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Cleared ' + (data.clearedCount || 0) + ' completed tasks', 'ok');
          addConsoleLog('Cleared ' + (data.clearedCount || 0) + ' completed tasks from history', 'ok');
        } else {
          showToast('Failed to clear: ' + (data.error || 'Failed'), 'err');
          addConsoleLog('Clear error: ' + (data.error || 'Failed'), 'err');
        }
        await fetchQueueTasks();
      } catch (err) {
        showToast('Clear network error: ' + err.message, 'err');
        addConsoleLog('Clear network error: ' + err.message, 'err');
      }
    }

    async function cancelQueuedTask(aid, taskId) {
      try {
        const url = taskId 
          ? '/api/queue?accountId=' + aid + '&taskId=' + encodeURIComponent(taskId) 
          : '/api/queue?accountId=' + aid;
        const res = await fetch(url, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addConsoleLog('Cancelled task for Account ' + aid, '');
          showToast('Task removed for Account ' + aid, 'info');
          fetchQueueTasks();
        } else {
          addConsoleLog('Error removing: ' + (data.error || 'Failed'), 'err');
          showToast('Failed to cancel task', 'err');
        }
      } catch (err) {
        console.error('Cancel error:', err);
      }
    }

    async function syncAccountsFromEdge() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
            ACCOUNTS = data.accounts.map(a => ({ id: a.id, name: a.name, color: a.themeColor || (a.id === 1 ? '#00e5f0' : a.id === 2 ? '#b07df0' : '#00d68f') }));
            const hs = document.getElementById('headerSub');
            if (hs) hs.innerText = ACCOUNTS.length + (ACCOUNTS.length === 1 ? ' connected account' : ' connected accounts');
            SCHEDULE = generateScheduleForAccounts(ACCOUNTS);
            renderAccountCards(); renderManualControls(); renderTimelineTracks(); renderScheduleList(); populateQueueAccountSelect(); populateQueueSlotSelect(); fetchQueueTasks(); updateQueueActionButtons(); updateUI();
          }
        }
      } catch (e) { console.warn('Sync skipped:', e.message); }
    }

    document.getElementById('confirmModal').addEventListener('click', e => { if (e.target.id === 'confirmModal') closeModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    function updateQueueActionButtons() {
      const ui = document.getElementById('queueChatUrl');
      const clr = document.getElementById('btnClearUrl');
      const bv = document.getElementById('btnVerifyUrl');
      const bq = document.getElementById('btnQueueTask');
      const bn = document.getElementById('btnQueueNow');
      const has = ui ? ui.value.trim().length > 0 : false;
      const promptInput = document.getElementById('queuePrompt');
      const hasPrompt = promptInput ? promptInput.value.trim().length > 0 : false;
      const hasAccounts = ACCOUNTS.length > 0;
      const slotSelect = document.getElementById('queueSlotSelect');
      const hasScheduledTime = selectedTimingMode !== 'slot' || !!(slotSelect && slotSelect.value);

      if (clr) clr.style.display = has ? 'flex' : 'none';
      if (bv) bv.disabled = !has;
      if (bq) bq.disabled = !has || !hasPrompt || !hasScheduledTime || !hasAccounts;
      if (bn) bn.disabled = !has || !hasPrompt || !hasAccounts;
    }

    const urlEl = document.getElementById('queueChatUrl');
    if (urlEl) {
      urlEl.addEventListener('input', () => { updateQueueActionButtons(); clearTimeout(verifyDebounceTimer); verifyDebounceTimer = setTimeout(() => verifyChatUrl(false), 350); });
      urlEl.addEventListener('paste', () => { setTimeout(() => { updateQueueActionButtons(); verifyChatUrl(false); }, 60); });
      urlEl.addEventListener('blur', () => { updateQueueActionButtons(); verifyChatUrl(false); });
    }

    const qSel = document.getElementById('queueAccountSelect');
    if (qSel) { 
      qSel.addEventListener('change', () => { 
        populateQueueSlotSelect();
        updateQueueButtonLabels();
        updateQueueActionButtons();
        updateSmartPresets(true);
        if (urlEl && urlEl.value.trim()) verifyChatUrl(false); 
      }); 
    }
    const qSlotSel = document.getElementById('queueSlotSelect');
    if (qSlotSel) qSlotSel.addEventListener('change', () => { updateQueueButtonLabels(); updateQueueActionButtons(); });
    const promptEl = document.getElementById('queuePrompt');
    if (promptEl) promptEl.addEventListener('input', updateQueueActionButtons);

    // Check clipboard support for quick Paste button
    if (navigator.clipboard && navigator.clipboard.readText) {
      const pb = document.getElementById('btnPasteUrl');
      if (pb) pb.style.display = 'inline-flex';
    }

    // Init
    renderAccountCards();
    renderManualControls();
    renderTimelineTracks();
    renderScheduleList();
    populateQueueAccountSelect();
    populateQueueSlotSelect();
    initChronoDeckWheelEvents();
    onExactTimeChanged();
    const initialHeaderSub = document.getElementById('headerSub');
    if (initialHeaderSub && ACCOUNTS.length > 0) initialHeaderSub.textContent = ACCOUNTS.length + (ACCOUNTS.length === 1 ? ' connected account' : ' connected accounts');
    updateQueueButtonLabels();
    fetchQueueTasks();
    updateQueueActionButtons();
    updateUI();
    setInterval(updateUI, 1000);
    setInterval(fetchQueueTasks, 15000);
    syncAccountsFromEdge();
  </script>
</body>
</html>`;
}
