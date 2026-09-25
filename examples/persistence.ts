import { Soul } from '../src';

const original = new Soul()
  .withIdentity({ name: 'Maya', role: 'Study Companion' })
  .withMood('curious');

original.respond('I am preparing for my TypeScript exam.', 'user-1', 'Riley');
original.respond('I feel ready for the final review.', 'user-1', 'Riley');
const serialized = JSON.stringify(original.export());

const restored = new Soul();
restored.import(JSON.parse(serialized));

const originalSnapshot = original.export();
const restoredSnapshot = restored.export();
console.log('Persistence comparison');
console.log(`Identity: ${restoredSnapshot.identity.name} (${restoredSnapshot.identity.role})`);
console.log(`Memories: ${originalSnapshot.memories.length} -> ${restoredSnapshot.memories.length}`);
console.log(`Conversations: ${originalSnapshot.conversations.length} -> ${restoredSnapshot.conversations.length}`);
console.log(`Mood: ${originalSnapshot.mood.state.mood} -> ${restoredSnapshot.mood.state.mood}`);