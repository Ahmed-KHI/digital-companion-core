// Example: Smart NPC for Gaming
import { createNPC } from '../src';

const storekeep = createNPC('Gareth', 'Shopkeeper', 'The Merchant')
  .withPersonality({
    bigFive: {
      openness: 50,
      conscientiousness: 85,
      extraversion: 75,
      agreeableness: 60,
      neuroticism: 30
    },
    mbti: 'ESTJ'
  })
  .withMood('content');

console.log('=== Smart NPC Example ===');
console.log('NPC Status:', storekeep.getStatus());

// Player interactions
const interaction1 = storekeep.respond('Hello, what do you have for sale?', 'player1', 'Hero');
console.log('Gareth:', interaction1.response);

const interaction2 = storekeep.respond('These prices are too high!', 'player1', 'Hero');
console.log('Gareth:', interaction2.response);
console.log('Mood after complaint:', interaction2.mood);

// Different player interaction
const interaction3 = storekeep.respond('Thank you for the great service!', 'player2', 'Mage');
console.log('\nGareth to Mage:', interaction3.response);
console.log('Mood after praise:', interaction3.mood);

// Simulate time passage
storekeep.simulateTimePassage(60); // 1 hour
console.log('\nAfter 1 hour:', storekeep.getStatus().mood);

export { storekeep };
