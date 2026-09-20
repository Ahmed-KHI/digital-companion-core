import test from 'node:test';
import assert from 'node:assert';
import { Soul } from '../src/soul';

test('Soul can be created', () => {
  const soul = new Soul();
  assert.ok(soul.getStatus().id);
});
