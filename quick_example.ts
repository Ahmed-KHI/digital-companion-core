import { Soul } from './src/index';

// Create a digital companion in 15 lines
const companion = new Soul()
  .withIdentity({ 
    name: "Alex", 
    role: "Study Buddy"
  })
  .withMemory("long-term") // Remembers across sessions
  .withMood("neutral"); // Default emotional state

// Have a conversation - companion remembers and evolves
const response1 = companion.respond("I'm struggling with calculus");
console.log(response1.response); // "I understand calculus can be tough! Let's break it down together..."
console.log(response1.mood);     // "empathetic" (mood shifted based on your need)

const response2 = companion.respond("I finally solved that problem!");  
console.log(response2.response); // "That's amazing! I remember you were struggling with calculus - you've grown so much!"
console.log(response2.mood);     // "proud" (shares in your success)