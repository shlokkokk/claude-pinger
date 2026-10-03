import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Overnight Autopilot Queue Payload Validation', () => {
  function validateQueuePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Request body must be a valid JSON object.' };
    }
    const { accountId, chatUrl, prompt } = payload;
    if (accountId === undefined || accountId === null || isNaN(Number(accountId))) {
      return { valid: false, error: 'Target account ID is required and must be numeric.' };
    }
    if (!chatUrl || typeof chatUrl !== 'string' || !chatUrl.trim()) {
      return { valid: false, error: 'A valid Claude chat URL is required.' };
    }
    const cleanPrompt = (prompt && typeof prompt === 'string') ? prompt.trim() : 'continue';
    return {
      valid: true,
      data: {
        accountId: Number(accountId),
        chatUrl: chatUrl.trim(),
        prompt: cleanPrompt
      }
    };
  }

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
