import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeClaudeChatUrl } from '../src/index.js';

describe('Claude URL Normalization Engine', () => {
  const validUuid = 'e48b1111-2222-3333-4444-555566667777';
  const projectUuid = '12345678-1234-1234-1234-123456789abc';

  test('normalizes standard full HTTPS Claude chat URL', () => {
    const input = `https://claude.ai/chat/${validUuid}`;
    const result = normalizeClaudeChatUrl(input);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, validUuid);
    assert.equal(result.chatType, 'Standard Chat (UUID v4 Verified)');
    assert.equal(result.normalizedUrl, input);
  });

  test('normalizes URL without protocol (domain-only input)', () => {
    const input = `claude.ai/chat/${validUuid}`;
    const result = normalizeClaudeChatUrl(input);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, validUuid);
    assert.equal(result.normalizedUrl, `https://${input}`);
  });

  test('normalizes URL with www subdomain', () => {
    const input = `https://www.claude.ai/chat/${validUuid}`;
    const result = normalizeClaudeChatUrl(input);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, validUuid);
    assert.equal(result.normalizedUrl, input);
  });

  test('normalizes Claude project-scoped chat URL', () => {
    const input = `https://claude.ai/project/${projectUuid}/chat/${validUuid}`;
    const result = normalizeClaudeChatUrl(input);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, validUuid);
    assert.equal(result.chatType, 'Project Chat (UUID v4 Verified)');
    assert.equal(result.normalizedUrl, input);
  });

  test('normalizes bare UUID input into full Claude chat URL', () => {
    const result = normalizeClaudeChatUrl(validUuid);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, validUuid);
    assert.equal(result.normalizedUrl, `https://claude.ai/chat/${validUuid}`);
  });

  test('classifies alphanumeric custom slugs as Custom Claude Chat', () => {
    const input = 'https://claude.ai/chat/my-custom-thread-123';
    const result = normalizeClaudeChatUrl(input);

    assert.equal(result.valid, true);
    assert.equal(result.chatId, 'my-custom-thread-123');
    assert.equal(result.chatType, 'Custom Claude Chat');
  });

  test('rejects external or non-Claude domain URLs', () => {
    const malicious = `https://evil-phishing.com/chat/${validUuid}`;
    const result = normalizeClaudeChatUrl(malicious);

    assert.equal(result.valid, false);
    assert.match(result.error, /URL must belong to claude\.ai/);
  });

  test('rejects non-chat paths on claude.ai', () => {
    const invalidPath = 'https://claude.ai/settings/billing';
    const result = normalizeClaudeChatUrl(invalidPath);

    assert.equal(result.valid, false);
    assert.match(result.error, /expected \/chat\/<uuid>/);
  });
});
