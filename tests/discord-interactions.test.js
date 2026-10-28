import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyDiscordSignature,
  buildTelemetryEmbed,
  buildControlComponents,
  buildQueueEmbed,
  buildContextualAlert,
  buildTaskScheduledCard,
  buildTaskExecutedCard,
  buildTaskCompletedDisabledCard,
  buildDigestEmbed,
  DISCORD_COLORS
} from '../src/discord.js';
import { sendNotification } from '../src/index.js';

describe('Discord Bot & Interactions Engine', () => {
  const sampleAccounts = [
    { id: 1, name: 'shlokshah412', keyLength: 131, themeColor: '#00f2fe' },
    { id: 2, name: 'pcgpt', keyLength: 131, themeColor: '#c084fc' }
  ];

  test('verifyDiscordSignature rejects missing parameters', async () => {
    assert.equal(await verifyDiscordSignature(null, 'sig', 'time', 'body'), false);
    assert.equal(await verifyDiscordSignature('pubkey', null, 'time', 'body'), false);
    assert.equal(await verifyDiscordSignature('pubkey', 'sig', null, 'body'), false);
    assert.equal(await verifyDiscordSignature('pubkey', 'sig', 'time', null), false);
  });

  test('verifyDiscordSignature rejects invalid signatures', async () => {
    // Valid 32-byte hex key and 64-byte hex sig
    const fakeKey = '0'.repeat(64);
    const fakeSig = '0'.repeat(128);
    const result = await verifyDiscordSignature(fakeKey, fakeSig, '1234567890', '{"type":1}');
    assert.equal(result, false);
  });

  test('buildTelemetryEmbed contains clean, non-AI-slop executive format', () => {
    const embed = buildTelemetryEmbed(sampleAccounts, 'BOM', { active: 1, completed: 5 }, { hasActiveAlarm: true, earliestTimestamp: Date.now() + 60000 });
    assert.equal(embed.title, 'Edge Control Deck');
    assert.equal(embed.color, DISCORD_COLORS.TELEMETRY);
    assert.ok(embed.fields.some(f => f.name.includes('shlokshah412')));
    assert.ok(embed.fields.some(f => f.name.includes('pcgpt')));
    assert.ok(embed.fields.some(f => f.value.includes('BOM')));
    // Check absence of AI-slop emojis in author and title
    assert.ok(!embed.title.includes('⚡'));
    assert.ok(!embed.title.includes('🤖'));
    assert.ok(!embed.title.includes('🚀'));
  });

  test('buildControlComponents generates non-redundant action buttons', () => {
    const rows = buildControlComponents(sampleAccounts, true);
    assert.equal(rows.length, 3);

    // Row 1: Native String Select Menu with Checkboxes
    const selectMenu = rows[0].components[0];
    assert.equal(selectMenu.type, 3);
    assert.equal(selectMenu.custom_id, 'select_ping_accounts');
    assert.ok(selectMenu.options.some(o => o.value === 'all'));
    assert.ok(selectMenu.options.some(o => o.value === '1' && o.label === 'shlokshah412'));
    assert.ok(selectMenu.options.some(o => o.value === '2' && o.label === 'pcgpt'));

    // Row 2: Queue controls
    const r2 = rows[1].components;
    assert.ok(r2.some(b => b.custom_id === 'open_schedule_modal'));
    assert.ok(r2.some(b => b.custom_id === 'force_run_next' && b.disabled === false));
    assert.ok(r2.some(b => b.custom_id === 'prune_stale_chats'));
    assert.ok(r2.some(b => b.custom_id === 'clear_history'));
    assert.ok(r2.some(b => b.custom_id === 'refresh_status'));

    // Row 3: Link buttons
    const r3 = rows[2].components;
    assert.ok(r3.some(b => b.style === 5 && b.url.includes('workers.dev')));
  });

  test('buildContextualAlert does NOT attach redundant Ping Now button on success', () => {
    const alert = buildContextualAlert('task_completed', {
      accountName: 'shlokshah412',
      accountId: 1,
      prompt: 'Review commit diff',
      url: 'https://claude.ai/chat/sample-uuid',
      pageTitle: 'Summary ready',
      responseSnippet: 'I reviewed the diff and all changes look clean.',
      hasMoreQueuedTasks: false
    });

    assert.equal(alert.embed.title, '[TASK COMPLETED] shlokshah412');
    assert.equal(alert.embed.color, DISCORD_COLORS.SUCCESS);

    const buttons = alert.components[0].components;
    // Verify NO "Ping Now" button exists
    assert.ok(!buttons.some(b => b.label && b.label.toLowerCase().includes('ping now')));
    assert.ok(buttons.some(b => b.label === 'Open Claude Chat'));
    assert.ok(buttons.some(b => b.label === 'Web Dashboard'));

    // Verify Chat Title and Claude Response Preview exist
    assert.ok(alert.embed.fields.some(f => f.name === 'Chat Title'));
    assert.ok(alert.embed.fields.some(f => f.name === 'Claude Response Preview'));
    assert.ok(!alert.embed.fields.some(f => f.name === 'Thread Title'));
    assert.ok(!alert.embed.fields.some(f => f.name === 'Claude Chat Link'));
  });

  test('buildContextualAlert attaches Update Session Key modal button on session_expired', () => {
    const alert = buildContextualAlert('session_expired', {
      accountName: 'shlokshah412',
      accountId: 1
    });

    assert.equal(alert.embed.title, '[SESSION EXPIRED] shlokshah412');
    assert.equal(alert.embed.color, DISCORD_COLORS.ERROR);

    const buttons = alert.components[0].components;
    assert.ok(buttons.some(b => b.custom_id === 'open_session_modal_1' && b.label === 'Update Session Key'));
    assert.ok(buttons.some(b => b.custom_id === 'verify_session_1'));
  });

  test('buildContextualAlert attaches Force Run Next Task only when pending tasks exist', () => {
    const alertWithMore = buildContextualAlert('task_completed', {
      accountName: 'shlokshah412',
      accountId: 1,
      prompt: 'Review commit diff',
      url: 'https://claude.ai/chat/sample-uuid',
      pageTitle: 'Summary ready',
      hasMoreQueuedTasks: true
    });
    const buttonsWithMore = alertWithMore.components[0].components;
    assert.ok(buttonsWithMore.some(b => b.custom_id === 'force_run_next'));

    const alertWithoutMore = buildContextualAlert('task_completed', {
      accountName: 'shlokshah412',
      accountId: 1,
      prompt: 'Review commit diff',
      url: 'https://claude.ai/chat/sample-uuid',
      pageTitle: 'Summary ready',
      hasMoreQueuedTasks: false
    });
    const buttonsWithoutMore = alertWithoutMore.components[0].components;
    assert.ok(!buttonsWithoutMore.some(b => b.custom_id === 'force_run_next'));
  });

  test('buildContextualAlert attaches Retry button on failure', () => {
    const alert = buildContextualAlert('task_failed', {
      accountName: 'pcgpt',
      accountId: 2,
      prompt: 'Continue test',
      error: 'Navigation timeout',
      taskId: 'task_123'
    });

    assert.equal(alert.embed.title, '[TASK FAILED] pcgpt');
    assert.equal(alert.embed.color, DISCORD_COLORS.WARNING);

    const buttons = alert.components[0].components;
    assert.ok(buttons.some(b => b.custom_id === 'retry_task_task_123'));
    assert.ok(buttons.some(b => b.label === 'Web Dashboard'));
  });

  test('buildTaskScheduledCard generates interactive snooze and edit buttons', () => {
    const card = buildTaskScheduledCard({
      id: 'task_abc_123',
      prompt: 'Check CI pipeline status',
      chatUrl: 'https://claude.ai/chat/sample-uuid',
      targetTimestamp: Date.now() + 3600000
    }, sampleAccounts[0]);

    assert.equal(card.embed.title, '[TASK SCHEDULED] shlokshah412');
    assert.equal(card.embed.color, DISCORD_COLORS.SUCCESS);

    const buttons = card.components[0].components;
    assert.ok(buttons.some(b => b.custom_id === 'snooze_task_task_abc_123_1h' && b.label === '+1h Snooze'));
    assert.ok(!buttons.some(b => b.custom_id?.includes('5h')));
    assert.ok(buttons.some(b => b.custom_id === 'edit_prompt_task_abc_123' && b.label === 'Edit Prompt'));
    assert.ok(buttons.some(b => b.custom_id === 'force_run_task_task_abc_123' && b.label === 'Run Now'));
    assert.ok(buttons.some(b => b.label === 'Open Claude Chat'));
  });

  test('buildTaskExecutedCard retires action buttons and displays running state', () => {
    const card = buildTaskExecutedCard({
      id: 'task_abc_123',
      prompt: 'Check CI pipeline status',
      chatUrl: 'https://claude.ai/chat/sample-uuid'
    }, sampleAccounts[0]);

    assert.equal(card.embed.title, '[TASK RUNNING] shlokshah412');
    assert.equal(card.embed.color, DISCORD_COLORS.TELEMETRY);

    // Verify all action buttons are stripped
    const buttons = card.components[0].components;
    assert.ok(!buttons.some(b => b.custom_id?.includes('snooze')));
    assert.ok(!buttons.some(b => b.custom_id?.includes('edit_prompt')));
    assert.ok(!buttons.some(b => b.custom_id?.includes('force_run')));
    assert.ok(buttons.some(b => b.label === 'Open Claude Chat'));
    assert.ok(buttons.some(b => b.label === 'Web Dashboard'));
  });

  test('buildTaskCompletedDisabledCard retires action buttons for completed tasks', () => {
    const card = buildTaskCompletedDisabledCard({
      id: 'task_abc_123',
      chatUrl: 'https://claude.ai/chat/sample-uuid'
    }, sampleAccounts[1]);

    assert.equal(card.embed.title, '[TASK COMPLETED] pcgpt');
    assert.equal(card.embed.color, DISCORD_COLORS.SUCCESS);

    const buttons = card.components[0].components;
    assert.ok(!buttons.some(b => b.custom_id?.includes('snooze')));
    assert.ok(!buttons.some(b => b.custom_id?.includes('edit_prompt')));
    assert.ok(!buttons.some(b => b.custom_id?.includes('force_run')));
    assert.ok(buttons.some(b => b.label === 'Open Claude Chat'));
  });

  test('buildDigestEmbed compiles executive daily briefing', () => {
    const digest = buildDigestEmbed(sampleAccounts, {
      1: [{ status: 'queued' }],
      2: [{ status: 'completed' }, { status: 'completed' }]
    });

    assert.equal(digest.title, 'Autopilot Status & Rolling Limit Briefing');
    assert.equal(digest.color, DISCORD_COLORS.TELEMETRY);
    assert.ok(digest.fields.some(f => f.name === 'Account Health'));
    assert.ok(digest.fields.some(f => f.value.includes('shlokshah412')));
    assert.ok(digest.fields.some(f => f.value.includes('1` pending tasks')));
  });

  test('sendNotification safely runs with TELEGRAM_BOT_TOKEN without ReferenceError and dispatches task_completed', async () => {
    let capturedUrl = null;
    let capturedBody = null;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedBody = options?.body;
      return {
        ok: true,
        status: 200,
        text: async () => '{"id":"mock_msg_id"}'
      };
    };

    try {
      const mockEnv = {
        TELEGRAM_BOT_TOKEN: 'mock_tg_token',
        TELEGRAM_CHAT_ID: 'mock_chat_id',
        DISCORD_BOT_TOKEN: 'mock_bot_token',
        DISCORD_CHANNEL_TASKS: '1565106148820910163'
      };

      // Must NOT throw ReferenceError: tgChatId is not defined
      await assert.doesNotReject(async () => {
        await sendNotification(mockEnv, {
          type: 'task_completed',
          accountName: 'pcgpt',
          accountId: 2,
          prompt: 'Execute code audit and report status',
          url: 'https://claude.ai/chat/mock-uuid',
          pageTitle: 'Code audit complete',
          fullResponse: 'Line 1: ok. Line 2: ok. All systems are green and functioning seamlessly across all edge locations.',
          taskId: 'task_unit_test'
        });
      });

      assert.ok(capturedUrl?.includes('1565106148820910163'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
