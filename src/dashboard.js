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
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
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

    /* ===== OVERNIGHT TASK AUTOPILOT FORM ===== */
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
      background: rgba(10, 14, 24, 0.9);
      border: 1px solid rgba(0, 229, 240, 0.2);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      font-size: 0.72rem;
      font-family: var(--mono);
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: fade-in 0.2s ease;
    }

    .url-preview.error { border-color: rgba(240, 72, 72, 0.28); background: rgba(240, 72, 72, 0.05); }

    .url-preview-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      gap: 8px;
    }

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

    /* ===== ACTIVE QUEUED TASKS (Redesigned for flawless UX) ===== */
    .tasks-divider {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border-dim);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.70rem;
      font-weight: 800;
      color: var(--text-300);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .task-count {
      font-family: var(--mono);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      color: var(--text-100);
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
    }

    .lane-label {
      width: 82px;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--mono);
      flex-shrink: 0;
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
      padding-left: 90px;
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
      transition: all var(--transition);
    }

    .sched-item:hover, .sched-item.hl { background: rgba(255,255,255,0.05); border-color: var(--border-hover); }

    .sched-left {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      min-width: 0;
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
    }

    .sched-right {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--text-400);
      white-space: nowrap;
      flex-shrink: 0;
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
      .lane-label { width: 64px; font-size: 0.65rem; }
      .time-axis { padding-left: 72px; }
      .hero-title { font-size: 1.10rem; }
      .task-url-text { max-width: 140px; }
      .sched-right span:not(.sched-badge) { display: none; }
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
    <section class="card">
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

    <!-- OVERNIGHT TASK AUTOPILOT -->
    <section class="card" id="taskQueueSection">
      <div class="card-header">
        <h2 class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Overnight Autopilot
        </h2>
        <span class="card-badge" style="color: var(--cyan);" id="taskQueueStatus">Dynamic Queue</span>
      </div>

      <p class="queue-desc">Queue your conversation link and instruction. When the next 5-hour window opens, Claude Pulse automatically wakes up your chat and continues the work.</p>

      <div class="queue-form">
        <div class="form-group">
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

        <div class="form-group">
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
            <button type="button" class="btn-clear-input" id="btnClearUrl" onclick="clearChatUrlInput()" style="display:none;" title="Clear URL">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="url-bar">
            <span class="form-hint">Paste full link from browser address bar</span>
            <div class="url-btns">
              <button type="button" class="btn-link" id="btnPasteUrl" onclick="pasteFromClipboard()" style="display:none;">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Paste
              </button>
              <button type="button" class="btn-link" id="btnVerifyUrl" onclick="verifyChatUrl(true)" disabled>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Verify
              </button>
            </div>
          </div>
          <div class="url-preview" id="urlPreviewCard" style="display:none;"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="queuePrompt">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            Prompt
          </label>
          <div class="input-wrap">
            <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></div>
            <input type="text" class="form-input" id="queuePrompt" value="continue" placeholder="e.g. continue with section 4" autocomplete="off">
          </div>
          <span class="form-hint">Message sent to Claude when the reset window opens.</span>
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Execution Schedule
          </label>
          <div class="timing-pill-group">
            <button type="button" class="timing-pill-btn active" id="pillTimingNext" onclick="setTimingMode('next')">
              <span>⚡ Next Ping</span>
            </button>
            <button type="button" class="timing-pill-btn" id="pillTimingSlot" onclick="setTimingMode('slot')">
              <span>📅 Target Slot</span>
            </button>
            <button type="button" class="timing-pill-btn" id="pillTimingTime" onclick="setTimingMode('time')">
              <span>🎯 Exact Time</span>
            </button>
          </div>

          <!-- SUB-VIEW: TARGET SPECIFIC SLOT -->
          <div id="timingSlotWrap" style="display:none;margin-top:8px;">
            <div class="select-wrap">
              <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
              <select class="form-select" id="queueSlotSelect"></select>
              <div class="chevron"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></div>
            </div>
            <span class="form-hint" style="margin-top:4px;">Earlier keep-alives will run normally without using this task.</span>
          </div>

          <!-- SUB-VIEW: EXACT RESET TIME -->
          <div id="timingExactWrap" style="display:none;margin-top:8px;">
            <div class="input-wrap">
              <div class="left-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
              <input type="text" class="form-input" id="queueExactTime" placeholder="e.g. 03:42 AM" autocomplete="off">
              <button type="button" class="btn-clear-input" id="btnPasteNotice" onclick="pasteAndParseNotice()" title="Paste Claude rate limit notice" style="display:flex;width:auto;padding:0 8px;font-size:0.65rem;color:var(--cyan);background:rgba(0,229,240,0.08);border-radius:4px;gap:4px;right:6px;">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <span>Paste Notice</span>
              </button>
            </div>
            <span class="form-hint" style="margin-top:4px;">Runs at exact IST reset time (swept by edge & Android exact alarm).</span>
          </div>
        </div>

        <div class="queue-btns">
          <button class="btn-queue-primary" id="btnQueueTask" onclick="submitQueuedTask(false)" disabled>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span id="btnQueueText">Queue for Reset</span>
          </button>
          <button class="btn-queue-secondary" id="btnQueueNow" onclick="submitQueuedTask(true)" disabled>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
            <span id="btnQueueNowText">Dispatch Now</span>
          </button>
        </div>
      </div>

      <div class="tasks-divider">
        <div class="tasks-header">
          <span>Active Queued Tasks</span>
          <span class="task-count" id="taskCountBadge">0</span>
        </div>
        <div class="tasks-list" id="activeTasksList"></div>
      </div>
    </section>

    <!-- 24H SCHEDULE -->
    <section class="card">
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
        <div style="font-family:var(--mono);color:var(--text-200);font-size:0.68rem;" id="bubbleDiff">Tracking active</div>
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
      else { const mid = Math.floor(accounts.length / 2); cohortA = accounts.slice(0, mid); cohortB = accounts.slice(mid); }
      const items = [];
      fixedSlots.forEach(s => {
        const cohort = (s.slot % 2 !== 0) ? cohortA : cohortB;
        cohort.forEach(acc => {
          items.push({ id: 'ping-' + s.slot + '-' + acc.id, account: acc.id, name: acc.name, hour: s.hour, min: s.min, minsOfDay: s.minsOfDay, display: s.display, tag: s.tag });
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

    function getNowIST() { return new Date(Date.now() + 5.5 * 3600000); }

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

    function fmtTime(d) { return d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }); }

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
      const nowIST = getNowIST();
      const csd = nowIST.getHours() * 3600 + nowIST.getMinutes() * 60 + nowIST.getSeconds();
      const cmd = csd / 60;
      const WDS = WINDOW_DURATION_MINS * 60;

      if (!ACCOUNTS || ACCOUNTS.length === 0) {
        return { nowIST, currentMinsOfDay: cmd, accountStates: [], recommendedAcc: null, reason: 'No accounts detected', isStandby: true };
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
      return { nowIST, currentMinsOfDay: cmd, accountStates: states, recommendedAcc: rec, reason, isStandby: standby };
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
        document.getElementById('bubbleDiff').innerText = 'Tracking: ' + d.recommendedAcc.name;
      }
    }

    function inspectScheduleItem(item) {
      selectedScheduleItem = item;
      const nowIST = getNowIST();
      const csd = nowIST.getHours() * 3600 + nowIST.getMinutes() * 60 + nowIST.getSeconds();
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
      const modal = document.getElementById('confirmModal');
      document.getElementById('modalTitle').innerText = 'Ping ' + label + '?';
      document.getElementById('modalBody').innerHTML = 'Sends a 1-character keep-alive (<code style="color:#fff;font-family:var(--mono);padding:2px 5px;background:rgba(255,255,255,0.06);border-radius:4px;">.</code>) via Browserless to refresh your 5-hour limit window.';
      const btn = document.getElementById('modalConfirmBtn');
      btn.className = 'btn-modal btn-modal-ok'; btn.innerText = 'Send Ping';
      btn.onclick = () => { closeModal(); triggerPing(target); };
      modal.classList.add('open');
    }

    function openLaunchDialog(accNum, accName) {
      if (!accName) { const f = ACCOUNTS.find(a => a.id === accNum); accName = f ? f.name : 'Account ' + accNum; }
      const modal = document.getElementById('confirmModal');
      document.getElementById('modalTitle').innerText = 'Open Claude as ' + accName;
      document.getElementById('modalBody').innerHTML = 'Make sure your browser is signed into <strong style="color:var(--cyan);">' + escapeHtml(accName) + '</strong> before continuing.';
      const btn = document.getElementById('modalConfirmBtn');
      btn.className = 'btn-modal btn-modal-ok'; btn.innerText = 'Open Claude.ai';
      btn.onclick = () => { closeModal(); window.open('https://claude.ai', '_blank', 'noopener,noreferrer'); };
      modal.classList.add('open');
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
          badge.innerHTML = '<svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Verified';
          if (preview) {
            preview.className = 'url-preview'; preview.style.display = 'flex';
            const sid = data.chatId ? data.chatId.substring(0, 14) + '...' : 'OK';
            preview.innerHTML =
              '<div class="url-preview-head"><span style="color:var(--green);display:flex;align-items:center;gap:5px;"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + escapeHtml(data.chatType) + '</span><span style="color:var(--text-400);font-size:0.62rem;">ID: ' + escapeHtml(sid) + '</span></div>' +
              '<div class="url-preview-row"><span style="color:var(--text-400);">Target:</span><a href="' + escapeHtml(data.fullUrl || v) + '" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtml(data.normalizedUrl) + '</a></div>' +
              '<div style="font-size:0.62rem;color:var(--text-400);margin-top:1px;">Ready for ' + escapeHtml(data.targetAccount || 'Claude') + '.</div>';
          }
          if (interactive) {
            addConsoleLog('URL Verified: ' + data.chatType, 'ok');
            showToast('URL Verified: ' + data.chatType, 'ok');
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
        badge.className = 'verify-badge warning'; badge.innerText = 'Format OK';
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

      const slotWrap = document.getElementById('timingSlotWrap');
      const timeWrap = document.getElementById('timingExactWrap');
      if (slotWrap) slotWrap.style.display = mode === 'slot' ? 'block' : 'none';
      if (timeWrap) timeWrap.style.display = mode === 'time' ? 'block' : 'none';

      if (mode === 'slot') populateQueueSlotSelect();
    }

    function populateQueueSlotSelect() {
      const sel = document.getElementById('queueSlotSelect');
      const accSel = document.getElementById('queueAccountSelect');
      if (!sel) return;
      const targetAccId = accSel ? parseInt(accSel.value, 10) : 1;
      const accSchedule = SCHEDULE.filter(s => s.account === targetAccId);
      sel.innerHTML = '';
      (accSchedule.length > 0 ? accSchedule : SCHEDULE).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.slot;
        opt.dataset.display = s.display + ' (' + s.tag + ')';
        opt.innerText = 'Slot ' + s.slot + ' \u2022 ' + s.display + ' (' + s.tag + ')';
        sel.appendChild(opt);
      });
    }

    async function pasteAndParseNotice() {
      try {
        let text = '';
        if (navigator.clipboard && navigator.clipboard.readText) {
          text = await navigator.clipboard.readText();
        }
        if (!text) {
          text = prompt('Paste Claude rate limit notice text (e.g. "You are out of messages until 3:42 AM"):');
        }
        if (text) {
          const res = await fetch('/api/queue/parse-notice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          const data = await res.json();
          if (data.success && data.parsedTime) {
            setTimingMode('time');
            const timeInp = document.getElementById('queueExactTime');
            if (timeInp) timeInp.value = data.parsedTime;
            showToast('Extracted reset time: ' + data.parsedTime, 'ok');
            addConsoleLog('Extracted time from notice: ' + data.parsedTime, 'ok');
          } else {
            showToast('Could not extract reset time from text', 'warn');
          }
        }
      } catch (err) {
        showToast('Error parsing notice: ' + err.message, 'err');
      }
    }

    async function fetchQueueTasks() {
      const c = document.getElementById('activeTasksList'), cb = document.getElementById('taskCountBadge');
      if (!c) return;
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

        if (cb) cb.innerText = String(allItems.length);
        if (allItems.length === 0) {
          c.innerHTML = '<div class="empty-state"><svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>No tasks queued. Enter a Claude chat link and prompt above to automate your reset.</span></div>';
          return;
        }

        // Sort: queued first, then by queued timestamp desc
        allItems.sort((a, b) => {
          if (a.status === 'queued' && b.status !== 'queued') return -1;
          if (a.status !== 'queued' && b.status === 'queued') return 1;
          return (b.queuedAtTimestamp || 0) - (a.queuedAtTimestamp || 0);
        });

        c.innerHTML = '';
        allItems.forEach(task => {
          const acc = ACCOUNTS.find(a => a.id === task.accountId) || { name: task.accountName || ('Account ' + task.accountId), color: '#00e5f0' };
          const el = document.createElement('div');
          el.className = 'task-card ' + (task.status || 'queued');

          let sb = '<span class="task-status queued"><span style="width:6px;height:6px;border-radius:50%;background:var(--cyan);display:inline-block;box-shadow:0 0 5px var(--cyan);"></span>Queued</span>';
          if (task.status === 'completed') sb = '<span class="task-status completed"><span style="width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;"></span>Done</span>';
          if (task.status === 'failed') sb = '<span class="task-status failed"><span style="width:6px;height:6px;border-radius:50%;background:var(--red);display:inline-block;"></span>Failed</span>';

          // Target badge
          let tb = '<span class="target-badge"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Next Ping</span>';
          if (task.targetType === 'slot') {
            tb = '<span class="target-badge slot"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' + escapeHtml(task.targetSlotDisplay || ('Slot ' + task.targetSlot)) + '</span>';
          } else if (task.targetType === 'time') {
            tb = '<span class="target-badge time"><svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + escapeHtml(task.targetTime || 'Exact Time') + '</span>';
          }

          let tt = 'Fires on next scheduled reset ping';
          if (task.targetType === 'slot') tt = 'Scheduled for ' + (task.targetSlotDisplay || ('Slot ' + task.targetSlot));
          else if (task.targetType === 'time') tt = 'Scheduled for exact reset at ' + (task.targetTime || 'custom time');
          if (task.status === 'completed') tt = 'Finished ' + (task.completedAt ? new Date(task.completedAt).toLocaleTimeString('en-US') : 'recently');
          if (task.status === 'failed') tt = 'Error: ' + escapeHtml(task.error || 'Execution failed');

          const actionBtns = task.status === 'queued'
            ? '<div style="display:flex;align-items:center;gap:6px;">' +
                '<button class="btn-dispatch-task" onclick="dispatchSingleTask(\'' + task.id + '\', ' + task.accountId + ')" title="Execute this prompt immediately"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Run Now</button>' +
                '<button class="btn-cancel-task" onclick="cancelQueuedTask(' + task.accountId + ', \'' + task.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>Cancel</button>' +
              '</div>'
            : '<button class="btn-cancel-task" onclick="cancelQueuedTask(' + task.accountId + ', \'' + task.id + '\')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Clear</button>';

          const su = (task.chatUrl && (task.chatUrl.startsWith('http://') || task.chatUrl.startsWith('https://'))) ? escapeHtml(task.chatUrl) : '#';
          const suClean = su.replace(/^https?:\\/\\//i, '');

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
          c.appendChild(el);
        });
      } catch (e) { console.warn('Queue fetch skipped:', e.message); }
    }

    async function submitQueuedTask(runNow) {
      const sel = document.getElementById('queueAccountSelect'), ci = document.getElementById('queueChatUrl'), pi = document.getElementById('queuePrompt');
      const bq = document.getElementById('btnQueueTask'), bn = document.getElementById('btnQueueNow');
      const tq = document.getElementById('btnQueueText'), tn = document.getElementById('btnQueueNowText');
      const aid = sel ? parseInt(sel.value, 10) : 1;
      const cu = ci ? ci.value.trim() : '', pr = pi ? pi.value.trim() : 'continue';

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
        const timeInp = document.getElementById('queueExactTime');
        const rawTime = timeInp ? timeInp.value.trim() : '';
        if (!rawTime) {
          showToast('Please enter an exact reset time (e.g. 03:42 AM)!', 'warn');
          if (timeInp) timeInp.focus();
          return;
        }
        payload.targetTime = rawTime;
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
        if (!runNow && tq) tq.innerText = ot || 'Queue for Reset';
      }
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
            if (hs) hs.innerText = ACCOUNTS.map(a => a.name).join(' \u2022 ');
            const ft = document.getElementById('footerText');
            if (ft) ft.innerText = 'Claude Pulse \u2022 ' + ACCOUNTS.map(a => a.name).join(' & ') + ' Autopilot';
            SCHEDULE = generateScheduleForAccounts(ACCOUNTS);
            renderAccountCards(); renderManualControls(); renderTimelineTracks(); renderScheduleList(); populateQueueAccountSelect(); fetchQueueTasks(); updateUI();
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

      if (clr) clr.style.display = has ? 'flex' : 'none';
      if (bv) bv.disabled = !has;
      if (bq) bq.disabled = !has;
      if (bn) bn.disabled = !has;
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
        if (urlEl && urlEl.value.trim()) verifyChatUrl(false); 
      }); 
    }

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
