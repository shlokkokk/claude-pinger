export function renderDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Claude Pulse</title>
  <meta name="description" content="Real-time intelligent rate-limit autopilot and account switcher for Claude.">
  <meta name="theme-color" content="#07080c">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Claude Pulse">
  <link rel="manifest" href="/manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #07080c;
      --bg-surface: #0e1118;
      --bg-card: rgba(14, 18, 26, 0.8);
      --bg-card-hover: rgba(22, 28, 40, 0.95);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(255, 255, 255, 0.2);
      
      --acc1-cyan: #00f2fe;
      --acc1-blue: #38bdf8;
      
      --acc2-purple: #c084fc;
      --acc2-indigo: #a855f7;

      --success-green: #10b981;
      --mint-green: #34d399;
      --warning-amber: #f59e0b;
      --danger-red: #ef4444;

      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;

      --font-main: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: max(28px, env(safe-area-inset-top, 28px)) 12px max(32px, env(safe-area-inset-bottom, 32px));
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .app-container {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0 auto;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 2px 8px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: #111520;
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-icon-box svg {
      width: 20px;
      height: 20px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
      line-height: 1.15;
    }

    .brand-text p {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .live-clock-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #10141f;
      border: 1px solid var(--border-subtle);
      padding: 5px 10px;
      border-radius: 20px;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success-green);
      border-radius: 50%;
      box-shadow: 0 0 6px var(--success-green);
      animation: blink 2s infinite ease-in-out;
      flex-shrink: 0;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.85); }
    }

    /* MODE SELECTOR (PILL SWITCHER) */
    .mode-switch-wrapper {
      display: flex;
      background: #0d1017;
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 3px;
      gap: 3px;
    }

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 6px;
      border-radius: 10px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .mode-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    .mode-btn.active.quick-mode {
      background: rgba(16, 185, 129, 0.12);
      color: var(--mint-green);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .mode-btn.active.deep-mode {
      background: rgba(0, 242, 254, 0.12);
      color: var(--acc1-cyan);
      border: 1px solid rgba(0, 242, 254, 0.3);
    }

    /* HERO RECOMMENDATION CARD */
    .hero-recommendation {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      padding: 16px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .hero-recommendation::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--acc1-cyan), var(--acc2-purple));
    }

    .rec-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }

    .rec-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 8px;
      background: rgba(0, 242, 254, 0.1);
      color: var(--acc1-cyan);
      border: 1px solid rgba(0, 242, 254, 0.25);
      white-space: nowrap;
      flex-shrink: 0;
    }


    .rec-next-reset-text {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      white-space: nowrap;
      text-align: right;
    }

    .hero-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
      line-height: 1.2;
    }

    .hero-reason {
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 4px;
    }

    .launch-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 800;
      color: #ffffff;
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.14) 0%, rgba(56, 189, 248, 0.06) 100%);
      border: 1px solid rgba(0, 242, 254, 0.35);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 14px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .launch-cta:active {
      transform: scale(0.98);
      filter: brightness(0.95);
    }

    .launch-cta svg { width: 15px; height: 15px; flex-shrink: 0; }

    /* DUAL ACCOUNT TELEMETRY GRID (STRICT EQUAL 50/50 ON ALL SCREENS) */
    .accounts-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 8px;
      width: 100%;
    }

    .account-card {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
      min-width: 0;
      overflow: hidden;
    }

    .account-card.acc1-theme { border-top: 2.5px solid var(--acc1-cyan); }
    .account-card.acc2-theme { border-top: 2.5px solid var(--acc2-purple); }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .acc-tag {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .acc1-theme .acc-tag { color: var(--acc1-cyan); }
    .acc2-theme .acc-tag { color: var(--acc2-purple); }

    .acc-status-tag {
      font-size: 0.62rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 5px;
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .acc-status-tag.active {
      background: rgba(16, 185, 129, 0.12);
      color: var(--success-green);
    }

    .acc-status-tag.warning {
      background: rgba(245, 158, 11, 0.12);
      color: var(--warning-amber);
    }

    .ring-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-circle {
      position: relative;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }

    .progress-circle > svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-circle circle {
      fill: none;
      stroke-width: 5.5;
      stroke-linecap: round;
    }

    .progress-bg { stroke: rgba(255, 255, 255, 0.06); }
    .progress-bar-acc1 { stroke: var(--acc1-cyan); transition: stroke-dashoffset 0.8s ease; }
    .progress-bar-acc2 { stroke: var(--acc2-purple); transition: stroke-dashoffset 0.8s ease; }

    .ring-center-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .ring-center-icon svg {
      width: 18px;
      height: 18px;
      transform: none !important;
    }

    .acc1-theme .ring-center-icon svg { color: var(--acc1-cyan); }
    .acc2-theme .ring-center-icon svg { color: var(--acc2-purple); }

    .ring-meta {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .ring-meta-val {
      font-size: 0.88rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--text-primary);
      white-space: nowrap;
    }

    .ring-meta-sub {
      font-size: 0.66rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 7px 6px;
      border-radius: 9px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--border-focus);
    }

    .btn-secondary svg { width: 12px; height: 12px; flex-shrink: 0; }

    /* SECTION CARD BASE */
    .section-card {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-head h2 {
      font-size: 0.88rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .section-head h2 svg { width: 15px; height: 15px; color: var(--acc1-blue); flex-shrink: 0; }

    /* COMMAND CONSOLE & DIAGNOSTICS */
    .health-bar-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      font-size: 0.74rem;
      gap: 8px;
    }

    .health-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--success-green);
      white-space: nowrap;
    }

    .btn-diagnostic-check {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }

    .btn-diagnostic-check:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-focus);
    }

    .btn-diagnostic-check svg { width: 12px; height: 12px; }

    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
    }

    .btn-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 10px 4px;
      min-height: 74px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-action:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: var(--border-focus);
    }

    .btn-action:active { transform: scale(0.97); }

    .btn-action-icon-pill {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 3px;
    }

    .btn-ping-acc1 .btn-action-icon-pill { background: rgba(0, 242, 254, 0.12); color: var(--acc1-cyan); }
    .btn-ping-acc2 .btn-action-icon-pill { background: rgba(192, 132, 252, 0.12); color: var(--acc2-purple); }
    .btn-ping-all .btn-action-icon-pill { background: rgba(255, 255, 255, 0.08); color: #fff; }

    .btn-action-title {
      font-size: 0.74rem;
      font-weight: 800;
      white-space: nowrap;
      margin-bottom: 1px;
    }

    .btn-ping-acc1 .btn-action-title { color: var(--acc1-cyan); }
    .btn-ping-acc2 .btn-action-title { color: var(--acc2-purple); }
    .btn-ping-all .btn-action-title { color: #fff; }

    .btn-action-sub {
      font-size: 0.64rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-weight: 500;
      white-space: nowrap;
    }

    .btn-action svg { width: 13px; height: 13px; }

    .console-drawer {
      background: #07090f;
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 10px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: #94a3b8;
      max-height: 110px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .log-line {
      display: flex;
      align-items: baseline;
      gap: 6px;
      word-break: normal;
      overflow-wrap: break-word;
      line-height: 1.4;
    }

    .log-time { color: var(--text-muted); flex-shrink: 0; }
    .log-msg { color: #e2e8f0; }
    .log-msg.success { color: var(--success-green); }
    .log-msg.info { color: var(--acc1-cyan); }
    .log-msg.error { color: var(--danger-red); }

    /* OVERNIGHT TASK AUTOPILOT */
    .queue-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .queue-row {
      display: flex;
      gap: 8px;
    }

    .queue-select, .queue-input {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 8px 10px;
      font-size: 0.76rem;
      font-family: var(--font-mono);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .queue-select {
      font-family: var(--font-main);
      font-weight: 600;
      min-width: 130px;
      background: #0f131c;
      cursor: pointer;
    }

    .queue-select:focus, .queue-input:focus {
      border-color: var(--acc1-cyan);
    }

    .queue-input {
      flex: 1;
    }

    .queue-btn-row {
      display: flex;
      gap: 8px;
      margin-top: 2px;
    }

    .btn-queue {
      flex: 1;
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid rgba(0, 242, 254, 0.35);
      color: var(--acc1-cyan);
      padding: 9px 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.76rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .btn-queue:hover {
      background: rgba(0, 242, 254, 0.2);
      border-color: var(--acc1-cyan);
    }

    .btn-queue-now {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 9px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.74rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-queue-now:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
    }

    .active-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 6px;
    }

    .task-item-card {
      background: rgba(0, 242, 254, 0.04);
      border: 1px solid rgba(0, 242, 254, 0.2);
      border-radius: 9px;
      padding: 9px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.74rem;
    }

    .task-item-card.completed {
      background: rgba(16, 185, 129, 0.04);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .task-item-card.failed {
      background: rgba(239, 68, 68, 0.04);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .task-badge {
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 0.64rem;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .task-badge.queued { background: rgba(0, 242, 254, 0.15); color: var(--acc1-cyan); }
    .task-badge.completed { background: rgba(16, 185, 129, 0.15); color: var(--success-green); }
    .task-badge.failed { background: rgba(239, 68, 68, 0.15); color: var(--danger-red); }

    .task-cancel-btn {
      background: none;
      border: none;
      color: var(--danger-red);
      font-size: 0.68rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }

    /* DUAL-LANE 24H MASTER TIMELINE */
    .timeline-inspect-bubble {
      background: #131722;
      border: 1px solid var(--border-focus);
      border-radius: 10px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.74rem;
    }

    .inspect-acc-pill {
      font-weight: 800;
      font-size: 0.68rem;
      padding: 2px 6px;
      border-radius: 5px;
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .inspect-acc-pill.acc1 { background: rgba(0, 242, 254, 0.15); color: var(--acc1-cyan); }
    .inspect-acc-pill.acc2 { background: rgba(192, 132, 252, 0.15); color: var(--acc2-purple); }
    .inspect-acc-pill.now { background: rgba(255, 255, 255, 0.12); color: #fff; }

    .dual-lane-timeline {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0 2px;
    }

    .timeline-lane-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lane-label {
      width: 82px;
      font-size: 0.72rem;
      font-weight: 800;
      font-family: var(--font-mono);
      flex-shrink: 0;
      white-space: nowrap;
    }

    .lane-label.acc1-label { color: var(--acc1-cyan); }
    .lane-label.acc2-label { color: var(--acc2-purple); }

    .lane-track {
      flex: 1;
      height: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      position: relative;
      overflow: visible;
      cursor: pointer;
    }

    .lane-band {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 6px;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .lane-band.acc1 {
      background: rgba(0, 242, 254, 0.18);
      border: 1px solid rgba(0, 242, 254, 0.3);
    }

    .lane-band.acc2 {
      background: rgba(192, 132, 252, 0.18);
      border: 1px solid rgba(192, 132, 252, 0.3);
    }

    .lane-band.active {
      background: rgba(0, 242, 254, 0.32);
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.3);
    }

    .lane-band.acc2.active {
      background: rgba(192, 132, 252, 0.32);
      box-shadow: 0 0 10px rgba(192, 132, 252, 0.3);
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
      transition: all 0.18s ease;
      z-index: 5;
    }

    .lane-node.acc1 {
      background-color: var(--acc1-cyan);
      box-shadow: 0 0 7px rgba(0, 242, 254, 0.7);
    }
    .lane-node.acc2 {
      background-color: var(--acc2-purple);
      box-shadow: 0 0 7px rgba(192, 132, 252, 0.7);
    }

    .lane-node:hover, .lane-node:active, .lane-node.selected {
      transform: translate(-50%, -50%) scale(1.35);
      border-color: #fff;
      z-index: 20;
    }

    .lane-node.acc1:hover, .lane-node.acc1:active, .lane-node.acc1.selected {
      box-shadow: 0 0 14px var(--acc1-cyan), 0 0 20px rgba(0, 242, 254, 0.5);
    }

    .lane-node.acc2:hover, .lane-node.acc2:active, .lane-node.acc2.selected {
      box-shadow: 0 0 14px var(--acc2-purple), 0 0 20px rgba(192, 132, 252, 0.5);
    }

    .timeline-now-cursor-lane {
      position: absolute;
      top: -3px;
      bottom: -3px;
      width: 2px;
      background-color: #ffffff;
      box-shadow: 0 0 7px #ffffff, 0 0 14px rgba(255, 255, 255, 0.6);
      z-index: 10;
      cursor: pointer;
    }

    .timeline-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.66rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-top: 2px;
      padding-left: 90px;
    }

    /* SCHEDULE MATRIX LIST */
    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .schedule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid var(--border-subtle);
      border-radius: 11px;
      font-size: 0.78rem;
      cursor: pointer;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .schedule-item:hover, .schedule-item.highlighted {
      background: rgba(255, 255, 255, 0.06);
      border-color: var(--border-focus);
    }

    .schedule-item.highlighted.acc1-item { border-color: rgba(0, 242, 254, 0.5); }
    .schedule-item.highlighted.acc2-item { border-color: rgba(192, 132, 252, 0.5); }

    .schedule-left {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      min-width: 0;
    }

    .schedule-acc-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .schedule-acc-dot.acc1 { background-color: var(--acc1-cyan); }
    .schedule-acc-dot.acc2 { background-color: var(--acc2-purple); }

    .schedule-time {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #fff;
      font-size: 0.78rem;
    }

    .schedule-name-tag {
      font-size: 0.72rem;
      font-weight: 700;
      margin-left: 3px;
    }

    .schedule-name-tag.acc1-name { color: var(--acc1-cyan); }
    .schedule-name-tag.acc2-name { color: var(--acc2-purple); }

    .schedule-right {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }

    .safe-buffer-badge {
      font-size: 0.62rem;
      padding: 1px 5px;
      border-radius: 5px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success-green);
      font-family: var(--font-mono);
      font-weight: 700;
      flex-shrink: 0;
    }

    /* CONFIRMATION MODAL */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }

    .modal-overlay.open { opacity: 1; visibility: visible; }

    .modal-box {
      background: #0f131c;
      border: 1px solid var(--border-focus);
      border-radius: 18px;
      padding: 18px;
      width: 100%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      transform: scale(0.96);
      transition: transform 0.2s ease;
    }

    .modal-overlay.open .modal-box { transform: scale(1); }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .modal-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--acc1-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon svg { width: 18px; height: 18px; }

    .modal-title h3 { font-size: 1rem; font-weight: 800; color: #fff; }
    .modal-title p { font-size: 0.72rem; color: var(--text-muted); }

    .modal-body {
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.45;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 10px;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 2px;
    }

    .btn-modal {
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .btn-modal-cancel {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .btn-modal-confirm {
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.16) 0%, rgba(56, 189, 248, 0.08) 100%);
      border: 1px solid rgba(0, 242, 254, 0.4);
      color: #ffffff;
      font-weight: 800;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }

    .btn-modal-confirm.acc2-confirm {
      background: linear-gradient(135deg, rgba(192, 132, 252, 0.16) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid rgba(192, 132, 252, 0.4);
      color: #ffffff;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }

    /* FOOTER */
    .footer {
      text-align: center;
      font-size: 0.7rem;
      color: var(--text-muted);
      padding: 8px 0;
    }
  </style>
</head>
<body>

  <div class="app-container">

    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <div class="brand-icon-box">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orbitCyan" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00f2fe" />
                <stop offset="1" stop-color="#38bdf8" />
              </linearGradient>
              <linearGradient id="orbitPurple" x1="28" y1="4" x2="4" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#c084fc" />
                <stop offset="1" stop-color="#818cf8" />
              </linearGradient>
            </defs>
            <path d="M16 4C9.37 4 4 9.37 4 16C4 18.5 4.8 20.8 6.1 22.7" stroke="url(#orbitCyan)" stroke-width="2.6" stroke-linecap="round" />
            <path d="M16 28C22.63 28 28 22.63 28 16C28 13.5 27.2 11.2 25.9 9.3" stroke="url(#orbitPurple)" stroke-width="2.6" stroke-linecap="round" />
            <path d="M17.5 7.5L9.5 16.5H16.5L14.5 24.5L22.5 15.5H15.5L17.5 7.5Z" fill="#ffffff" />
          </svg>
        </div>
        <div class="brand-text">
          <h1>Claude Pulse</h1>
          <p id="headerSub">Autopilot Active</p>
        </div>
      </div>
      <div class="header-right">
        <div class="live-clock-pill">
          <div class="pulse-dot"></div>
          <span id="headerClock">--:--:--</span>
        </div>
      </div>
    </header>

    <!-- TASK INTENT SWITCHER -->
    <div class="mode-switch-wrapper">
      <button class="mode-btn active quick-mode" id="modeQuick" onclick="setTaskMode('quick')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Quick Query</span>
      </button>
      <button class="mode-btn" id="modeDeep" onclick="setTaskMode('deep')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <span>Deep Work</span>
      </button>
    </div>

    <!-- HERO RECOMMENDATION -->
    <section class="hero-recommendation" id="heroCard">
      <div class="rec-top-row">
        <div class="rec-badge" id="recBadge">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <span id="recBadgeText">Calculating...</span>
        </div>
        <div class="rec-next-reset-text" id="recNextReset">
          Next reset: --
        </div>
      </div>
      <h2 class="hero-title" id="heroTitle">Analyzing Schedules...</h2>
      <p class="hero-reason" id="heroReason">Loading live rate-limit telemetry...</p>
      
      <button class="launch-cta" id="heroCta" onclick="openLaunchDialog(recommendedTargetAccount)">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        <span id="heroCtaText">Open Claude</span>
      </button>
    </section>

    <!-- DYNAMIC N-ACCOUNT TELEMETRY GAUGES -->
    <section class="accounts-grid" id="accountsGrid">
      <!-- Rendered Dynamically in JS -->
    </section>

    <!-- MANUAL PING CONTROLS & DIAGNOSTICS -->
    <section class="section-card">
      <div class="section-head">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Manual Ping Controls
        </h2>
        <span style="font-size: 0.7rem; color: var(--success-green); font-family: var(--font-mono);" id="pingStatusText">Ready</span>
      </div>

      <!-- DIAGNOSTIC BAR -->
      <div class="health-bar-row">
        <div class="health-status-badge" id="healthBadge">
          <span class="pulse-dot"></span>
          <span id="healthSummaryText">Cloudflare Online</span>
        </div>
        <button class="btn-diagnostic-check" onclick="runDiagnostics()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Test Wiring
        </button>
      </div>

      <div class="controls-grid" id="controlsGrid">
        <!-- Rendered Dynamically in JS -->
      </div>

      <div class="console-drawer" id="consoleLogs">
        <div class="log-line">
          <span class="log-time">[System]</span>
          <span class="log-msg">Autopilot active on Cloudflare</span>
        </div>
      </div>
    </section>

    <!-- OVERNIGHT TASK AUTOPILOT -->
    <section class="section-card">
      <div class="section-head">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Overnight Task Autopilot
        </h2>
        <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);" id="taskQueueStatus">Dynamic Queue</span>
      </div>

      <div class="queue-form">
        <div class="queue-row">
          <select class="queue-select" id="queueAccountSelect"></select>
          <input type="text" class="queue-input" id="queueChatUrl" placeholder="Claude Chat URL (e.g. https://claude.ai/chat/...)">
        </div>
        <div class="queue-row">
          <input type="text" class="queue-input" id="queuePrompt" value="continue" placeholder="Prompt to send (e.g. continue)">
        </div>
        <div class="queue-btn-row">
          <button class="btn-queue" id="btnQueueTask" onclick="submitQueuedTask(false)">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Queue for Next Ping
          </button>
          <button class="btn-queue-now" onclick="submitQueuedTask(true)">
            Dispatch Now
          </button>
        </div>
      </div>

      <div class="active-tasks-list" id="activeTasksList">
        <!-- Rendered dynamically -->
      </div>
    </section>

    <!-- 24-HOUR PING SCHEDULE & MATRIX LIST -->
    <section class="section-card">
      <div class="section-head">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          24h Ping Schedule
        </h2>
        <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">+2m Buffer</span>
      </div>

      <!-- INTERACTIVE INSPECT BANNER -->
      <div class="timeline-inspect-bubble" id="timelineBubble">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="inspect-acc-pill now" id="bubbleAccPill">LIVE NOW</span>
          <span style="font-weight: 700; color: #fff; font-family: var(--font-mono);" id="bubbleTime">--:-- --</span>
        </div>
        <div style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.7rem;" id="bubbleDiff">
          Tracking active
        </div>
      </div>

      <!-- DYNAMIC LANE TRACKS -->
      <div class="dual-lane-timeline" id="timelineContainer">
        <!-- Dynamic Lanes Rendered in JS -->
      </div>

      <!-- COMPREHENSIVE SCHEDULE MATRIX -->
      <div class="schedule-list" id="scheduleList">
        <!-- Rendered Dynamically in JS -->
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <p id="footerText">Claude Pulse &bull; Intelligent Multi-Account Rate-Limit Autopilot</p>
    </footer>

  </div>

  <!-- CONFIRMATION & ACTION MODAL -->
  <div class="modal-overlay" id="confirmModal">
    <div class="modal-box">
      <div class="modal-header">
        <div class="modal-icon" id="modalIcon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div class="modal-title">
          <h3 id="modalTitle">Confirm Action</h3>
          <p id="modalSub">Claude Pulse Cloudflare Worker</p>
        </div>
      </div>

      <div class="modal-body" id="modalBody">
        Are you sure you want to trigger this action?
      </div>

      <div class="modal-actions" id="modalActions">
        <button class="btn-modal btn-modal-cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-modal btn-modal-confirm" id="modalConfirmBtn">Proceed</button>
      </div>
    </div>
  </div>

  <script>
    let currentTaskMode = 'quick'; // 'quick' or 'deep'
    let recommendedTargetAccount = 1;
    let selectedScheduleItem = null;
    let pinnedItem = null;

    let ACCOUNTS = [
      { id: 1, name: 'Account 1', color: '#00f2fe' },
      { id: 2, name: 'Account 2', color: '#c084fc' }
    ];

    function generateScheduleForAccounts(accounts) {
      if (!accounts || accounts.length === 0) return [];

      const fixedSlots = [
        { slot: 1, hour: 1, min: 34, minsOfDay: 1 * 60 + 34, display: '01:34 AM', tag: 'Late Night Ping' },
        { slot: 2, hour: 7, min: 30, minsOfDay: 7 * 60 + 30, display: '07:30 AM', tag: 'Morning Ping' },
        { slot: 3, hour: 10, min: 28, minsOfDay: 10 * 60 + 28, display: '10:28 AM', tag: 'Workday Ping' },
        { slot: 4, hour: 12, min: 32, minsOfDay: 12 * 60 + 32, display: '12:32 PM', tag: 'Midday Ping' },
        { slot: 5, hour: 15, min: 30, minsOfDay: 15 * 60 + 30, display: '03:30 PM', tag: 'Afternoon Ping' },
        { slot: 6, hour: 17, min: 34, minsOfDay: 17 * 60 + 34, display: '05:34 PM', tag: 'Evening Ping' },
        { slot: 7, hour: 20, min: 32, minsOfDay: 20 * 60 + 32, display: '08:32 PM', tag: 'Night Ping' },
        { slot: 8, hour: 22, min: 36, minsOfDay: 22 * 60 + 36, display: '10:36 PM', tag: 'Midnight Ping' }
      ];

      let cohortA, cohortB;
      if (accounts.length <= 1) {
        cohortA = accounts;
        cohortB = accounts;
      } else {
        const mid = Math.floor(accounts.length / 2);
        cohortA = accounts.slice(0, mid);
        cohortB = accounts.slice(mid);
      }

      const items = [];
      fixedSlots.forEach(s => {
        const cohort = (s.slot % 2 !== 0) ? cohortA : cohortB;
        cohort.forEach(acc => {
          items.push({
            id: 'ping-' + s.slot + '-' + acc.id,
            account: acc.id,
            name: acc.name,
            hour: s.hour,
            min: s.min,
            minsOfDay: s.minsOfDay,
            display: s.display,
            tag: s.tag
          });
        });
      });

      return items.sort((a, b) => a.minsOfDay - b.minsOfDay);
    }

    let SCHEDULE = generateScheduleForAccounts(ACCOUNTS);

    const WINDOW_DURATION_MINS = 300; // 5 hours

    function setTaskMode(mode) {
      currentTaskMode = mode;
      document.getElementById('modeQuick').className = 'mode-btn ' + (mode === 'quick' ? 'active quick-mode' : '');
      document.getElementById('modeDeep').className = 'mode-btn ' + (mode === 'deep' ? 'active deep-mode' : '');
      updateUI();
    }

    function getNowIST() {
      const utcMs = Date.now();
      const istMs = utcMs + (5.5 * 3600000);
      return new Date(istMs);
    }

    function formatHoursMins(totalMins) {
      const h = Math.floor(totalMins / 60);
      const m = Math.floor(totalMins % 60);
      if (h === 0) return m + 'm';
      return h + 'h ' + m + 'm';
    }

    function formatHoursMinsSeconds(totalSeconds) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = Math.floor(totalSeconds % 60);
      const pad = (n) => String(n).padStart(2, '0');
      if (h === 0) return m + 'm ' + pad(s) + 's';
      return h + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    }

    function formatMinsToDisplayTime(mins) {
      const normalized = ((mins % 1440) + 1440) % 1440;
      const hour24 = Math.floor(normalized / 60);
      const minute = Math.floor(normalized % 60);
      const isPm = hour24 >= 12;
      const hour12 = (hour24 % 12 === 0) ? 12 : (hour24 % 12);
      return String(hour12).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ' ' + (isPm ? 'PM' : 'AM');
    }

    function formatTimeDisplay(date) {
      return date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function renderAccountCards() {
      const grid = document.getElementById('accountsGrid');
      if (!grid) return;
      grid.innerHTML = '';

      ACCOUNTS.forEach(acc => {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.style.borderColor = acc.color ? acc.color + '33' : 'var(--border-subtle)';
        
        card.innerHTML = 
          '<div class="card-head">' +
            '<span class="acc-tag" style="color: ' + (acc.color || '#00f2fe') + '; background: ' + (acc.color ? acc.color + '1a' : 'rgba(0,242,254,0.1)') + ';">' + acc.name + '</span>' +
            '<span class="acc-status-tag" id="accStatusTag_' + acc.id + '">STANDBY</span>' +
          '</div>' +
          '<div class="ring-wrapper">' +
            '<div class="progress-circle">' +
              '<svg viewBox="0 0 80 80">' +
                '<circle class="progress-bg" cx="40" cy="40" r="34"></circle>' +
                '<circle class="progress-bar-dynamic" id="accCircle_' + acc.id + '" cx="40" cy="40" r="34" stroke="' + (acc.color || '#00f2fe') + '" stroke-dasharray="213.6" stroke-dashoffset="0"></circle>' +
              '</svg>' +
              '<div class="ring-center-icon">' +
                '<svg fill="none" stroke="' + (acc.color || '#00f2fe') + '" viewBox="0 0 24 24" stroke-width="2.2">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' +
                '</svg>' +
              '</div>' +
            '</div>' +
            '<div class="ring-meta">' +
              '<div class="ring-meta-val" id="accTimeRemaining_' + acc.id + '">--h --m Left</div>' +
              '<div class="ring-meta-sub" id="accNextPing_' + acc.id + '">Next: --</div>' +
            '</div>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="btn-secondary" onclick="openLaunchDialog(' + acc.id + ')">' +
              '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>' +
              '</svg>' +
              'Launch' +
            '</button>' +
            '<button class="btn-secondary" onclick="confirmAndPing(' + acc.id + ')">' +
              '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>' +
              '</svg>' +
              'Ping' +
            '</button>' +
          '</div>';
        grid.appendChild(card);
      });
    }

    function renderManualControls() {
      const grid = document.getElementById('controlsGrid');
      if (!grid) return;
      grid.innerHTML = '';

      ACCOUNTS.forEach(acc => {
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.onclick = () => confirmAndPing(acc.id, acc.name);
        btn.innerHTML = 
          '<div class="btn-action-icon-pill" style="border-color: ' + (acc.color || '#00f2fe') + '44;">' +
            '<svg fill="none" stroke="' + (acc.color || '#00f2fe') + '" viewBox="0 0 24 24" stroke-width="2.2">' +
              '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>' +
            '</svg>' +
          '</div>' +
          '<span class="btn-action-title">' + acc.name + '</span>' +
          '<span class="btn-action-sub">Account ' + acc.id + '</span>';
        grid.appendChild(btn);
      });

      const allBtn = document.createElement('button');
      allBtn.className = 'btn-action btn-ping-all';
      allBtn.onclick = () => confirmAndPing('all', 'All Accounts');
      allBtn.innerHTML = 
        '<div class="btn-action-icon-pill">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>' +
          '</svg>' +
        '</div>' +
        '<span class="btn-action-title">All</span>' +
        '<span class="btn-action-sub">Ping Everything</span>';
      grid.appendChild(allBtn);
    }

    function renderTimelineTracks() {
      const container = document.getElementById('timelineContainer');
      if (!container) return;
      container.innerHTML = '';

      ACCOUNTS.forEach(acc => {
        const laneRow = document.createElement('div');
        laneRow.className = 'timeline-lane-row';
        laneRow.innerHTML = 
          '<span class="lane-label" style="color: ' + (acc.color || '#00f2fe') + ';">' + acc.name + '</span>' +
          '<div class="lane-track" id="trackAcc_' + acc.id + '" onclick="handleTrackClick(event)">' +
            '<div class="timeline-now-cursor-lane" id="cursorLane_' + acc.id + '" style="left: 50%;" onclick="inspectNow(event)"></div>' +
          '</div>';
        container.appendChild(laneRow);
      });

      const labels = document.createElement('div');
      labels.className = 'timeline-labels';
      labels.innerHTML = '<span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>';
      container.appendChild(labels);
    }

    function calculateTelemetry() {
      const nowIST = getNowIST();
      const currentSecondsOfDay = nowIST.getHours() * 3600 + nowIST.getMinutes() * 60 + nowIST.getSeconds();
      const currentMinsOfDay = currentSecondsOfDay / 60;
      const WINDOW_DURATION_SECONDS = WINDOW_DURATION_MINS * 60;

      const accountStates = ACCOUNTS.map(acc => {
        const accPings = SCHEDULE.filter(s => s.account === acc.id);
        
        let mostRecent = accPings[0] || { hour: 0, min: 0, minsOfDay: 0, display: '--' };
        let elapsedSinceRecentSeconds = Infinity;

        for (const p of accPings) {
          const pingSeconds = p.hour * 3600 + p.min * 60;
          let diff = currentSecondsOfDay - pingSeconds;
          if (diff < 0) diff += 86400;
          if (diff < elapsedSinceRecentSeconds) {
            elapsedSinceRecentSeconds = diff;
            mostRecent = p;
          }
        }

        let nextPing = accPings[0] || { hour: 0, min: 0, minsOfDay: 0, display: '--' };
        let secondsUntilNext = Infinity;
        for (const p of accPings) {
          const pingSeconds = p.hour * 3600 + p.min * 60;
          let diff = pingSeconds - currentSecondsOfDay;
          if (diff < 0) diff += 86400;
          if (diff < secondsUntilNext) {
            secondsUntilNext = diff;
            nextPing = p;
          }
        }

        const isActive = elapsedSinceRecentSeconds < WINDOW_DURATION_SECONDS;
        const secondsLeftInWindow = isActive ? (WINDOW_DURATION_SECONDS - elapsedSinceRecentSeconds) : 0;
        const minsLeftInWindow = Math.floor(secondsLeftInWindow / 60);
        const percentLeft = Math.max(0, Math.min(100, Math.round((secondsLeftInWindow / WINDOW_DURATION_SECONDS) * 100)));

        const windowEndMins = (mostRecent.minsOfDay + WINDOW_DURATION_MINS) % 1440;
        const windowEndDisplay = formatMinsToDisplayTime(windowEndMins);

        return {
          id: acc.id,
          name: acc.name,
          color: acc.color,
          mostRecent,
          nextPing,
          windowEndDisplay,
          elapsedSinceRecentSeconds,
          secondsLeftInWindow,
          minsLeftInWindow,
          secondsUntilNext,
          minsUntilNext: Math.floor(secondsUntilNext / 60),
          percentLeft,
          isActive
        };
      });

      const activeAccounts = accountStates.filter(a => a.isActive);
      let recommendedAcc = accountStates[0] || null;
      let reason = '';
      let isStandby = false;

      if (activeAccounts.length > 0) {
        if (currentTaskMode === 'quick') {
          recommendedAcc = activeAccounts.reduce((min, a) => a.secondsLeftInWindow < min.secondsLeftInWindow ? a : min, activeAccounts[0]);
          reason = recommendedAcc.name + ' resets sooner (' + formatHoursMinsSeconds(recommendedAcc.secondsLeftInWindow) + ' left until ' + recommendedAcc.windowEndDisplay + ').';
        } else {
          recommendedAcc = activeAccounts.reduce((max, a) => a.secondsLeftInWindow > max.secondsLeftInWindow ? a : max, activeAccounts[0]);
          reason = recommendedAcc.name + ' has the most time left (' + formatHoursMinsSeconds(recommendedAcc.secondsLeftInWindow) + ' remaining).';
        }
      } else {
        isStandby = true;
        recommendedAcc = accountStates.reduce((min, a) => a.secondsUntilNext < min.secondsUntilNext ? a : min, accountStates[0]);
        reason = 'All accounts in standby. Next window opens on ' + recommendedAcc.name + ' at ' + recommendedAcc.nextPing.display + ' (in ' + formatHoursMinsSeconds(recommendedAcc.secondsUntilNext) + ').';
      }

      recommendedTargetAccount = recommendedAcc ? recommendedAcc.id : 1;
      return { nowIST, currentMinsOfDay, accountStates, recommendedAcc, reason, isStandby };
    }

    function updateUI() {
      const data = calculateTelemetry();

      const clockEl = document.getElementById('headerClock');
      if (clockEl) clockEl.innerText = formatTimeDisplay(data.nowIST);

      const recBadge = document.getElementById('recBadge');
      const heroCta = document.getElementById('heroCta');
      const rec = data.recommendedAcc;

      if (rec) {
        if (data.isStandby) {
          if (recBadge) {
            recBadge.className = 'rec-badge standby-badge';
            document.getElementById('recBadgeText').innerText = 'STANDBY: NEXT IN ' + formatHoursMinsSeconds(rec.secondsUntilNext).toUpperCase();
          }
          document.getElementById('heroTitle').innerText = 'System Standby';
          document.getElementById('heroReason').innerText = data.reason;
          if (heroCta) heroCta.onclick = () => openLaunchDialog(rec.id, rec.name);
          document.getElementById('heroCtaText').innerText = 'Open Claude (' + rec.name + ')';
          document.getElementById('recNextReset').innerText = 'Next ping in ' + formatHoursMinsSeconds(rec.secondsUntilNext);
        } else {
          if (recBadge) {
            recBadge.className = 'rec-badge';
            recBadge.style.color = rec.color || '#00f2fe';
            recBadge.style.borderColor = (rec.color || '#00f2fe') + '55';
            recBadge.style.background = (rec.color || '#00f2fe') + '1a';
            document.getElementById('recBadgeText').innerText = 'OPTIMAL: ' + rec.name.toUpperCase();
          }
          document.getElementById('heroTitle').innerText = 'Use ' + rec.name;
          document.getElementById('heroReason').innerText = data.reason;
          if (heroCta) heroCta.onclick = () => openLaunchDialog(rec.id, rec.name);
          document.getElementById('heroCtaText').innerText = 'Open Claude as ' + rec.name;
          document.getElementById('recNextReset').innerText = 'Limit reset in ' + formatHoursMinsSeconds(rec.secondsLeftInWindow);
        }
      }

      const fullCircumference = 213.6;

      // Update Dynamic Account Cards
      data.accountStates.forEach(acc => {
        const circle = document.getElementById('accCircle_' + acc.id);
        if (circle) circle.style.strokeDashoffset = fullCircumference * (1 - acc.percentLeft / 100);

        const timeRem = document.getElementById('accTimeRemaining_' + acc.id);
        if (timeRem) timeRem.innerText = acc.isActive ? (formatHoursMinsSeconds(acc.secondsLeftInWindow) + ' Left') : 'Standby';

        const nextPingEl = document.getElementById('accNextPing_' + acc.id);
        if (nextPingEl) {
          nextPingEl.innerText = acc.isActive 
            ? ('Resets at ' + acc.windowEndDisplay + ' • Next: ' + acc.nextPing.display) 
            : ('Next: ' + acc.nextPing.display);
        }

        const statusTag = document.getElementById('accStatusTag_' + acc.id);
        if (statusTag) {
          if (acc.isActive) {
            statusTag.className = (acc.minsLeftInWindow <= 45) ? 'acc-status-tag warning' : 'acc-status-tag active';
            statusTag.innerText = (acc.minsLeftInWindow <= 45) ? 'EXPIRING' : 'ACTIVE';
          } else {
            statusTag.className = 'acc-status-tag';
            statusTag.innerText = 'STANDBY';
          }
        }

        const cursor = document.getElementById('cursorLane_' + acc.id);
        if (cursor) {
          const percentOfDay = (data.currentMinsOfDay / 1440) * 100;
          cursor.style.left = percentOfDay + '%';
        }
      });

      if (!selectedScheduleItem && data.recommendedAcc) {
        const pill = document.getElementById('bubbleAccPill');
        if (pill) {
          pill.className = 'inspect-acc-pill now';
          pill.innerText = 'LIVE NOW';
        }
        document.getElementById('bubbleTime').innerText = formatTimeDisplay(data.nowIST);
        document.getElementById('bubbleDiff').innerText = 'Tracking active: ' + data.recommendedAcc.name;
      }
    }

    function inspectScheduleItem(item) {
      selectedScheduleItem = item;
      const nowIST = getNowIST();
      const currentSecondsOfDay = nowIST.getHours() * 3600 + nowIST.getMinutes() * 60 + nowIST.getSeconds();
      const pingSeconds = item.hour * 3600 + item.min * 60;
      
      let diffSeconds = pingSeconds - currentSecondsOfDay;
      let diffText = '';
      if (diffSeconds > 0) {
        diffText = 'in ' + formatHoursMinsSeconds(diffSeconds);
      } else if (diffSeconds < 0) {
        let passed = currentSecondsOfDay - pingSeconds;
        if (passed > 86400 / 2) {
          diffText = 'in ' + formatHoursMinsSeconds(diffSeconds + 86400);
        } else {
          diffText = formatHoursMinsSeconds(passed) + ' ago';
        }
      } else {
        diffText = 'Right now';
      }

      const pill = document.getElementById('bubbleAccPill');
      if (pill) {
        pill.className = 'inspect-acc-pill';
        pill.style.background = '#1e293b';
        pill.innerText = item.name;
      }

      document.getElementById('bubbleTime').innerText = item.display + ' (' + item.tag + ')';
      document.getElementById('bubbleDiff').innerText = diffText;

      document.querySelectorAll('.lane-node').forEach(node => {
        if (node.dataset.id === item.id) {
          node.classList.add('selected');
        } else {
          node.classList.remove('selected');
        }
      });

      document.querySelectorAll('.schedule-item').forEach(row => {
        if (row.dataset.id === item.id) {
          row.className = 'schedule-item highlighted';
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          row.className = 'schedule-item';
        }
      });
    }

    function inspectNow(e) {
      if (e) e.stopPropagation();
      selectedScheduleItem = null;
      document.querySelectorAll('.lane-node').forEach(n => n.classList.remove('selected'));
      document.querySelectorAll('.schedule-item').forEach(r => r.className = 'schedule-item');
      updateUI();
    }

    function handleTrackClick(e) {
      if (e.target.classList.contains('lane-node')) return;
      inspectNow(e);
    }

    function renderScheduleList() {
      const list = document.getElementById('scheduleList');
      if (!list) return;
      list.innerHTML = '';

      ACCOUNTS.forEach(acc => {
        const track = document.getElementById('trackAcc_' + acc.id);
        if (track) {
          track.querySelectorAll('.lane-node, .lane-band').forEach(n => n.remove());
        }
      });

      // 1. Render 5-Hour Active Window Highlight Bands
      SCHEDULE.forEach((item) => {
        const startMin = item.minsOfDay;
        const endMin = startMin + 300; // 5 hours
        const track = document.getElementById('trackAcc_' + item.account);
        const accInfo = ACCOUNTS.find(a => a.id === item.account) || { color: '#00f2fe' };

        if (track) {
          if (endMin <= 1440) {
            const band = document.createElement('div');
            band.className = 'lane-band';
            band.style.background = (accInfo.color || '#00f2fe') + '26';
            band.style.borderTop = '1px solid ' + (accInfo.color || '#00f2fe') + '66';
            band.style.borderBottom = '1px solid ' + (accInfo.color || '#00f2fe') + '66';
            band.style.left = (startMin / 1440 * 100) + '%';
            band.style.width = ((endMin - startMin) / 1440 * 100) + '%';
            track.appendChild(band);
          } else {
            const bandA = document.createElement('div');
            bandA.className = 'lane-band';
            bandA.style.background = (accInfo.color || '#00f2fe') + '26';
            bandA.style.left = (startMin / 1440 * 100) + '%';
            bandA.style.width = ((1440 - startMin) / 1440 * 100) + '%';
            track.appendChild(bandA);

            const bandB = document.createElement('div');
            bandB.className = 'lane-band';
            bandB.style.background = (accInfo.color || '#00f2fe') + '26';
            bandB.style.left = '0%';
            bandB.style.width = ((endMin - 1440) / 1440 * 100) + '%';
            track.appendChild(bandB);
          }

          // Ping node point
          const node = document.createElement('div');
          node.className = 'lane-node';
          node.style.background = accInfo.color || '#00f2fe';
          node.style.boxShadow = '0 0 6px ' + (accInfo.color || '#00f2fe');
          node.style.left = (startMin / 1440 * 100) + '%';
          node.dataset.id = item.id;
          node.onclick = (e) => {
            e.stopPropagation();
            pinnedItem = (pinnedItem === item.id) ? null : item.id;
            inspectScheduleItem(item);
          };
          node.onmouseenter = () => { if (!pinnedItem) inspectScheduleItem(item); };
          node.onmouseleave = () => { if (!pinnedItem) inspectNow(); };
          track.appendChild(node);
        }

        // Schedule list item
        const row = document.createElement('div');
        row.className = 'schedule-item';
        row.dataset.id = item.id;
        row.onclick = () => {
          pinnedItem = (pinnedItem === item.id) ? null : item.id;
          inspectScheduleItem(item);
        };
        row.onmouseenter = () => { if (!pinnedItem) inspectScheduleItem(item); };
        row.onmouseleave = () => { if (!pinnedItem) inspectNow(); };
        row.innerHTML = 
          '<div class="schedule-left">' +
            '<div class="schedule-acc-dot" style="background: ' + (accInfo.color || '#00f2fe') + ';"></div>' +
            '<span class="schedule-time">' + item.display + '</span>' +
            '<span class="schedule-name-tag" style="color: ' + (accInfo.color || '#00f2fe') + ';">' + item.name + '</span>' +
          '</div>' +
          '<div class="schedule-right">' +
            '<span class="safe-buffer-badge">+2m</span>' +
            '<span>' + item.tag + '</span>' +
          '</div>';
        list.appendChild(row);
      });
    }

    function addConsoleLog(msg, type = 'normal') {
      const consoleBox = document.getElementById('consoleLogs');
      if (!consoleBox) return;
      const line = document.createElement('div');
      line.className = 'log-line';
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      line.innerHTML = '<span class="log-time">[' + time + ']</span><span class="log-msg ' + type + '">' + msg + '</span>';
      consoleBox.appendChild(line);
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    function closeModal() {
      const modal = document.getElementById('confirmModal');
      if (modal) modal.classList.remove('open');
      const cancelBtn = document.querySelector('.btn-modal-cancel');
      if (cancelBtn) cancelBtn.style.display = '';
      const modalActions = document.getElementById('modalActions');
      if (modalActions) modalActions.style.gridTemplateColumns = '1fr 1fr';
    }

    // LIVE DIAGNOSTICS CHECK
    async function runDiagnostics() {
      addConsoleLog('Running live system diagnostic check (0 pings sent)...', 'info');
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const confirmBtn = document.getElementById('modalConfirmBtn');
      const modalActions = document.getElementById('modalActions');

      title.innerText = 'Wiring & System Diagnostics';
      body.innerHTML = '<div style="display: flex; align-items: center; gap: 8px; justify-content: center; padding: 20px 0;"><span class="pulse-dot"></span> <span>Checking live infrastructure...</span></div>';
      modal.classList.add('open');

      try {
        const start = performance.now();
        const res = await fetch('/api/health');
        const latency = Math.round(performance.now() - start);
        const data = await res.json();

        const bConnected = data.browserless?.status === 'connected';

        let html = '<div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem;">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Cloudflare Edge Worker:</span> <strong style="color: var(--success-green);">ONLINE (' + latency + 'ms)</strong></div>';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Browserless API:</span> <strong style="color: ' + (bConnected ? 'var(--success-green)' : 'var(--danger-red)') + ';">' + (bConnected ? 'CONNECTED' : 'ERROR') + '</strong></div>';
        
        if (data.accounts && Array.isArray(data.accounts)) {
          data.accounts.forEach(a => {
            html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>' + a.name + ':</span> <strong style="color: ' + (a.themeColor || 'var(--acc1-cyan)') + ';">ACTIVE</strong></div>';
          });
        }

        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Server IST Time:</span> <strong style="color: #fff; font-family: monospace;">' + (data.timestamp?.ist ? data.timestamp.ist.split(',')[1] : '--') + '</strong></div>';
        html += '</div>';

        body.innerHTML = html;
        const cancelBtn = modal.querySelector('.btn-modal-cancel');
        if (cancelBtn) cancelBtn.style.display = 'none';
        modalActions.style.gridTemplateColumns = '1fr';
        confirmBtn.className = 'btn-modal btn-modal-confirm';
        confirmBtn.innerText = 'Close';
        confirmBtn.onclick = closeModal;

        addConsoleLog('Health Check: Edge ' + latency + 'ms | Browserless ' + (bConnected ? 'Online' : 'Failed'), bConnected ? 'success' : 'error');
      } catch (err) {
        body.innerHTML = '<div style="color: var(--danger-red);">Health check failed to reach Worker: ' + err.message + '</div>';
        addConsoleLog('Diagnostic Error: ' + err.message, 'error');
      }
    }

    function confirmAndPing(target, label) {
      if (!label) {
        if (target === 'all') {
          label = 'All Accounts';
        } else {
          const found = ACCOUNTS.find(a => a.id === target);
          label = found ? found.name : ('Account ' + target);
        }
      }
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const confirmBtn = document.getElementById('modalConfirmBtn');

      title.innerText = 'Ping ' + label + '?';
      body.innerHTML = 'Sends a 1-character keep-alive message (<code style="color: #fff; font-family: monospace;">.</code>) via Browserless to refresh your 5-hour limit window on Claude.';

      confirmBtn.className = 'btn-modal btn-modal-confirm';
      confirmBtn.innerText = 'Send Ping';
      confirmBtn.onclick = () => {
        closeModal();
        triggerPing(target);
      };

      modal.classList.add('open');
    }

    function openLaunchDialog(accNum, accName) {
      if (!accName) {
        const found = ACCOUNTS.find(a => a.id === accNum);
        accName = found ? found.name : ('Account ' + accNum);
      }
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const confirmBtn = document.getElementById('modalConfirmBtn');

      title.innerText = 'Open Claude as ' + accName;
      body.innerHTML = 'Ensure your active browser tab or Claude app is signed into <strong style="color: var(--acc1-cyan);">' + accName + '</strong>.';

      confirmBtn.className = 'btn-modal btn-modal-confirm';
      confirmBtn.innerText = 'Open Claude.ai';
      confirmBtn.onclick = () => {
        closeModal();
        window.open('https://claude.ai', '_blank', 'noopener,noreferrer');
      };

      modal.classList.add('open');
    }

    async function triggerPing(target) {
      const statusText = document.getElementById('pingStatusText');
      if (statusText) {
        statusText.innerText = 'Pinging...';
        statusText.style.color = 'var(--warning-amber)';
      }

      const endpoint = (target === 'all') ? '/api/ping' : ('/api/ping?account=' + target);
      const targetLabel = (target === 'all') ? 'All Accounts' : ('Account ' + target);

      addConsoleLog('Dispatching headless browser request for ' + targetLabel + '...', 'normal');

      try {
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          data.results.forEach(r => {
            if (r.result && r.result.success) {
              const cleanedText = r.result.cleanedUpSpamCount > 0 ? (' [Cleaned ' + r.result.cleanedUpSpamCount + ' duplicate chats]') : '';
              addConsoleLog('SUCCESS: ' + r.account + ' ➔ ' + (r.result.pageTitle || 'Ping sent') + cleanedText, 'success');
            } else {
              addConsoleLog('ERROR: ' + r.account + ' ➔ ' + (r.result?.error || 'Execution failed'), 'error');
            }
          });
        } else {
          addConsoleLog('Response: ' + JSON.stringify(data), 'normal');
        }

        if (statusText) {
          statusText.innerText = 'Success';
          statusText.style.color = 'var(--success-green)';
          setTimeout(() => { statusText.innerText = 'Ready'; }, 3000);
        }
      } catch (err) {
        addConsoleLog('Network / Worker Error: ' + err.message, 'error');
        if (statusText) {
          statusText.innerText = 'Failed';
          statusText.style.color = 'var(--danger-red)';
        }
      }
    }

    // Task Queue Management
    function populateQueueAccountSelect() {
      const select = document.getElementById('queueAccountSelect');
      if (!select) return;
      const currentVal = select.value;
      select.innerHTML = '';
      ACCOUNTS.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.id;
        opt.innerText = acc.name;
        select.appendChild(opt);
      });
      if (currentVal && ACCOUNTS.some(a => a.id === parseInt(currentVal, 10))) {
        select.value = currentVal;
      }
    }

    async function fetchQueueTasks() {
      const container = document.getElementById('activeTasksList');
      if (!container) return;

      try {
        const res = await fetch('/api/queue');
        if (!res.ok) return;
        const data = await res.json();
        const tasks = data.tasks || {};

        const taskEntries = Object.entries(tasks);
        if (taskEntries.length === 0) {
          container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.72rem; text-align: center; padding: 6px;">No overnight tasks currently queued.</div>';
          return;
        }

        container.innerHTML = '';
        taskEntries.forEach(([accId, task]) => {
          const acc = ACCOUNTS.find(a => a.id === parseInt(accId, 10)) || { name: 'Account ' + accId, color: '#00f2fe' };
          const card = document.createElement('div');
          card.className = 'task-item-card ' + (task.status || 'queued');
          
          let statusBadge = '<span class="task-badge queued">Queued</span>';
          if (task.status === 'completed') statusBadge = '<span class="task-badge completed">Completed</span>';
          if (task.status === 'failed') statusBadge = '<span class="task-badge failed">Failed</span>';

          const timeText = task.status === 'completed'
            ? ('Finished at ' + (task.completedAt ? new Date(task.completedAt).toLocaleTimeString('en-US') : ''))
            : (task.status === 'failed' ? ('Failed: ' + (task.error || 'Execution error')) : 'Fires on next scheduled ping');

          const cancelAction = (task.status === 'queued')
            ? ('<button class="task-cancel-btn" onclick="cancelQueuedTask(' + accId + ')">Cancel</button>')
            : ('<button class="task-cancel-btn" onclick="cancelQueuedTask(' + accId + ')">Clear</button>');

          card.innerHTML = 
            '<div class="task-header">' +
              '<div style="display:flex; align-items:center; gap:6px;">' +
                '<span style="font-weight:700; color:' + (acc.color || '#00f2fe') + ';">' + acc.name + '</span>' +
                statusBadge +
              '</div>' +
              cancelAction +
            '</div>' +
            '<div style="font-family: var(--font-mono); font-size: 0.72rem; color: #cbd5e1; word-break: break-all;">' +
              '<strong>Prompt:</strong> &ldquo;' + (task.prompt || 'continue') + '&rdquo;' +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">' +
              '<a href="' + (task.chatUrl || '#') + '" target="_blank" style="color:var(--acc1-cyan); text-decoration:none; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (task.chatUrl || 'Claude Chat') + '</a>' +
              '<span>' + timeText + '</span>' +
            '</div>';

          container.appendChild(card);
        });
      } catch (e) {
        console.warn('Queue fetch skipped:', e.message);
      }
    }

    async function submitQueuedTask(runNow) {
      const select = document.getElementById('queueAccountSelect');
      const chatUrlInput = document.getElementById('queueChatUrl');
      const promptInput = document.getElementById('queuePrompt');

      const accountId = select ? parseInt(select.value, 10) : 1;
      const chatUrl = chatUrlInput ? chatUrlInput.value.trim() : '';
      const prompt = promptInput ? promptInput.value.trim() : 'continue';

      if (!chatUrl) {
        alert('Please paste your Claude Chat URL first!');
        if (chatUrlInput) chatUrlInput.focus();
        return;
      }

      const acc = ACCOUNTS.find(a => a.id === accountId) || { name: 'Account ' + accountId };
      addConsoleLog('Queueing prompt for ' + acc.name + '...', 'info');

      try {
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, chatUrl, prompt })
        });
        const data = await res.json();
        if (data.success) {
          addConsoleLog('SUCCESS: Task queued for ' + acc.name + ' ("' + prompt + '")', 'success');
          if (chatUrlInput) chatUrlInput.value = '';
          fetchQueueTasks();

          if (runNow) {
            confirmAndPing(accountId, acc.name);
          }
        } else {
          addConsoleLog('Queue Error: ' + (data.error || 'Failed to queue'), 'error');
        }
      } catch (err) {
        addConsoleLog('Network Error queueing task: ' + err.message, 'error');
      }
    }

    async function cancelQueuedTask(accountId) {
      try {
        const res = await fetch('/api/queue?accountId=' + accountId, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addConsoleLog('Cancelled task for Account ' + accountId, 'normal');
          fetchQueueTasks();
        }
      } catch (err) {
        console.error('Cancel task error:', err);
      }
    }

    // Dynamic Account Sync from Health API
    async function syncAccountsFromEdge() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
            ACCOUNTS = data.accounts.map(a => ({
              id: a.id,
              name: a.name,
              color: a.themeColor || (a.id === 1 ? '#00f2fe' : (a.id === 2 ? '#c084fc' : '#10b981'))
            }));

            const headerSub = document.getElementById('headerSub');
            if (headerSub) {
              headerSub.innerText = ACCOUNTS.map(a => a.name).join(' • ');
            }

            const footer = document.getElementById('footerText');
            if (footer) {
              footer.innerText = 'Claude Pulse • ' + ACCOUNTS.map(a => a.name).join(' & ') + ' Autopilot';
            }

            SCHEDULE = generateScheduleForAccounts(ACCOUNTS);

            renderAccountCards();
            renderManualControls();
            renderTimelineTracks();
            renderScheduleList();
            populateQueueAccountSelect();
            fetchQueueTasks();
            updateUI();
          }
        }
      } catch (e) {
        console.warn('Accounts edge sync skipped:', e.message);
      }
    }

    // Close modal on escape or background click
    document.getElementById('confirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'confirmModal') closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Init
    renderAccountCards();
    renderManualControls();
    renderTimelineTracks();
    renderScheduleList();
    populateQueueAccountSelect();
    fetchQueueTasks();
    updateUI();
    setInterval(updateUI, 1000);
    setInterval(fetchQueueTasks, 15000);
    syncAccountsFromEdge();
  </script>
</body>
</html>`;
}
