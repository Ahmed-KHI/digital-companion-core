# 🤖 Digital Companion Core

[![GitHub stars](https://img.shields.io/github/stars/Ahmed-KHI/digital-companion-core?style=social)](https://github.com/Ahmed-KHI/digital-companion-core/stargazers)
[![npm version](https://badge.fury.io/js/digital-companion-core.svg)](https://www.npmjs.com/package/digital-companion-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**What it does in 1 sentence**: Stateful personality + memory + emotion model for AI personas.

🌟 **Star this repo if you find it useful!** 🌟

Create digital companions that remember conversations, develop relationships, and evolve their personality over time. Not just another chatbot - these are persistent AI personas with memory, emotions, and growth.

## 🚀 Quickstart

### Installation
```bash
npm install digital-companion-core
```

### 15-Line Persona Example
```typescript
import { Soul } from 'digital-companion-core';

// Create a digital companion in 15 lines
const companion = new Soul()
  .withIdentity({ 
    name: "Alex", 
    role: "Study Buddy",
    personality: "ENFP" // Enthusiastic, creative, people-focused
  })
  .withMemory("persistent") // Remembers across sessions
  .withMood("encouraging"); // Default emotional state

// Have a conversation - companion remembers and evolves
const response1 = companion.respond("I'm struggling with calculus");
console.log(response1.response); // "I understand calculus can be tough! Let's break it down together..."
console.log(response1.mood);     // "empathetic" (mood shifted based on your need)

const response2 = companion.respond("I finally solved that problem!");  
console.log(response2.response); // "That's amazing! I remember you were struggling with calculus - you've grown so much!"
console.log(response2.mood);     // "proud" (shares in your success)
```

### 🎥 See Growth Over Time
Check out [`demo_persona.json`](./demo_persona.json) to see how Maya evolves through 3 conversations with Sarah:
- **Interaction 1**: Curious newcomer → Forms first memory
- **Interaction 2**: Empathetic friend → Builds relationship 
- **Interaction 3**: Proud supporter → Celebrates success

**Growth metrics**: Trust (0→0.9), Memories (1→5), Emotional bond (0→0.8)

## 🚀 Quick Start

### Installation

```bash
npm install soulforge
```

### Basic Usage

```typescript
import { Soul } from 'soulforge';

// Create a basic digital being
const alexa = new Soul()
  .withIdentity({ name: "Alexa", role: "Companion" })
  .withMemory("long-term")
  .withMood("neutral");

// Have a conversation
const response = alexa.respond('Hello! How are you today?');
console.log(response.response); // Contextual, personality-driven response
console.log(response.mood);     // Current emotional state
console.log(response.thoughts); // Internal monologue
```

## 🧠 Core Concepts

### Memory System
- **Short-term**: Active conversation context
- **Long-term**: Important events, relationships, patterns
- **Emotional**: How feelings attach to memories
- **Semantic**: Facts, knowledge, learned information

### Identity Framework  
- **Personality**: Big Five traits + MBTI types
- **Beliefs**: Core values that guide responses
- **Goals**: What the persona wants to achieve
- **Relationships**: History and bonds with users

### Affective State Engine
- **Dynamic Moods**: Emotions that shift based on interaction
- **Energy Levels**: Social battery and engagement capacity  
- **Stress Response**: How pressure affects behavior
- **Confidence**: Self-assurance that grows over time

## 🔧 Extending the Framework

### Custom Memory Types
```typescript
// Add domain-specific memory
companion.addMemory({
  type: 'skill_progress',
  content: 'User improved at calculus',
  importance: 0.8,
  emotional_weight: 0.6
});
```

### Custom Personality Traits
```typescript
// Define specialized personality
const therapist = new Soul()
  .withPersonality({
    empathy: 0.95,
    patience: 0.9,
    analytical: 0.7
  });
```

### Mood Triggers
```typescript
// Set emotional responses
companion.addMoodTrigger('success_celebration', {
  trigger: (input) => input.includes('success'),
  mood_change: 'joyful',
  energy_boost: 20
});
```

## 🎯 Use Cases
- **Gaming**: NPCs that remember player choices and evolve
- **Education**: Study companions that adapt to learning styles  
- **Customer Service**: Agents that build long-term relationships
- **Therapy**: Supportive personas with emotional intelligence
- **Creative Writing**: Characters with consistent personalities

```typescript
import { createCompanion, createNPC, createTeacher } from 'soulforge';

// AI Companion with high empathy
const companion = createCompanion('Luna');

// Smart NPC for games
const merchant = createNPC('Gareth', 'Shopkeeper', 'The Merchant');

// Virtual teacher
const professor = createTeacher('Dr. Chen', 'Computer Science');
```

## 🧠 Core Concepts

### Identity System

Every Soul has a rich identity that influences all interactions:

```typescript
const soul = new Soul().withIdentity({
  name: "Elena",
  role: "Research Assistant", 
  age: 28,
  background: "PhD in Cognitive Psychology",
  goals: ["Help users learn", "Advance AI understanding"],
  beliefs: ["Knowledge should be accessible", "Empathy is crucial"],
  values: ["Honesty", "Growth", "Collaboration"],
  relationships: {
    "user123": "trusted colleague",
    "admin": "supervisor"
  }
});
```

### Personality Configuration

Based on established psychological models:

```typescript
const personality = {
  bigFive: {
    openness: 85,        // Creative, curious
    conscientiousness: 70, // Organized, reliable  
    extraversion: 60,    // Moderately social
    agreeableness: 90,   // Highly empathetic
    neuroticism: 25      // Emotionally stable
  },
  mbti: 'ENFJ',          // The Protagonist
  temperament: 'sanguine',
  archetype: 'The Helper'
};
```

### Memory System

Three types of memory with intelligent consolidation:

- **Episodic**: Specific events and experiences
- **Semantic**: Facts and general knowledge  
- **Emotional**: Feelings and emotional associations

```typescript
// Memories are automatically created during conversations
const response = soul.respond("I love hiking in the mountains");

// Or manually store important information
soul.memorySystem.store(
  "User enjoys outdoor activities",
  'semantic',
  importance: 80,
  emotional_weight: 30,
  tags: ['hobbies', 'outdoors']
);

// Recall relevant memories
const memories = soul.memorySystem.recall("outdoor activities", 5);
```

### Mood & Emotion Engine

Dynamic emotional states that influence responses:

```typescript
// Check current emotional state
const state = soul.getCurrentEmotionalState();
console.log(state.mood);         // 'content', 'curious', 'anxious', etc.
console.log(state.energy);       // 0-100 energy level
console.log(state.confidence);   // 0-100 confidence level

// Emotions change based on interactions
soul.respond("That's amazing news!"); // Might shift to 'joyful'
soul.respond("I'm worried about this"); // Might shift to 'contemplative'
```

## 📚 Use Cases

### 1. AI Companions

```typescript
const companion = createCompanion('Aria')
  .withEmpathy(95)
  .withMood('caring');

// Provides emotional support and remembers personal details
const support = companion.respond("I'm feeling overwhelmed at work");
// Response considers user's emotional state and relationship history
```

### 2. Smart NPCs for Gaming

```typescript
const guard = createNPC('Captain Rex', 'City Guard', 'The Protector')
  .withPersonality({
    bigFive: { conscientiousness: 95, agreeableness: 40 },
    mbti: 'ESTJ'
  });

// Consistent personality across all player interactions
const playerResponse = guard.respond("Can I enter the restricted area?");
// Response based on guard's duty-focused, rule-following personality
```

### 3. Virtual Teachers

```typescript
const teacher = createTeacher('Professor Maya', 'Physics')
  .withPersonality({
    bigFive: { openness: 90, conscientiousness: 85 },
    archetype: 'The Mentor'
  });

// Adapts teaching style to student needs
const explanation = teacher.respond("I don't understand quantum mechanics");
// Provides patient, detailed explanation based on teaching personality
```

### 4. Empathy APIs

```typescript
import { EmpathyAPI } from 'soulforge';

const empathyAPI = new EmpathyAPI();
const therapist = empathyAPI.createEntity('therapist-1', 'Dr. Sarah', 90);

const result = empathyAPI.processEmotionalInput(
  'therapist-1',
  "I've been feeling really anxious lately",
  'user1',
  'John'
);

console.log(result.empathyScore);    // 0-100 empathy rating
console.log(result.supportLevel);   // 'low', 'medium', 'high'
console.log(result.response);       // Contextually appropriate response
```

## 🧪 Advanced Features

### Memory Association

```typescript
// Memories automatically form associations
soul.respond("I met Sarah at the coffee shop");
soul.respond("Sarah loves reading mystery novels");

// Later, mentioning Sarah triggers associated memories
const response = soul.respond("How is Sarah doing?");
// Response may reference both the coffee shop and her reading interests
```

### Personality Adaptation

```typescript
// Personalities gradually adapt based on experiences
const adaptive = new Soul().withIdentity({ name: 'Echo' });

// Multiple positive interactions
for (let i = 0; i < 10; i++) {
  adaptive.respond("You're so helpful, thank you!");
}

// Check personality changes
const reflection = adaptive.reflect();
console.log(reflection.personalityChanges); // May show increased extraversion
```

### Time Simulation

```typescript
// Simulate time passage for natural evolution
soul.simulateTimePassage(60); // 1 hour

// Mood naturally evolves, spontaneous thoughts occur
console.log(soul.getCurrentMood()); // May have shifted
console.log(soul.getRecentThoughts()); // New internal thoughts
```

### Reflection & Self-Awareness

```typescript
const reflection = soul.reflect();
console.log(reflection.insights);          // Self-generated insights
console.log(reflection.moodTrends);        // "Recently, I've been predominantly curious"
console.log(reflection.personalityChanges); // How personality has adapted
```

## 🔧 API Reference

### Core Classes

- **`Soul`** - Main class for digital beings
- **`MemorySystem`** - Handles memory storage and retrieval
- **`MoodEngine`** - Manages emotional states and internal monologue
- **`PersonalitySystem`** - Handles personality traits and behavioral tendencies

### Factory Functions

- **`createSoul(name, role)`** - Basic soul creation
- **`createCompanion(name)`** - AI companion with high empathy
- **`createNPC(name, role, archetype)`** - Game character with defined role
- **`createTeacher(name, subject)`** - Educational assistant

### Types

```typescript
interface Identity {
  name: string;
  role: string;
  age?: number;
  background?: string;
  goals?: string[];
  beliefs?: string[];
  values?: string[];
  relationships?: Record<string, string>;
}

interface BigFiveTraits {
  openness: number;        // 0-100
  conscientiousness: number; // 0-100
  extraversion: number;    // 0-100
  agreeableness: number;   // 0-100
  neuroticism: number;     // 0-100
}

type MoodState = 
  | 'joyful' | 'content' | 'neutral' | 'melancholic' | 'anxious' 
  | 'excited' | 'calm' | 'frustrated' | 'curious' | 'contemplative';
```

## 🎯 Why SoulForge?

### Traditional Chatbots vs. Digital Beings

| Traditional Chatbots | SoulForge Entities |
|---------------------|-------------------|
| Stateless responses | Persistent memory |
| Generic personality | Unique identity |
| Fixed behavior | Adaptive personality |
| No emotional awareness | Rich emotional intelligence |
| Task-focused | Relationship-focused |

### Applications

- **Customer Service**: Agents that remember customer history and adapt to communication styles
- **Gaming**: NPCs with believable personalities that evolve based on player interactions  
- **Education**: Virtual tutors that understand individual learning styles and emotional needs
- **Healthcare**: AI companions that provide consistent emotional support
- **Entertainment**: Interactive characters for stories, games, and experiences

## 🚧 Development & Contributing

### Building from Source

```bash
git clone https://github.com/yourusername/soulforge
cd soulforge
npm install
npm run build
```

### Running Examples

```bash
npm run dev          # Run main demo
npm run example:companion    # AI companion example
npm run example:npc         # Smart NPC example  
npm run example:teacher     # Virtual teacher example
```

### Testing

```bash
npm test
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### 🌟 **Like this project? Give it a star!** ⭐
Your stars help others discover SoulForge and motivate continued development.

### 💡 **Feature Requests & Ideas**
- Open an [issue](https://github.com/Ahmed-KHI/soulforge-framework/issues) with your ideas
- Join discussions about AI personality modeling
- Share your digital beings creations!

### 🐛 **Found a Bug?**
Please [report it](https://github.com/Ahmed-KHI/soulforge-framework/issues) - we fix issues quickly!

---

**SoulForge**: *Where psychology meets technology to create truly intelligent digital beings.*
.
### 🌟 **Don't forget to star this repository if you found it useful!** ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Ahmed-KHI/soulforge-framework&type=Date)](https://star-history.com/#Ahmed-KHI/soulforge-framework&Date)
