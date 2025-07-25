# 🛠️ SoulForge – A Framework for Building Digital Beings

[![GitHub stars](https://img.shields.io/github/stars/Ahmed-KHI/soulforge-framework?style=social)](https://github.com/Ahmed-KHI/soulforge-framework/stargazers)
[![npm version](https://badge.fury.io/js/soulforge-framework.svg)](https://www.npmjs.com/package/soulforge-framework)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*"Not just chatbots — you create entities with souls."*

🌟 **Star this repo if you find it useful!** 🌟

SoulForge is a revolutionary TypeScript framework for building persistent, emotionally aware, identity-consistent digital personalities. It combines cutting-edge cognitive psychology principles with modern AI development tools to create truly engaging digital beings that remember, feel, and evolve.

## 🌟 Key Features

- **🧠 Long-term Memory System** - Episodic, semantic, and emotional memory with intelligent consolidation
- **👤 Identity Schema** - Beliefs, goals, relationships, and personal history
- **🎭 Personality Configuration** - Big Five traits, MBTI types, and psychological archetypes  
- **😊 Mood Engine** - Dynamic emotional states with internal monologue
- **❤️ Empathy APIs** - Built-in emotional intelligence and response adaptation
- **⏰ Time-aware Evolution** - Personalities that adapt and grow over time

## 🎥 Live Demo

Try the interactive web demo:
```bash
git clone https://github.com/Ahmed-KHI/soulforge-framework.git
cd soulforge-framework
npm install
npm run demo:platform
```
Open `http://localhost:3000` and chat with 5 pre-created digital beings, each with unique personalities!

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

## 🚀 What Makes SoulForge Special?

### 🆚 Traditional Chatbots vs. SoulForge Entities

| Traditional Chatbots | 🌟 SoulForge Entities |
|---------------------|-------------------|
| ❌ Stateless responses | ✅ Persistent memory across conversations |
| ❌ Generic personality | ✅ Unique identity with beliefs & goals |
| ❌ Fixed behavior patterns | ✅ Adaptive personality that evolves |
| ❌ No emotional awareness | ✅ Rich emotional intelligence |
| ❌ Task-focused interactions | ✅ Relationship-focused connections |

### Pre-configured Entities

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

### 🌟 **Don't forget to star this repository if you found it useful!** ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Ahmed-KHI/soulforge-framework&type=Date)](https://star-history.com/#Ahmed-KHI/soulforge-framework&Date)
