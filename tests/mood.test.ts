import test from 'node:test';
import assert from 'node:assert';
import { Soul } from '../src/soul';

test('withMood applies the requested initial mood', () => {
  const soul = new Soul().withMood('joyful');
  assert.strictEqual(soul.getStatus().mood, 'joyful');
});