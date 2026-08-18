export function renderDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Claude Pulse — shlokshah412 & pcgpt Switcher</title>
  <meta name="description" content="Real-time intelligent rate-limit tracking and dynamic switcher for Claude accounts.">
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
      --bg-card: rgba(14, 18, 26, 0.75);
      --bg-card-hover: rgba(22, 28, 40, 0.9);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(255, 255, 255, 0.2);
      
      --acc1-cyan: #00f2fe;
      --acc1-blue: #38bdf8;
      
      --acc2-purple: #c084fc;
      --acc2-indigo: #a855f7;

      --success-green: #10b981;
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
      padding: max(38px, env(safe-area-inset-top, 38px)) 16px env(safe-area-inset-bottom, 32px);
      overflow-x: hidden;
    }

    .app-container {
      width: 100%;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 2px 10px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      background: #111520;
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon-box svg {
      width: 22px;
      height: 22px;
    }

    .brand-text h1 {
      font-size: 1.22rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #fff;
    }

    .brand-text p {
      font-size: 0.74rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-clock-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #10141f;
      border: 1px solid var(--border-subtle);
      padding: 6px 12px;
      border-radius: 20px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success-green);
      border-radius: 50%;
      box-shadow: 0 0 6px var(--success-green);
      animation: blink 2s infinite ease-in-out;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.85); }
    }

    /* MODE SELECTOR */
    .mode-switch-wrapper {
      display: flex;
      background: #0d1017;
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
    }

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .mode-btn svg { width: 15px; height: 15px; }

    .mode-btn.active.deep-mode {
      background: rgba(0, 242, 254, 0.12);
      color: var(--acc1-cyan);
      border: 1px solid rgba(0, 242, 254, 0.3);
    }

    .mode-btn.active.quick-mode {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* HERO RECOMMENDATION CARD */
    .hero-recommendation {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 22px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
      margin-bottom: 12px;
    }

    .rec-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 4px 10px;
      border-radius: 8px;
      background: rgba(0, 242, 254, 0.1);
      color: var(--acc1-cyan);
      border: 1px solid rgba(0, 242, 254, 0.25);
    }

    .rec-badge.pcgpt-badge {
      background: rgba(192, 132, 252, 0.1);
      color: var(--acc2-purple);
      border: 1px solid rgba(192, 132, 252, 0.25);
    }

    .hero-title {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
      color: #fff;
    }

    .hero-reason {
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 18px;
    }

    .launch-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 13px 18px;
      border-radius: 14px;
      font-size: 0.92rem;
      font-weight: 800;
      color: #ffffff;
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.14) 0%, rgba(56, 189, 248, 0.06) 100%);
      border: 1px solid rgba(0, 242, 254, 0.35);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .launch-cta.pcgpt-cta {
      background: linear-gradient(135deg, rgba(192, 132, 252, 0.14) 0%, rgba(168, 85, 247, 0.06) 100%);
      border: 1px solid rgba(192, 132, 252, 0.35);
      color: #ffffff;
    }

    .launch-cta:hover {
      background: linear-gradient(135deg, rgba(0, 242, 254, 0.22) 0%, rgba(56, 189, 248, 0.12) 100%);
      border-color: rgba(0, 242, 254, 0.6);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 0 18px rgba(0, 242, 254, 0.2);
    }

    .launch-cta.pcgpt-cta:hover {
      background: linear-gradient(135deg, rgba(192, 132, 252, 0.22) 0%, rgba(168, 85, 247, 0.12) 100%);
      border-color: rgba(192, 132, 252, 0.6);
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 0 18px rgba(192, 132, 252, 0.2);
    }

    .launch-cta:active {
      transform: scale(0.98);
      filter: brightness(0.95);
    }

    .launch-cta svg { width: 16px; height: 16px; }

    /* DUAL ACCOUNT TELEMETRY GAUGES */
    .accounts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 500px) {
      .accounts-grid {
        grid-template-columns: 1fr;
      }
    }

    .account-card {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
    }

    .account-card.acc1-theme { border-top: 2.5px solid var(--acc1-cyan); }
    .account-card.acc2-theme { border-top: 2.5px solid var(--acc2-purple); }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .acc-tag {
      font-size: 0.86rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .acc1-theme .acc-tag { color: var(--acc1-cyan); }
    .acc2-theme .acc-tag { color: var(--acc2-purple); }

    .acc-status-tag {
      font-size: 0.66rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      font-family: var(--font-mono);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }

    .acc-status-tag.active {
      background: rgba(16, 185, 129, 0.12);
      color: var(--success-green);
    }

    .ring-wrapper {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .progress-circle {
      position: relative;
      width: 60px;
      height: 60px;
      flex-shrink: 0;
    }

    .progress-circle > svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-circle circle {
      fill: none;
      stroke-width: 6;
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
      width: 22px;
      height: 22px;
      transform: none !important;
    }

    .acc1-theme .ring-center-icon svg { color: var(--acc1-cyan); }
    .acc2-theme .ring-center-icon svg { color: var(--acc2-purple); }

    .ring-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ring-meta-val {
      font-size: 1rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--text-primary);
    }

    .ring-meta-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--border-focus);
    }

    .btn-secondary svg { width: 13px; height: 13px; }

    /* SECTION CARD BASE */
    .section-card {
      background: #0f131d;
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-head h2 {
      font-size: 0.92rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-head h2 svg { width: 16px; height: 16px; color: var(--acc1-blue); }

    /* COMMAND CONSOLE & DIAGNOSTICS */
    .health-bar-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      font-size: 0.78rem;
    }

    .health-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--success-green);
    }

    .btn-diagnostic-check {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
    }

    .btn-diagnostic-check:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-focus);
    }

    .btn-diagnostic-check svg { width: 13px; height: 13px; }

    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .btn-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px 6px;
      min-height: 80px;
      border-radius: 14px;
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
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .btn-ping-acc1 .btn-action-icon-pill { background: rgba(0, 242, 254, 0.12); color: var(--acc1-cyan); }
    .btn-ping-acc2 .btn-action-icon-pill { background: rgba(192, 132, 252, 0.12); color: var(--acc2-purple); }
    .btn-ping-all .btn-action-icon-pill { background: rgba(255, 255, 255, 0.08); color: #fff; }

    .btn-action-title {
      font-size: 0.8rem;
      font-weight: 800;
      white-space: nowrap;
      margin-bottom: 2px;
    }

    .btn-ping-acc1 .btn-action-title { color: var(--acc1-cyan); }
    .btn-ping-acc2 .btn-action-title { color: var(--acc2-purple); }
    .btn-ping-all .btn-action-title { color: #fff; }

    .btn-action-sub {
      font-size: 0.68rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-weight: 500;
      white-space: nowrap;
    }

    .btn-action svg { width: 14px; height: 14px; }

    .console-drawer {
      background: #07090f;
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px;
      font-family: var(--font-mono);
      font-size: 0.76rem;
      color: #94a3b8;
      max-height: 130px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .log-line {
      display: flex;
      gap: 8px;
      word-break: break-all;
    }

    .log-time { color: var(--text-muted); flex-shrink: 0; }
    .log-msg { color: #e2e8f0; }
    .log-msg.success { color: var(--success-green); }
    .log-msg.info { color: var(--acc1-cyan); }
    .log-msg.error { color: var(--danger-red); }

    /* DUAL-LANE 24H MASTER TIMELINE (CLEAN CRISP DOTS & INSPECTOR) */
    .timeline-inspect-bubble {
      background: #131722;
      border: 1px solid var(--border-focus);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.78rem;
    }

    .inspect-acc-pill {
      font-weight: 800;
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 6px;
      font-family: var(--font-mono);
    }

    .inspect-acc-pill.acc1 { background: rgba(0, 242, 254, 0.15); color: var(--acc1-cyan); }
    .inspect-acc-pill.acc2 { background: rgba(192, 132, 252, 0.15); color: var(--acc2-purple); }
    .inspect-acc-pill.now { background: rgba(255, 255, 255, 0.12); color: #fff; }

    .dual-lane-timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 6px 0 2px;
    }

    .timeline-lane-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lane-label {
      width: 95px;
      font-size: 0.74rem;
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

    .lane-node {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--bg-base);
      cursor: pointer;
      transition: all 0.18s ease;
      z-index: 5;
    }

    .lane-node.acc1 {
      background-color: var(--acc1-cyan);
      box-shadow: 0 0 8px rgba(0, 242, 254, 0.7);
    }
    .lane-node.acc2 {
      background-color: var(--acc2-purple);
      box-shadow: 0 0 8px rgba(192, 132, 252, 0.7);
    }

    .lane-node:hover, .lane-node:active, .lane-node.selected {
      transform: translate(-50%, -50%) scale(1.35);
      border-color: #fff;
      z-index: 20;
    }

    .lane-node.acc1:hover, .lane-node.acc1:active, .lane-node.acc1.selected {
      box-shadow: 0 0 16px var(--acc1-cyan), 0 0 24px rgba(0, 242, 254, 0.5);
    }

    .lane-node.acc2:hover, .lane-node.acc2:active, .lane-node.acc2.selected {
      box-shadow: 0 0 16px var(--acc2-purple), 0 0 24px rgba(192, 132, 252, 0.5);
    }

    .timeline-now-cursor-lane {
      position: absolute;
      top: -3px;
      bottom: -3px;
      width: 2.5px;
      background-color: #ffffff;
      box-shadow: 0 0 8px #ffffff, 0 0 16px rgba(255, 255, 255, 0.6);
      z-index: 10;
      cursor: pointer;
    }

    .timeline-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-top: 2px;
      padding-left: 105px;
    }

    /* SCHEDULE MATRIX LIST (FULL COMPREHENSIVE INFO) */
    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .schedule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .schedule-item:hover, .schedule-item.highlighted {
      background: rgba(255, 255, 255, 0.06);
      border-color: var(--border-focus);
    }

    .schedule-item.highlighted.acc1-item {
      border-color: rgba(0, 242, 254, 0.5);
    }

    .schedule-item.highlighted.acc2-item {
      border-color: rgba(192, 132, 252, 0.5);
    }

    .schedule-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .schedule-acc-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .schedule-acc-dot.acc1 { background-color: var(--acc1-cyan); }
    .schedule-acc-dot.acc2 { background-color: var(--acc2-purple); }

    .schedule-time {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #fff;
    }

    .schedule-name-tag {
      font-size: 0.74rem;
      font-weight: 700;
      margin-left: 4px;
    }

    .schedule-name-tag.acc1-name { color: var(--acc1-cyan); }
    .schedule-name-tag.acc2-name { color: var(--acc2-purple); }

    .schedule-right {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.74rem;
      color: var(--text-muted);
    }

    .safe-buffer-badge {
      font-size: 0.66rem;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.1);
      color: var(--success-green);
      font-family: var(--font-mono);
      font-weight: 700;
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
      padding: 20px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }

    .modal-overlay.open { opacity: 1; visibility: visible; }

    .modal-box {
      background: #0f131c;
      border: 1px solid var(--border-focus);
      border-radius: 20px;
      padding: 22px;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      transform: scale(0.96);
      transition: transform 0.2s ease;
    }

    .modal-overlay.open .modal-box { transform: scale(1); }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--acc1-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon svg { width: 20px; height: 20px; }

    .modal-title h3 { font-size: 1.1rem; font-weight: 800; color: #fff; }
    .modal-title p { font-size: 0.76rem; color: var(--text-muted); }

    .modal-body {
      font-size: 0.86rem;
      color: var(--text-secondary);
      line-height: 1.5;
      background: rgba(255, 255, 255, 0.025);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 2px;
    }

    .btn-modal {
      padding: 11px 16px;
      border-radius: 12px;
      font-size: 0.86rem;
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
      font-size: 0.74rem;
      color: var(--text-muted);
      padding: 12px 0;
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
          <p>shlokshah412 &bull; pcgpt</p>
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
        <span>Quick Query / Expiring</span>
      </button>
      <button class="mode-btn" id="modeDeep" onclick="setTaskMode('deep')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <span>Deep Work / Large Task</span>
      </button>
    </div>

    <!-- HERO RECOMMENDATION -->
    <section class="hero-recommendation" id="heroCard">
      <div class="rec-top-row">
        <div class="rec-badge" id="recBadge">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <span id="recBadgeText">Calculating...</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-muted);" id="recNextReset">
          Next reset: --
        </div>
      </div>
      <h2 class="hero-title" id="heroTitle">Analyzing Schedules...</h2>
      <p class="hero-reason" id="heroReason">Loading live rate-limit telemetry...</p>
      
      <button class="launch-cta" id="heroCta" onclick="openLaunchDialog(recommendedTargetAccount)">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        <span id="heroCtaText">Launch Recommended Account</span>
      </button>
    </section>

    <!-- DUAL ACCOUNT TELEMETRY GAUGES -->
    <section class="accounts-grid">
      
      <!-- ACCOUNT 1: SHLOKSHAH412 -->
      <div class="account-card acc1-theme">
        <div class="card-head">
          <span class="acc-tag">shlokshah412</span>
          <span class="acc-status-tag" id="acc1StatusTag">ACTIVE</span>
        </div>

        <div class="ring-wrapper">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80">
              <circle class="progress-bg" cx="40" cy="40" r="34"></circle>
              <circle class="progress-bar-acc1" id="acc1Circle" cx="40" cy="40" r="34" stroke-dasharray="213.6" stroke-dashoffset="0"></circle>
            </svg>
            <div class="ring-center-icon">
              <!-- User Profile Persona Icon for Account 1 -->
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
          <div class="ring-meta">
            <div class="ring-meta-val" id="acc1TimeRemaining">--h --m Left</div>
            <div class="ring-meta-sub" id="acc1NextPing">Next: --</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-secondary" onclick="openLaunchDialog(1)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Launch
          </button>
          <button class="btn-secondary" onclick="confirmAndPing(1, 'shlokshah412')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M12 12h.01"/>
            </svg>
            Ping Now
          </button>
        </div>
      </div>

      <!-- ACCOUNT 2: PCGPT -->
      <div class="account-card acc2-theme">
        <div class="card-head">
          <span class="acc-tag">pcgpt</span>
          <span class="acc-status-tag" id="acc2StatusTag">ACTIVE</span>
        </div>

        <div class="ring-wrapper">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80">
              <circle class="progress-bg" cx="40" cy="40" r="34"></circle>
              <circle class="progress-bar-acc2" id="acc2Circle" cx="40" cy="40" r="34" stroke-dasharray="213.6" stroke-dashoffset="0"></circle>
            </svg>
            <div class="ring-center-icon">
              <!-- Terminal Display Icon for Account 2 -->
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
          <div class="ring-meta">
            <div class="ring-meta-val" id="acc2TimeRemaining">--h --m Left</div>
            <div class="ring-meta-sub" id="acc2NextPing">Next: --</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-secondary" onclick="openLaunchDialog(2)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Launch
          </button>
          <button class="btn-secondary" onclick="confirmAndPing(2, 'pcgpt')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            Ping Now
          </button>
        </div>
      </div>

    </section>

    <!-- REMOTE COMMAND CONSOLE & DIAGNOSTICS -->
    <section class="section-card">
      <div class="section-head">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Remote Command Console
        </h2>
        <span style="font-size: 0.72rem; color: var(--success-green); font-family: var(--font-mono);" id="pingStatusText">Ready</span>
      </div>

      <!-- DIAGNOSTIC BAR -->
      <div class="health-bar-row">
        <div class="health-status-badge" id="healthBadge">
          <span class="pulse-dot"></span>
          <span id="healthSummaryText">Worker Online &bull; Cloudflare</span>
        </div>
        <button class="btn-diagnostic-check" onclick="runDiagnostics()">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Test Wiring (No Ping)
        </button>
      </div>

      <div class="controls-grid">
        <!-- PING SHLOKSHAH412 -->
        <button class="btn-action btn-ping-acc1" onclick="confirmAndPing(1, 'shlokshah412')">
          <div class="btn-action-icon-pill">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M12 12h.01"/>
            </svg>
          </div>
          <span class="btn-action-title">Ping shlokshah412</span>
          <span class="btn-action-sub">Trigger Acc 1</span>
        </button>

        <!-- PING PCGPT -->
        <button class="btn-action btn-ping-acc2" onclick="confirmAndPing(2, 'pcgpt')">
          <div class="btn-action-icon-pill">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <span class="btn-action-title">Ping pcgpt</span>
          <span class="btn-action-sub">Trigger Acc 2</span>
        </button>

        <!-- PING BOTH -->
        <button class="btn-action btn-ping-all" onclick="confirmAndPing('all', 'Both Accounts')">
          <div class="btn-action-icon-pill">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <span class="btn-action-title">Ping Both</span>
          <span class="btn-action-sub">Simultaneous</span>
        </button>
      </div>

      <div class="console-drawer" id="consoleLogs">
        <div class="log-line">
          <span class="log-time">[System]</span>
          <span class="log-msg">Claude Pulse initialized. Connected to Cloudflare Worker.</span>
        </div>
      </div>
    </section>

    <!-- DUAL-LANE 24-HOUR INTERACTIVE TIMELINE & MATRIX LIST -->
    <section class="section-card">
      <div class="section-head">
        <h2>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          24-Hour Master Schedule (IST)
        </h2>
        <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">+2m Buffer</span>
      </div>

      <!-- INTERACTIVE INSPECT BANNER -->
      <div class="timeline-inspect-bubble" id="timelineBubble">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="inspect-acc-pill now" id="bubbleAccPill">LIVE NOW</span>
          <span style="font-weight: 700; color: #fff;" id="bubbleTime">--:-- --</span>
          <span style="color: var(--text-muted);" id="bubbleTag">Current Position</span>
        </div>
        <div style="font-family: var(--font-mono); color: var(--text-secondary);" id="bubbleDiff">
          Tracking active
        </div>
      </div>

      <!-- DUAL LANE TRACKS (CRISP & CLEAN) -->
      <div class="dual-lane-timeline" id="timelineContainer">
        <!-- Lane 1: shlokshah412 -->
        <div class="timeline-lane-row">
          <span class="lane-label acc1-label">shlokshah412</span>
          <div class="lane-track" id="trackAcc1" onclick="handleTrackClick(event)">
            <div class="timeline-now-cursor-lane" id="cursorLane1" style="left: 50%;" onclick="inspectNow(event)"></div>
          </div>
        </div>

        <!-- Lane 2: pcgpt -->
        <div class="timeline-lane-row">
          <span class="lane-label acc2-label">pcgpt</span>
          <div class="lane-track" id="trackAcc2" onclick="handleTrackClick(event)">
            <div class="timeline-now-cursor-lane" id="cursorLane2" style="left: 50%;" onclick="inspectNow(event)"></div>
          </div>
        </div>

        <div class="timeline-labels">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      <!-- COMPREHENSIVE 8-ITEM SCHEDULE MATRIX -->
      <div class="schedule-list" id="scheduleList">
        <!-- Rendered Dynamically in JS -->
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <p>Claude Pulse &bull; shlokshah412 &amp; pcgpt 2.5h Staggered Engine</p>
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

    function setTaskMode(mode) {
      currentTaskMode = mode;
      document.getElementById('modeDeep').className = 'mode-btn ' + (mode === 'deep' ? 'active deep-mode' : '');
      document.getElementById('modeQuick').className = 'mode-btn ' + (mode === 'quick' ? 'active quick-mode' : '');
      updateUI();
    }

    const SCHEDULE = [
      { id: 'ping-1', account: 1, name: 'shlokshah412', hour: 1, min: 34, minsOfDay: 1 * 60 + 34, display: '01:34 AM', tag: 'Late Night Wrap-up' },
      { id: 'ping-2', account: 2, name: 'pcgpt', hour: 7, min: 30, minsOfDay: 7 * 60 + 30, display: '07:30 AM', tag: 'Early Morning Start' },
      { id: 'ping-3', account: 1, name: 'shlokshah412', hour: 10, min: 28, minsOfDay: 10 * 60 + 28, display: '10:28 AM', tag: 'Morning Workday Start' },
      { id: 'ping-4', account: 2, name: 'pcgpt', hour: 12, min: 32, minsOfDay: 12 * 60 + 32, display: '12:32 PM', tag: 'Lunchtime Switch' },
      { id: 'ping-5', account: 1, name: 'shlokshah412', hour: 15, min: 30, minsOfDay: 15 * 60 + 30, display: '03:30 PM', tag: 'Afternoon Sprint' },
      { id: 'ping-6', account: 2, name: 'pcgpt', hour: 17, min: 34, minsOfDay: 17 * 60 + 34, display: '05:34 PM', tag: 'Tea Break / Post-Work' },
      { id: 'ping-7', account: 1, name: 'shlokshah412', hour: 20, min: 32, minsOfDay: 20 * 60 + 32, display: '08:32 PM', tag: 'Dinner / Evening Session' },
      { id: 'ping-8', account: 2, name: 'pcgpt', hour: 22, min: 36, minsOfDay: 22 * 60 + 36, display: '10:36 PM', tag: 'Peak Midnight Deep Work' }
    ].sort((a, b) => a.minsOfDay - b.minsOfDay);

    const WINDOW_DURATION_MINS = 300; // 5 hours

    function getNowIST() {
      const now = new Date();
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istMs = utcMs + (5.5 * 3600000);
      return new Date(istMs);
    }

    function calculateTelemetry() {
      const nowIST = getNowIST();
      const currentMinsOfDay = nowIST.getHours() * 60 + nowIST.getMinutes() + (nowIST.getSeconds() / 60);

      function getAccountState(accNum, accName) {
        const accPings = SCHEDULE.filter(s => s.account === accNum);
        
        let mostRecent = null;
        let elapsedSinceRecent = Infinity;

        for (const p of accPings) {
          let diff = currentMinsOfDay - p.minsOfDay;
          if (diff < 0) diff += 1440;
          if (diff < elapsedSinceRecent) {
            elapsedSinceRecent = diff;
            mostRecent = p;
          }
        }

        let nextPing = null;
        let minsUntilNext = Infinity;
        for (const p of accPings) {
          let diff = p.minsOfDay - currentMinsOfDay;
          if (diff < 0) diff += 1440;
          if (diff < minsUntilNext) {
            minsUntilNext = diff;
            nextPing = p;
          }
        }

        const isActive = elapsedSinceRecent < WINDOW_DURATION_MINS;
        const minsLeftInWindow = isActive ? (WINDOW_DURATION_MINS - elapsedSinceRecent) : 0;
        const percentLeft = Math.max(0, Math.min(100, Math.round((minsLeftInWindow / WINDOW_DURATION_MINS) * 100)));

        return {
          account: accNum,
          name: accName,
          mostRecent,
          nextPing,
          elapsedSinceRecent,
          minsLeftInWindow,
          minsUntilNext,
          percentLeft,
          isActive
        };
      }

      const acc1 = getAccountState(1, 'shlokshah412');
      const acc2 = getAccountState(2, 'pcgpt');

      let recommendedAcc = 1;
      let reason = '';

      if (currentTaskMode === 'quick') {
        if (acc1.isActive && acc2.isActive) {
          if (acc2.minsLeftInWindow > 0 && acc2.minsLeftInWindow <= 90 && acc1.minsLeftInWindow > 90) {
            recommendedAcc = 2;
            reason = 'pcgpt expires in ' + formatHoursMins(acc2.minsLeftInWindow) + '. Burn its expiring quota for quick queries without touching shlokshah412.';
          } else if (acc1.minsLeftInWindow > 0 && acc1.minsLeftInWindow <= 90 && acc2.minsLeftInWindow > 90) {
            recommendedAcc = 1;
            reason = 'shlokshah412 expires in ' + formatHoursMins(acc1.minsLeftInWindow) + '. Burn its expiring quota for quick queries without touching pcgpt.';
          } else if (acc1.minsLeftInWindow <= acc2.minsLeftInWindow) {
            recommendedAcc = 1;
            reason = 'shlokshah412 is closer to expiry (' + formatHoursMins(acc1.minsLeftInWindow) + ' left). Ideal for quick queries.';
          } else {
            recommendedAcc = 2;
            reason = 'pcgpt is closer to expiry (' + formatHoursMins(acc2.minsLeftInWindow) + ' left). Ideal for quick queries.';
          }
        } else if (acc1.isActive) {
          recommendedAcc = 1;
          reason = 'shlokshah412 active (' + formatHoursMins(acc1.minsLeftInWindow) + ' remaining).';
        } else if (acc2.isActive) {
          recommendedAcc = 2;
          reason = 'pcgpt active (' + formatHoursMins(acc2.minsLeftInWindow) + ' remaining).';
        } else {
          recommendedAcc = (acc1.minsUntilNext <= acc2.minsUntilNext) ? 1 : 2;
          reason = 'Both idle; ' + (recommendedAcc === 1 ? 'shlokshah412' : 'pcgpt') + ' resets soonest.';
        }
      } else {
        if (acc1.isActive && !acc2.isActive) {
          recommendedAcc = 1;
          reason = 'shlokshah412 active with ' + formatHoursMins(acc1.minsLeftInWindow) + ' left (full sprint capacity).';
        } else if (!acc1.isActive && acc2.isActive) {
          recommendedAcc = 2;
          reason = 'pcgpt active with ' + formatHoursMins(acc2.minsLeftInWindow) + ' left (full sprint capacity).';
        } else if (acc1.isActive && acc2.isActive) {
          if (acc1.minsLeftInWindow >= acc2.minsLeftInWindow) {
            recommendedAcc = 1;
            reason = 'shlokshah412 has the freshest limit (' + formatHoursMins(acc1.minsLeftInWindow) + ' left vs ' + formatHoursMins(acc2.minsLeftInWindow) + ' on pcgpt).';
          } else {
            recommendedAcc = 2;
            reason = 'pcgpt has the freshest limit (' + formatHoursMins(acc2.minsLeftInWindow) + ' left vs ' + formatHoursMins(acc1.minsLeftInWindow) + ' on shlokshah412).';
          }
        } else {
          recommendedAcc = (acc1.minsUntilNext <= acc2.minsUntilNext) ? 1 : 2;
          reason = 'Both cooling; ' + (recommendedAcc === 1 ? 'shlokshah412' : 'pcgpt') + ' resets first in ' + formatHoursMins(recommendedAcc === 1 ? acc1.minsUntilNext : acc2.minsUntilNext) + '.';
        }
      }

      recommendedTargetAccount = recommendedAcc;
      return { nowIST, currentMinsOfDay, acc1, acc2, recommendedAcc, reason };
    }

    function formatHoursMins(totalMins) {
      const h = Math.floor(totalMins / 60);
      const m = Math.floor(totalMins % 60);
      if (h === 0) return m + 'm';
      return h + 'h ' + m + 'm';
    }

    function formatTimeDisplay(date) {
      return date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    function updateUI() {
      const data = calculateTelemetry();

      document.getElementById('headerClock').innerText = formatTimeDisplay(data.nowIST);

      const isAcc1 = data.recommendedAcc === 1;
      const recBadge = document.getElementById('recBadge');
      const heroCta = document.getElementById('heroCta');
      
      recBadge.className = 'rec-badge ' + (isAcc1 ? '' : 'pcgpt-badge');
      document.getElementById('recBadgeText').innerText = isAcc1 ? 'OPTIMAL: SHLOKSHAH412' : 'OPTIMAL: PCGPT';
      document.getElementById('heroTitle').innerText = isAcc1 ? 'Use shlokshah412' : 'Use pcgpt';
      document.getElementById('heroReason').innerText = data.reason;
      
      const nextPingOverall = (data.acc1.minsUntilNext < data.acc2.minsUntilNext) ? data.acc1 : data.acc2;
      document.getElementById('recNextReset').innerText = 'Next reset: ' + nextPingOverall.name + ' in ' + formatHoursMins(nextPingOverall.minsUntilNext);

      heroCta.className = 'launch-cta ' + (isAcc1 ? '' : 'pcgpt-cta');
      document.getElementById('heroCtaText').innerText = 'Open Claude as ' + (isAcc1 ? 'shlokshah412' : 'pcgpt');

      const fullCircumference = 213.6;
      
      // Update shlokshah412
      document.getElementById('acc1Circle').style.strokeDashoffset = fullCircumference * (1 - data.acc1.percentLeft / 100);
      document.getElementById('acc1TimeRemaining').innerText = data.acc1.isActive ? (formatHoursMins(data.acc1.minsLeftInWindow) + ' Left') : 'Idle (0m Left)';
      document.getElementById('acc1NextPing').innerText = 'Next: ' + data.acc1.nextPing.display;

      const acc1StatusTag = document.getElementById('acc1StatusTag');
      if (data.acc1.isActive) {
        acc1StatusTag.className = 'acc-status-tag active';
        acc1StatusTag.innerText = 'ACTIVE';
      } else {
        acc1StatusTag.className = 'acc-status-tag';
        acc1StatusTag.innerText = 'IDLE';
      }

      // Update pcgpt
      document.getElementById('acc2Circle').style.strokeDashoffset = fullCircumference * (1 - data.acc2.percentLeft / 100);
      document.getElementById('acc2TimeRemaining').innerText = data.acc2.isActive ? (formatHoursMins(data.acc2.minsLeftInWindow) + ' Left') : 'Idle (0m Left)';
      document.getElementById('acc2NextPing').innerText = 'Next: ' + data.acc2.nextPing.display;

      const acc2StatusTag = document.getElementById('acc2StatusTag');
      if (data.acc2.isActive) {
        acc2StatusTag.className = 'acc-status-tag active';
        acc2StatusTag.innerText = 'ACTIVE';
      } else {
        acc2StatusTag.className = 'acc-status-tag';
        acc2StatusTag.innerText = 'IDLE';
      }

      // Update Dual-Lane Cursor
      const percentOfDay = (data.currentMinsOfDay / 1440) * 100;
      document.getElementById('cursorLane1').style.left = percentOfDay + '%';
      document.getElementById('cursorLane2').style.left = percentOfDay + '%';

      if (!selectedScheduleItem) {
        document.getElementById('bubbleAccPill').className = 'inspect-acc-pill now';
        document.getElementById('bubbleAccPill').innerText = 'LIVE NOW';
        document.getElementById('bubbleTime').innerText = formatTimeDisplay(data.nowIST);
        document.getElementById('bubbleTag').innerText = 'Current Position';
        document.getElementById('bubbleDiff').innerText = 'Next: ' + nextPingOverall.name + ' in ' + formatHoursMins(nextPingOverall.minsUntilNext);
      }
    }

    function inspectScheduleItem(item) {
      selectedScheduleItem = item;
      const nowIST = getNowIST();
      const currentMinsOfDay = nowIST.getHours() * 60 + nowIST.getMinutes() + (nowIST.getSeconds() / 60);
      
      let diff = item.minsOfDay - currentMinsOfDay;
      let diffText = '';
      if (diff > 0) {
        diffText = 'in ' + formatHoursMins(diff);
      } else if (diff < 0) {
        let passed = currentMinsOfDay - item.minsOfDay;
        diffText = formatHoursMins(passed) + ' ago';
      } else {
        diffText = 'Right now';
      }

      const isAcc1 = (item.account === 1);
      const pill = document.getElementById('bubbleAccPill');
      pill.className = 'inspect-acc-pill ' + (isAcc1 ? 'acc1' : 'acc2');
      pill.innerText = item.name;

      document.getElementById('bubbleTime').innerText = item.display;
      document.getElementById('bubbleTag').innerText = item.tag;
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
          row.className = 'schedule-item highlighted ' + (isAcc1 ? 'acc1-item' : 'acc2-item');
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
      const track1 = document.getElementById('trackAcc1');
      const track2 = document.getElementById('trackAcc2');
      const list = document.getElementById('scheduleList');
      list.innerHTML = '';

      track1.querySelectorAll('.lane-node').forEach(n => n.remove());
      track2.querySelectorAll('.lane-node').forEach(n => n.remove());

      SCHEDULE.forEach((item) => {
        const node = document.createElement('div');
        node.className = 'lane-node ' + (item.account === 1 ? 'acc1' : 'acc2');
        node.dataset.id = item.id;
        node.style.left = (item.minsOfDay / 1440 * 100) + '%';
        node.title = item.name + ' @ ' + item.display + ' (' + item.tag + ')';
        
        node.onclick = (e) => {
          e.stopPropagation();
          if (pinnedItem && pinnedItem.id === item.id) {
            pinnedItem = null;
            inspectNow();
          } else {
            pinnedItem = item;
            inspectScheduleItem(item);
          }
        };
        node.onmouseenter = () => {
          if (!pinnedItem) inspectScheduleItem(item);
        };
        node.onmouseleave = () => {
          if (!pinnedItem) inspectNow();
        };

        if (item.account === 1) {
          track1.appendChild(node);
        } else {
          track2.appendChild(node);
        }

        const row = document.createElement('div');
        row.className = 'schedule-item';
        row.dataset.id = item.id;
        row.onclick = (e) => {
          e.stopPropagation();
          if (pinnedItem && pinnedItem.id === item.id) {
            pinnedItem = null;
            inspectNow();
          } else {
            pinnedItem = item;
            inspectScheduleItem(item);
          }
        };
        row.onmouseenter = () => {
          if (!pinnedItem) inspectScheduleItem(item);
        };
        row.onmouseleave = () => {
          if (!pinnedItem) inspectNow();
        };
        row.innerHTML = \`
          <div class="schedule-left">
            <div class="schedule-acc-dot \${item.account === 1 ? 'acc1' : 'acc2'}"></div>
            <div>
              <span class="schedule-time">\${item.display}</span>
              <span class="schedule-name-tag \${item.account === 1 ? 'acc1-name' : 'acc2-name'}">\${item.name}</span>
            </div>
          </div>
          <div class="schedule-right">
            <span class="safe-buffer-badge">+2m</span>
            <span>\${item.tag}</span>
          </div>
        \`;
        list.appendChild(row);
      });
    }

    function addConsoleLog(msg, type = 'normal') {
      const consoleBox = document.getElementById('consoleLogs');
      const line = document.createElement('div');
      line.className = 'log-line';
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      line.innerHTML = \`<span class="log-time">[\${time}]</span><span class="log-msg \${type}">\${msg}</span>\`;
      consoleBox.appendChild(line);
      consoleBox.scrollTop = consoleBox.scrollHeight;
    }

    function closeModal() {
      document.getElementById('confirmModal').classList.remove('open');
      const cancelBtn = document.querySelector('.btn-modal-cancel');
      if (cancelBtn) cancelBtn.style.display = '';
      const modalActions = document.getElementById('modalActions');
      if (modalActions) modalActions.style.gridTemplateColumns = '1fr 1fr';
    }

    // LIVE DIAGNOSTICS CHECK (NO PING)
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
        const acc1Ok = data.credentials?.shlokshah412?.configured;
        const acc2Ok = data.credentials?.pcgpt?.configured;

        let html = '<div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem;">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Cloudflare Edge Worker:</span> <strong style="color: var(--success-green);">ONLINE (' + latency + 'ms)</strong></div>';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Browserless API:</span> <strong style="color: ' + (bConnected ? 'var(--success-green)' : 'var(--danger-red)') + ';">' + (bConnected ? 'CONNECTED' : 'ERROR') + '</strong></div>';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>shlokshah412 Secret:</span> <strong style="color: ' + (acc1Ok ? 'var(--acc1-cyan)' : 'var(--danger-red)') + ';">' + (acc1Ok ? 'READY' : 'MISSING') + '</strong></div>';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>pcgpt Secret:</span> <strong style="color: ' + (acc2Ok ? 'var(--acc2-purple)' : 'var(--danger-red)') + ';">' + (acc2Ok ? 'READY' : 'MISSING') + '</strong></div>';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><span>Server IST Time:</span> <strong style="color: #fff; font-family: monospace;">' + data.timestamp.ist.split(',')[1] + '</strong></div>';
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
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const confirmBtn = document.getElementById('modalConfirmBtn');

      title.innerText = 'Trigger ' + label + '?';
      body.innerHTML = 'This will immediately dispatch a headless browser session on <strong>Browserless.io</strong> to send a keep-alive character (<code style="color: #fff; font-family: monospace;">.</code>) and refresh your 5-hour limit.';

      confirmBtn.className = 'btn-modal btn-modal-confirm ' + (target === 2 ? 'acc2-confirm' : '');
      confirmBtn.innerText = 'Dispatch Ping';
      confirmBtn.onclick = () => {
        closeModal();
        triggerPing(target);
      };

      modal.classList.add('open');
    }

    function openLaunchDialog(accNum) {
      const accName = (accNum === 1) ? 'shlokshah412' : 'pcgpt';
      const isAcc2 = (accNum === 2);
      const modal = document.getElementById('confirmModal');
      const title = document.getElementById('modalTitle');
      const body = document.getElementById('modalBody');
      const confirmBtn = document.getElementById('modalConfirmBtn');

      title.innerText = 'Launch ' + accName;
      body.innerHTML = 'Make sure your current browser tab or mobile app is logged in as <strong style="color: ' + (isAcc2 ? 'var(--acc2-purple)' : 'var(--acc1-cyan)') + ';">' + accName + '</strong> before opening Claude.';

      confirmBtn.className = 'btn-modal btn-modal-confirm ' + (isAcc2 ? 'acc2-confirm' : '');
      confirmBtn.innerText = 'Open Claude.ai';
      confirmBtn.onclick = () => {
        closeModal();
        window.open('https://claude.ai', '_blank', 'noopener,noreferrer');
      };

      modal.classList.add('open');
    }

    async function triggerPing(target) {
      const statusText = document.getElementById('pingStatusText');
      statusText.innerText = 'Pinging...';
      statusText.style.color = 'var(--warning-amber)';

      const endpoint = (target === 'all') ? '/api/ping' : ('/api/ping?account=' + target);
      const targetLabel = (target === 'all') ? 'Both Accounts' : (target === 1 ? 'shlokshah412' : 'pcgpt');

      addConsoleLog('Dispatching headless browser request for ' + targetLabel + '...', 'normal');

      try {
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          data.results.forEach(r => {
            if (r.result && r.result.success) {
              addConsoleLog('SUCCESS: ' + r.account + ' ➔ ' + (r.result.pageTitle || 'Ping sent'), 'success');
            } else {
              addConsoleLog('ERROR: ' + r.account + ' ➔ ' + (r.result?.error || 'Execution failed'), 'error');
            }
          });
        } else {
          addConsoleLog('Response: ' + JSON.stringify(data), 'normal');
        }

        statusText.innerText = 'Success';
        statusText.style.color = 'var(--success-green)';
        setTimeout(() => { statusText.innerText = 'Ready'; }, 3000);
      } catch (err) {
        addConsoleLog('Network / Worker Error: ' + err.message, 'error');
        statusText.innerText = 'Failed';
        statusText.style.color = 'var(--danger-red)';
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
    renderScheduleList();
    updateUI();
    setInterval(updateUI, 1000);
  </script>
</body>
</html>`;
}
