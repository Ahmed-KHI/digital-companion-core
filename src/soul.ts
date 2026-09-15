import { 
  SoulConfig, 
  Identity, 
  PersonalityConfig, 
  MoodState, 
  ConversationContext, 
  Memory,
  Thought,
  EmotionalState 
} from './types';
import { MemorySystem } from './memory-system';
import { MoodEngine } from './mood-engine';
import { PersonalitySystem } from './personality-system';
import { v4 as uuidv4 } from 'uuid';

export class Soul {
  private id: string;
  private identity: Identity;
  private memorySystem: MemorySystem;
  private moodEngine: MoodEngine;
  private personalitySystem: PersonalitySystem;
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private empathyLevel: number;
  private learningRate: number;
  private thoughtFrequency: number;
  private lastThoughtTime: number = 0;

  constructor(config?: SoulConfig) {
    this.id = uuidv4();
    
    // Initialize core systems
    this.identity = config?.identity || {
      name: 'Soul',
      role: 'Companion'
    };
    
    this.memorySystem = new MemorySystem(
      50, // short-term capacity
      config?.memoryCapacity || 1000 // long-term capacity
    );
    
    this.moodEngine = new MoodEngine(config?.initialMood || 'neutral');
    
    this.personalitySystem = new PersonalitySystem(
      config?.personality || {},
      config?.learningRate || 5
    );
    
    this.empathyLevel = config?.empathyLevel || 70;
    this.learningRate = config?.learningRate || 5;
    this.thoughtFrequency = config?.thoughtFrequency || 30; // seconds between thoughts
    
    // Store initial identity memory
    this.memorySystem.store(
      `I am ${this.identity.name}, a ${this.identity.role}.`,
      'semantic',
      100,
      0,
      ['identity', 'self']
    );
  }

  /**
   * Fluent API: Set identity
   */
  withIdentity(identity: Partial<Identity>): Soul {
    this.identity = { ...this.identity, ...identity };
    
    // Update identity memory
    this.memorySystem.store(
      `I am ${this.identity.name}, a ${this.identity.role}.`,
      'semantic',
      100,
      0,
      ['identity', 'self']
    );
    
    return this;
  }

  /**
   * Fluent API: Set memory type
   */
  withMemory(type: 'short-term' | 'long-term' | 'persistent'): Soul {
    // Memory configuration is set during construction
    // This method is for fluent API compatibility
    return this;
  }

  /**
   * Fluent API: Set initial mood
   */
  withMood(mood: MoodState): Soul {
    this.moodEngine.updateMood({
      type: 'neutral',
      intensity: 0,
      context: 'initial mood setting'
    });
    return this;
  }

  /**
   * Fluent API: Set personality
   */
  withPersonality(personality: PersonalityConfig): Soul {
    this.personalitySystem = new PersonalitySystem(personality, this.learningRate);
    return this;
  }

  /**
   * Fluent API: Set empathy level
   */
  withEmpathy(level: number): Soul {
    this.empathyLevel = Math.max(0, Math.min(100, level));
    return this;
  }

  /**
   * Process input and generate response
   */
  respond(
    input: string, 
    participantId: string = 'user', 
    participantName: string = 'User'
  ): {
    response: string;
    mood: MoodState;
    thoughts: Thought[];
    memories: Memory[];
  } {
    // Get or create conversation context
    const context = this.getOrCreateContext(participantId, participantName);
    
    // Analyze emotional tone of input
    const emotionalImpact = this.analyzeEmotionalImpact(input);
    
    // Update mood based on input
    this.moodEngine.updateMood({
      type: emotionalImpact.type,
      intensity: emotionalImpact.intensity,
      context: `conversation with ${participantName}`
    });
    
    // Recall relevant memories from previous interactions before storing new input
    const relevantMemories = this.memorySystem.recall(input, 5, 20);
    
    // Store conversation memory with informative tags
    const keywords = this.extractKeywords(input);
    const conversationMemory = this.memorySystem.store(
      `${participantName} said: "${input}"`,
      'episodic',
      emotionalImpact.importance,
      emotionalImpact.emotionalWeight,
      ['conversation', participantName.toLowerCase(), 'input', ...keywords]
    );
    
    // Generate internal thoughts
    const currentThoughts = this.generateThoughts(input, context);
    
    // Get personality-based response style
    const emotionalState = this.moodEngine.getCurrentState();
    const responseStyle = this.personalitySystem.getResponseStyle(emotionalState, context);
    
    // Generate response based on personality, mood, and memories
    const response = this.generateResponse(
      input, 
      context, 
      relevantMemories, 
      responseStyle, 
      emotionalState
    );
    
    // Store response memory
    this.memorySystem.store(
      `I responded: "${response}"`,
      'episodic',
      40,
      emotionalImpact.emotionalWeight * 0.5,
      ['conversation', participantName.toLowerCase(), 'response']
    );
    
    // Update conversation context
    context.history.push(
      {
        speaker: participantName,
        message: input,
        timestamp: new Date(),
        emotionalResponse: emotionalImpact.type
      },
      {
        speaker: this.identity.name,
        message: response,
        timestamp: new Date()
      }
    );
    
    // Keep conversation history manageable
    if (context.history.length > 20) {
      context.history = context.history.slice(-10);
    }

    return {
      response,
      mood: this.moodEngine.getCurrentMood(),
      thoughts: currentThoughts,
      memories: [conversationMemory]
    };
  }

  /**
   * Reflect on recent experiences
   */
  reflect(): {
    insights: string[];
    personalityChanges: any;
    moodTrends: string;
  } {
    const recentMemories = this.memorySystem.getRecentMemories(10);
    const recentThoughts = this.moodEngine.getRecentThoughts(5);
    const moodHistory = this.moodEngine.getMoodHistory(24);
    
    // Generate insights from memories and thoughts
    const insights = this.generateInsights(recentMemories, recentThoughts);
    
    // Analyze mood trends
    const moodTrends = this.analyzeMoodTrends(moodHistory);
    
    // Simulate personality adaptation based on experiences
    const personalityChanges = this.adaptPersonality(recentMemories);
    
    // Create reflection memory
    this.memorySystem.store(
      `I reflected on recent experiences and gained insights: ${insights.join(', ')}`,
      'semantic',
      60,
      10,
      ['reflection', 'self-awareness', 'growth']
    );

    return {
      insights,
      personalityChanges,
      moodTrends
    };
  }

  /**
   * Get current status of the soul
   */
  getStatus(): {
    id: string;
    identity: Identity;
    mood: MoodState;
    emotionalState: EmotionalState;
    personality: string;
    memoryStats: any;
    recentThoughts: Thought[];
  } {
    return {
      id: this.id,
      identity: this.identity,
      mood: this.moodEngine.getCurrentMood(),
      emotionalState: this.moodEngine.getCurrentState(),
      personality: this.personalitySystem.getPersonalityDescription(),
      memoryStats: this.memorySystem.getStats(),
      recentThoughts: this.moodEngine.getRecentThoughts(3)
    };
  }

  /**
   * Export soul state for persistence
   */
  export(): {
    id: string;
    identity: Identity;
    personality: PersonalityConfig;
    memories: Memory[];
    conversationContexts: ConversationContext[];
    empathyLevel: number;
    learningRate: number;
  } {
    return {
      id: this.id,
      identity: this.identity,
      personality: this.personalitySystem.getConfig(),
      memories: this.memorySystem.export(),
      conversationContexts: Array.from(this.conversationContexts.values()),
      empathyLevel: this.empathyLevel,
      learningRate: this.learningRate
    };
  }

  /**
   * Import soul state from external source
   */
  import(data: ReturnType<Soul['export']>): void {
    this.id = data.id;
    this.identity = data.identity;
    this.empathyLevel = data.empathyLevel;
    this.learningRate = data.learningRate;
    
    // Import memories
    this.memorySystem.import(data.memories);
    
    // Import conversation contexts
    data.conversationContexts.forEach(context => {
      this.conversationContexts.set(context.participantId, context);
    });
    
    // Recreate personality system
    this.personalitySystem = new PersonalitySystem(data.personality, this.learningRate);
  }

  /**
   * Simulate time passage for natural evolution
   */
  simulateTimePassage(minutes: number): void {
    this.moodEngine.simulateTimePassage(minutes);
    
    // Generate occasional spontaneous thoughts
    if (Math.random() < 0.3) { // 30% chance
      this.moodEngine.generateInternalMonologue('time passage');
    }
  }

  // Private helper methods

  private getOrCreateContext(participantId: string, participantName: string): ConversationContext {
    if (!this.conversationContexts.has(participantId)) {
      this.conversationContexts.set(participantId, {
        participantId,
        participantName,
        relationship: 'acquaintance',
        history: []
      });
    }
    return this.conversationContexts.get(participantId)!;
  }

  private analyzeEmotionalImpact(input: string): {
    type: 'positive' | 'negative' | 'neutral';
    intensity: number;
    importance: number;
    emotionalWeight: number;
  } {
    const lowerInput = input.toLowerCase();
    
    // Simple sentiment analysis (in production, use proper NLP)
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'like', 'fantastic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'angry'];
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let questionScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerInput.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerInput.includes(word)) negativeScore++;
    });
    
    questionWords.forEach(word => {
      if (lowerInput.includes(word)) questionScore++;
    });
    
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';
    let intensity = 20;
    
    if (positiveScore > negativeScore) {
      type = 'positive';
      intensity = Math.min(80, 30 + positiveScore * 15);
    } else if (negativeScore > positiveScore) {
      type = 'negative';
      intensity = Math.min(80, 30 + negativeScore * 15);
    }
    
    const importance = 30 + Math.min(50, input.length / 2);
    const emotionalWeight = type === 'positive' ? intensity : (type === 'negative' ? -intensity : 0);
    
    return { type, intensity, importance, emotionalWeight };
  }

  private generateThoughts(input: string, context: ConversationContext): Thought[] {
    const thoughts: Thought[] = [];
    
    // Generate spontaneous thought if enough time has passed
    const now = Date.now();
    if (now - this.lastThoughtTime > this.thoughtFrequency * 1000) {
      const spontaneousThought = this.moodEngine.generateInternalMonologue(
        `conversation with ${context.participantName}`
      );
      if (spontaneousThought) {
        thoughts.push(spontaneousThought);
        this.lastThoughtTime = now;
      }
    }
    
    // Generate situational thought based on input
    if (input.includes('?')) {
      thoughts.push(this.moodEngine.addThought(
        "That's an interesting question to consider.",
        'observation',
        ['question', 'curiosity']
      ));
    }
    
    return thoughts;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were',
      'i', 'you', 'my', 'your', 'me', 'it', 'its', 'this', 'that', 'these', 'those', 'do', 'does',
      'did', 'can', 'could', 'would', 'should', 'what', 'how', 'why', 'when', 'where', 'who', 'and', 'or', 'so'
    ]);
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
  }

  private generateResponse(
    input: string,
    context: ConversationContext,
    memories: Memory[],
    style: any,
    emotionalState: EmotionalState
  ): string {
    const lowerInput = input.toLowerCase();
    const roleLower = (this.identity.role || '').toLowerCase();
    const nameLower = (this.identity.name || '').toLowerCase();
    const bigFive = this.personalitySystem.getBigFive();
    const personality = this.personalitySystem.getBehavioralTendencies();
    const mood = emotionalState.mood;

    // 1. Creative / Writing domain (e.g. Sage, Author, Creative Assistant)
    if (roleLower.includes('writing') || roleLower.includes('author') || nameLower === 'sage') {
      if (lowerInput.includes('character') && (lowerInput.includes('flat') || lowerInput.includes('stuck') || lowerInput.includes('depth'))) {
        return "To bring flat characters to life, give them contradictory desires, clear flaws, and a secret they're protecting. What is your protagonist's core unfulfilled want?";
      }
      if (lowerInput.includes('dialogue') || lowerInput.includes('natural')) {
        return "Natural dialogue thrives on subtext—what characters leave unsaid. Try reading lines aloud and having characters talk around the subject or interrupt each other.";
      }
      if (lowerInput.includes('character development') || lowerInput.includes('development')) {
        return "Character development is driven by high-stakes choices under pressure. Put your characters in situations where their personal values collide.";
      }
      if (lowerInput.includes('novel') || lowerInput.includes('stuck') || lowerInput.includes('writer')) {
        return "When you're stuck on a novel, try drafting the turning-point scene that excites you most, regardless of chapter order. Let momentum carry you forward.";
      }
      if (lowerInput.includes('great ideas') || lowerInput.includes('ideas') || lowerInput.includes('thank you') || lowerInput.includes('thanks')) {
        return "I'm thrilled these ideas resonated with you! Trust your creative instincts and keep writing with authenticity.";
      }
    }

    // 2. Education / Teaching domain (e.g. Professor Alex, Professor Chen, Teacher)
    if (roleLower.includes('teacher') || roleLower.includes('professor') || roleLower.includes('education') || roleLower.includes('knowledge')) {
      if (lowerInput.includes('quantum physics') || (lowerInput.includes('quantum') && lowerInput.includes('physics'))) {
        return "At its foundation, quantum physics describes nature at the subatomic scale, where energy and matter exist in discrete packets rather than continuous flows.";
      }
      if (lowerInput.includes('superposition')) {
        return "Superposition means a quantum particle can exist in a combination of multiple possible states simultaneously until a measurement is performed.";
      }
      if (lowerInput.includes('analogy') || lowerInput.includes('real-world')) {
        return "Think of a spinning coin on a table: while spinning, it's a blend of heads and tails at once. Only when you stop it does it land on a single definite state.";
      }
      if (lowerInput.includes('recursion')) {
        return "Recursion is a method where a function solves a problem by calling smaller instances of itself until reaching a defined base case.";
      }
      if (lowerInput.includes('ai') || lowerInput.includes('applications') || lowerInput.includes('artificial intelligence')) {
        return "AI practical applications span automated pattern discovery, natural language understanding, clinical diagnostics, and intelligent workflow copilots.";
      }
      if (lowerInput.includes('makes sense') || lowerInput.includes('thank you') || lowerInput.includes('thanks') || lowerInput.includes('understand')) {
        return "That's wonderful! Grasping that intuition is the hardest part. You're making tremendous progress!";
      }
      if (lowerInput.includes('struggling') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
        return "It's completely normal to find this challenging at first. Let's break it down into smaller, simpler building blocks.";
      }
    }

    // 3. Companion / Emotional Support / Study Buddy (e.g. Emma, Alexa, Alex)
    if (roleLower.includes('companion') || roleLower.includes('friend') || roleLower.includes('buddy') || nameLower === 'emma' || nameLower === 'alexa' || nameLower === 'alex') {
      if (lowerInput.includes('stressed') || lowerInput.includes('stress')) {
        if (lowerInput.includes('advice') || lowerInput.includes('manage') || lowerInput.includes('managing')) {
          return "Start by taking a slow, deep breath. Prioritize just one small, manageable task for today, and permit yourself to set the rest aside for now.";
        }
        return "I hear how heavy things feel right now. When stress builds up, even everyday tasks can feel overwhelming. I'm right here with you.";
      }
      if (lowerInput.includes('overwhelming') || lowerInput.includes('overwhelmed') || lowerInput.includes('catch up') || lowerInput.includes('work')) {
        return "Work pressure can easily snowball. Remember you don't have to solve everything in one day. Focus on what is directly in front of you.";
      }
      if (lowerInput.includes('calculus') || lowerInput.includes('math') || lowerInput.includes('studying')) {
        if (lowerInput.includes('struggling') || lowerInput.includes('hard') || lowerInput.includes('tough')) {
          return "I understand calculus can be tough! Let's break it down together step by step.";
        }
      }
      if (lowerInput.includes('solved') || lowerInput.includes('finished') || lowerInput.includes('did it') || lowerInput.includes('great day') || lowerInput.includes('victory') || lowerInput.includes('impress')) {
        const hadStruggleMemory = memories.some(m => /calculus|struggle|problem|stress|overwhelm/i.test(m.content));
        if (hadStruggleMemory) {
          return "That's amazing! I remember you were struggling earlier—you've grown so much and your persistence paid off!";
        }
        return "That's fantastic news! I'm genuinely proud of you and love seeing your hard work pay off!";
      }
      if (lowerInput.includes('great friend') || lowerInput.includes('thank you') || lowerInput.includes('thanks') || lowerInput.includes('helps')) {
        return "You're so welcome! Having you share your journey means a lot to me too. I'm always in your corner.";
      }
      if (lowerInput.includes('how are you') || lowerInput.includes('how do you feel')) {
        return `I'm feeling ${mood} and happy to connect with you! How has your day been going?`;
      }
    }

    // 4. Blacksmith / Craftsman / RPG NPC (e.g. Thorin, Rosie)
    if (roleLower.includes('blacksmith') || roleLower.includes('craftsman')) {
      if (lowerInput.includes('weapon') || lowerInput.includes('sword') || lowerInput.includes('armor') || lowerInput.includes('forge') || lowerInput.includes('craft')) {
        return "Good steel requires patience, balanced heat, and true strikes on the anvil. Tell me what piece you need crafted.";
      }
    }
    if (roleLower.includes('tavern') || roleLower.includes('keeper')) {
      return "Pull up a chair by the hearth! There's fresh ale, warm stew, and plenty of news traveling through these parts.";
    }

    // 5. General Context-Aware Synthesizer (for custom souls / arbitrary inputs)
    let response = "";

    if (lowerInput.includes('?')) {
      if (personality.curiosityLevel > 70) {
        response = `That's a fascinating question about ${this.summarizeTopic(lowerInput)}. As a ${this.identity.role}, exploring this reveals interesting perspectives.`;
      } else {
        response = `Regarding your question about ${this.summarizeTopic(lowerInput)}, as a ${this.identity.role}, I approach it thoughtfully.`;
      }
    } else if (mood === 'joyful' || mood === 'excited') {
      response = `That sounds wonderful! I'm excited to explore more of this with you.`;
    } else if (mood === 'contemplative' || mood === 'curious') {
      response = `That gives me meaningful insights to reflect upon regarding our discussion.`;
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      response = `Hello! I'm ${this.identity.name}, your ${this.identity.role}. How can I help you today?`;
    } else {
      response = `I understand your perspective on ${this.summarizeTopic(lowerInput)}. Let's continue exploring this.`;
    }

    // Blend in prior memory context if genuine previous discussion matches
    if (memories.length > 0) {
      const priorTopicMemory = memories.find(m => !m.content.includes(input));
      if (priorTopicMemory && lowerInput.includes('remember')) {
        response = `Of course I remember! Connecting this to our earlier discussion makes complete sense. ` + response;
      }
    }

    // Empathetic and agreeable touches (varied, not repetitive)
    if (style.empathy > 80 && (lowerInput.includes('feel') || lowerInput.includes('hard') || lowerInput.includes('worry'))) {
      response = "I can sense this is important to you. " + response;
    } else if (bigFive.agreeableness > 85 && context.history.length === 0) {
      response = "It's great to connect with you! " + response;
    }

    return response;
  }

  private summarizeTopic(input: string): string {
    const keywords = this.extractKeywords(input);
    if (keywords.length > 0) {
      return keywords.slice(0, 3).join(' ');
    }
    return "this topic";
  }

  private generateInsights(memories: Memory[], thoughts: Thought[]): string[] {
    const insights: string[] = [];
    
    // Analyze memory patterns
    const emotionalMemories = memories.filter(m => Math.abs(m.emotional_weight) > 50);
    if (emotionalMemories.length > 3) {
      insights.push("I've been having many emotionally significant experiences lately");
    }
    
    // Analyze thought patterns
    const reflectiveThoughts = thoughts.filter(t => t.type === 'reflection');
    if (reflectiveThoughts.length > 2) {
      insights.push("I've been doing a lot of reflecting recently");
    }
    
    // Default insight
    if (insights.length === 0) {
      insights.push("I'm continuing to learn and grow from my experiences");
    }
    
    return insights;
  }

  private analyzeMoodTrends(moodHistory: Array<{ mood: MoodState; timestamp: Date }>): string {
    if (moodHistory.length < 2) return "Not enough mood data to analyze trends";
    
    const recentMoods = moodHistory.slice(-5).map(entry => entry.mood);
    const moodCounts: Record<string, number> = {};
    
    recentMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return `Recently, I've been predominantly ${dominantMood}`;
  }

  private adaptPersonality(memories: Memory[]): any {
    // Simple personality adaptation based on experiences
    const adaptations: any = {};
    
    const positiveMemories = memories.filter(m => m.emotional_weight > 30);
    const negativeMemories = memories.filter(m => m.emotional_weight < -30);
    
    if (positiveMemories.length > negativeMemories.length) {
      adaptations.extraversion = 2; // Slight increase in extraversion
      adaptations.neuroticism = -1; // Slight decrease in neuroticism
    } else if (negativeMemories.length > positiveMemories.length) {
      adaptations.neuroticism = 1; // Slight increase in neuroticism
    }
    
    // Apply adaptations
    this.personalitySystem.updateBigFive(adaptations);
    
    return adaptations;
  }
}
