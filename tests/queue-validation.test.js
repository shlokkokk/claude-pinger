import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateQueuePayload, calculateTargetTimestamp, parseRateLimitNotice } from '../src/index.js';

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
  });

  test('returns null for invalid time strings', () => {
    assert.equal(calculateTargetTimestamp('invalid-time'), null);
    assert.equal(calculateTargetTimestamp('25:00'), null);
    assert.equal(calculateTargetTimestamp('12:61'), null);
    assert.equal(calculateTargetTimestamp(''), null);
  });
});
