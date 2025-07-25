// Example: AI Companion
import { createCompanion } from '../src';

const alexa = createCompanion('Alexa')
  .withMood('content');

// Example conversation
console.log('=== AI Companion Example ===');
console.log('Initial state:', alexa.getStatus());

const response1 = alexa.respond('Hi Alexa, how are you feeling today?', 'user', 'Alex');
console.log('Alexa:', response1.response);
console.log('Mood:', response1.mood);
console.log('Thoughts:', response1.thoughts.map(t => t.content));

const response2 = alexa.respond('I had a really great day at work!', 'user', 'Alex');
console.log('\nAlexa:', response2.response);
console.log('Mood:', response2.mood);

// Reflection
const reflection = alexa.reflect();
console.log('\nReflection insights:', reflection.insights);
console.log('Mood trends:', reflection.moodTrends);

export { alexa };
