import test from 'node:test';
import assert from 'node:assert';
import { Soul } from '../src/soul';

test('export and import preserve soul state and restore dates', () => {
  const original = new Soul()
    .withIdentity({ name: 'Maya', role: 'Research Companion' })
    .withPersonality({ mbti: 'ENFP', archetype: 'The Guide' })
    .withMood('joyful');
  original.respond('I am learning TypeScript today.', 'user-1', 'Riley');

  const snapshot = original.export();
  const restored = new Soul();
  restored.import(JSON.parse(JSON.stringify(snapshot)));
  const restoredSnapshot = restored.export();

  assert.strictEqual(restoredSnapshot.id, snapshot.id);
  assert.deepStrictEqual(restoredSnapshot.identity, snapshot.identity);
  assert.deepStrictEqual(restoredSnapshot.personality, snapshot.personality);
  assert.deepStrictEqual(restoredSnapshot.memories.map(memory => memory.content), snapshot.memories.map(memory => memory.content));
  assert.deepStrictEqual(restoredSnapshot.conversations, snapshot.conversations);
  assert.deepStrictEqual(restoredSnapshot.mood.state, snapshot.mood.state);

  const importedMemory = (restored as any).memorySystem.getRecentMemories(1)[0];
  const importedConversation = (restored as any).conversationContexts.get('user-1').history[0];
  const importedMood = (restored as any).moodEngine;
  assert.ok(importedMemory.timestamp instanceof Date);
  assert.ok(importedConversation.timestamp instanceof Date);
  assert.ok(importedMood.getMoodHistory(24)[0].timestamp instanceof Date);
  assert.ok(importedMood.getRecentThoughts(10).every((thought: any) => thought.timestamp instanceof Date));
});

test('importing the same snapshot twice does not duplicate state', () => {
  const source = new Soul();
  source.respond('Remember this conversation.', 'user-1', 'Riley');
  const exported = source.export();
  const restored = new Soul();

  restored.import(exported);
  restored.import(exported);

  const result = restored.export();
  assert.strictEqual(result.memories.length, exported.memories.length);
  assert.strictEqual(result.conversations.length, exported.conversations.length);
  assert.strictEqual(result.conversations[0].history.length, exported.conversations[0].history.length);
  assert.deepStrictEqual(result.memories.map(memory => memory.id), exported.memories.map(memory => memory.id));
});

test('withMood applies the requested mood', () => {
  assert.strictEqual(new Soul().withMood('excited').getStatus().mood, 'excited');
});

test('invalid import leaves existing soul state unchanged', () => {
  const soul = new Soul().withIdentity({ name: 'Stable', role: 'Companion' }).withMood('content');
  soul.respond('Keep this state.', 'user-1', 'Riley');
  const before = soul.export();
  const invalid = JSON.parse(JSON.stringify(before));
  invalid.memories[0].timestamp = 'not-a-date';

  assert.throws(() => soul.import(invalid), /Invalid snapshot/);
  const after = soul.export();
  assert.deepStrictEqual(after.id, before.id);
  assert.deepStrictEqual(after.identity, before.identity);
  assert.deepStrictEqual(after.memories, before.memories);
  assert.deepStrictEqual(after.conversations, before.conversations);
  assert.deepStrictEqual(after.mood, before.mood);
});