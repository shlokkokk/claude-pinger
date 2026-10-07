import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateQueuePayload, calculateTargetTimestamp, parseRateLimitNotice, TaskScheduler } from '../src/index.js';

describe('Overnight Autopilot Queue Payload Validation', () => {
  test('accepts valid payload with explicit prompt', () => {
    const input = {
      accountId: 1,
      chatUrl: 'https://claude.ai/chat/e48b1111-2222-3333-4444-555566667777',
      prompt: 'continue research on vector databases'
    };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, true);
    assert.equal(res.data.accountId, 1);
    assert.equal(res.data.prompt, 'continue research on vector databases');
    assert.equal(res.data.targetType, 'next');
  });

  test('defaults prompt to "continue" when omitted or empty', () => {
    const input = {
      accountId: 2,
      chatUrl: 'https://claude.ai/chat/e48b1111-2222-3333-4444-555566667777'
    };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, true);
    assert.equal(res.data.prompt, 'continue');
  });

  test('accepts slot-targeted payload for future execution', () => {
    const input = {
      accountId: 1,
      chatUrl: 'https://claude.ai/chat/e48b1111-2222-3333-4444-555566667777',
      prompt: 'continue at 3:30 PM',
      targetType: 'slot',
      targetSlot: 5,
      targetSlotDisplay: 'Slot 5 (03:30 PM)'
    };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, true);
    assert.equal(res.data.targetType, 'slot');
    assert.equal(res.data.targetSlot, 5);
    assert.equal(res.data.targetSlotDisplay, 'Slot 5 (03:30 PM)');
  });

  test('accepts exact-time payload with computed timestamp', () => {
    const input = {
      accountId: 2,
      chatUrl: 'https://claude.ai/chat/e48b1111-2222-3333-4444-555566667777',
      prompt: 'continue right after reset',
      targetType: 'time',
      targetTime: '03:42 AM',
      targetTimestamp: 1728166920000
    };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, true);
    assert.equal(res.data.targetType, 'time');
    assert.equal(res.data.targetTime, '03:42 AM');
    assert.equal(res.data.targetTimestamp, 1728166920000);
  });

  test('rejects payload missing accountId', () => {
    const input = {
      chatUrl: 'https://claude.ai/chat/e48b1111-2222-3333-4444-555566667777'
    };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, false);
    assert.match(res.error, /Target account ID is required/);
  });

  test('rejects payload missing chatUrl', () => {
    const input = { accountId: 1, prompt: 'hello' };
    const res = validateQueuePayload(input);
    assert.equal(res.valid, false);
    assert.match(res.error, /Claude chat URL is required/);
  });
});

describe('Dynamic Reset Time Calculation & Notice Parser', () => {
  test('extracts reset time from Claude rate-limit banner', () => {
    const notice1 = "You've reached your message limit until 3:42 AM";
    assert.equal(parseRateLimitNotice(notice1), '3:42 AM');

    const notice2 = "You are out of messages until 04:15 PM.";
    assert.equal(parseRateLimitNotice(notice2), '04:15 PM');

    const notice3 = "Limit reached. You can send messages at 7 PM.";
    assert.equal(parseRateLimitNotice(notice3), '7:00 PM');
  });

  test('calculates forward-looking UTC timestamp from IST time string', () => {
    const timestamp = calculateTargetTimestamp('10:30 AM');
    assert.ok(typeof timestamp === 'number');
    assert.ok(timestamp > 0);
  });

  test('correctly handles 24-hour time strings and 12-hour AM/PM boundaries', () => {
    const t1 = calculateTargetTimestamp('11:50');
    assert.ok(t1 > 0);
    const d1 = new Date(t1 + 5.5 * 3600000);
    assert.equal(d1.getUTCHours(), 11);
    assert.equal(d1.getUTCMinutes(), 50);

    const t2 = calculateTargetTimestamp('12:00 PM');
    const d2 = new Date(t2 + 5.5 * 3600000);
    assert.equal(d2.getUTCHours(), 12);
    assert.equal(d2.getUTCMinutes(), 0);

    const t3 = calculateTargetTimestamp('12:00 AM');
    const d3 = new Date(t3 + 5.5 * 3600000);
    assert.equal(d3.getUTCHours(), 0);
    assert.equal(d3.getUTCMinutes(), 0);

    const t4 = calculateTargetTimestamp('23:50');
    const d4 = new Date(t4 + 5.5 * 3600000);
    assert.equal(d4.getUTCHours(), 23);
    assert.equal(d4.getUTCMinutes(), 50);

    // 24h midnight representation
    const t5 = calculateTargetTimestamp('00:00');
    const d5 = new Date(t5 + 5.5 * 3600000);
    assert.equal(d5.getUTCHours(), 0);
    assert.equal(d5.getUTCMinutes(), 0);
  });

  test('correctly parses time strings with explicit timezone suffixes and shorthands', () => {
    const tIST1 = calculateTargetTimestamp('12:00 AM IST');
    assert.ok(tIST1 > 0);
    const dIST1 = new Date(tIST1 + 5.5 * 3600000);
    assert.equal(dIST1.getUTCHours(), 0);
    assert.equal(dIST1.getUTCMinutes(), 0);

    const tIST2 = calculateTargetTimestamp('03:31 AM IST');
    assert.ok(tIST2 > 0);
    const dIST2 = new Date(tIST2 + 5.5 * 3600000);
    assert.equal(dIST2.getUTCHours(), 3);
    assert.equal(dIST2.getUTCMinutes(), 31);

    const tShorthand = calculateTargetTimestamp('12 AM');
    assert.ok(tShorthand > 0);
    const dShort = new Date(tShorthand + 5.5 * 3600000);
    assert.equal(dShort.getUTCHours(), 0);
    assert.equal(dShort.getUTCMinutes(), 0);

    const t24IST = calculateTargetTimestamp('00:00 IST');
    assert.ok(t24IST > 0);
    const d24IST = new Date(t24IST + 5.5 * 3600000);
    assert.equal(d24IST.getUTCHours(), 0);
    assert.equal(d24IST.getUTCMinutes(), 0);
  });

  test('returns null for invalid time strings', () => {
    assert.equal(calculateTargetTimestamp('invalid-time'), null);
    assert.equal(calculateTargetTimestamp('25:00'), null);
    assert.equal(calculateTargetTimestamp('12:61'), null);
    assert.equal(calculateTargetTimestamp(''), null);
  });
});

describe('TaskScheduler Durable Object Precision Scheduling', () => {
  function createMockDO() {
    const memory = new Map();
    let currentAlarm = null;
    const mockStorage = {
      async get(key) { return memory.get(key); },
      async put(key, val) { memory.set(key, val); },
      async delete(key) { memory.delete(key); },
      async getAlarm() { return currentAlarm; },
      async setAlarm(ts) { currentAlarm = ts; },
      async deleteAlarm() { currentAlarm = null; }
    };
    const mockEnv = {
      TASK_QUEUE: {
        async get() { return null; },
        async put() {},
        async delete() {}
      }
    };
    const scheduler = new TaskScheduler({ storage: mockStorage }, mockEnv);
    return { scheduler, mockStorage };
  }

  test('upserts timed task and sets precision alarm immediately without KV lag', async () => {
    const { scheduler, mockStorage } = createMockDO();
    const futureTime = Date.now() + 60000;
    const task = {
      id: 'task_123',
      accountId: 1,
      accountName: 'test_account',
      chatUrl: 'https://claude.ai/chat/11111111-2222-3333-4444-555566667777',
      prompt: 'hello world',
      targetType: 'time',
      targetTime: '12:00 AM IST',
      targetTimestamp: futureTime,
      status: 'queued'
    };

    await scheduler.syncAlarm({ action: 'upsert', task });
    const alarm = await mockStorage.getAlarm();
    assert.equal(alarm, futureTime);

    const stored = await scheduler.getStoredTasks();
    assert.ok(stored.task_123);
    assert.equal(stored.task_123.prompt, 'hello world');
  });

  test('deleting a task clears or reschedules the alarm', async () => {
    const { scheduler, mockStorage } = createMockDO();
    const task = {
      id: 'task_to_del',
      accountId: 1,
      targetType: 'time',
      targetTimestamp: Date.now() + 50000,
      status: 'queued'
    };
    await scheduler.syncAlarm({ action: 'upsert', task });
    assert.ok((await mockStorage.getAlarm()) > 0);

    await scheduler.syncAlarm({ action: 'delete', taskId: 'task_to_del' });
    const alarmAfter = await mockStorage.getAlarm();
    assert.equal(alarmAfter, null);
  });

  test('prioritizes earliest timestamp among multiple queued tasks', async () => {
    const { scheduler, mockStorage } = createMockDO();
    const now = Date.now();
    const taskLate = {
      id: 'task_late',
      accountId: 1,
      targetType: 'time',
      targetTimestamp: now + 3600000, // +1 hour
      status: 'queued'
    };
    const taskEarly = {
      id: 'task_early',
      accountId: 2,
      targetType: 'time',
      targetTimestamp: now + 600000, // +10 mins
      status: 'queued'
    };

    // Upsert late task first
    await scheduler.syncAlarm({ action: 'upsert', task: taskLate });
    assert.equal(await mockStorage.getAlarm(), taskLate.targetTimestamp);

    // Upsert early task second -> alarm must shift to earlier task immediately
    await scheduler.syncAlarm({ action: 'upsert', task: taskEarly });
    assert.equal(await mockStorage.getAlarm(), taskEarly.targetTimestamp);
  });

  test('schedules immediate alarm trigger for already overdue tasks', async () => {
    const { scheduler, mockStorage } = createMockDO();
    const pastTimestamp = Date.now() - 10000; // 10s in the past
    const taskOverdue = {
      id: 'task_overdue',
      accountId: 1,
      targetType: 'time',
      targetTimestamp: pastTimestamp,
      status: 'queued'
    };

    await scheduler.syncAlarm({ action: 'upsert', task: taskOverdue });
    const alarm = await mockStorage.getAlarm();
    assert.ok(alarm >= Date.now()); // Scheduled for now + 500ms
  });
});

