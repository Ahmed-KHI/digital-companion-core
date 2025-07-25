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
    
    // Store conversation memory
    const conversationMemory = this.memorySystem.store(
      `${participantName} said: "${input}"`,
      'episodic',
      emotionalImpact.importance,
      emotionalImpact.emotionalWeight,
      ['conversation', participantName.toLowerCase(), 'input']
    );
    
    // Recall relevant memories
    const relevantMemories = this.memorySystem.recall(input, 5, 30);
    
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

  private generateResponse(
    input: string,
    context: ConversationContext,
    memories: Memory[],
    style: any,
    emotionalState: EmotionalState
  ): string {
    // This is a simplified response generation
    // In production, this would integrate with LLM APIs
    
    const personality = this.personalitySystem.getBehavioralTendencies();
    const mood = emotionalState.mood;
    
    // Base response templates based on mood and personality
    let responseTemplate = "I understand what you're saying.";
    
    if (input.includes('?')) {
      if (personality.curiosityLevel > 70) {
        responseTemplate = "That's a fascinating question. Let me think about it...";
      } else {
        responseTemplate = "I'll consider that question.";
      }
    } else if (mood === 'joyful') {
      responseTemplate = "That sounds wonderful!";
    } else if (mood === 'contemplative') {
      responseTemplate = "That gives me something to think about.";
    } else if (mood === 'curious') {
      responseTemplate = "That's really interesting. Tell me more.";
    }
    
    // Incorporate relevant memories
    if (memories.length > 0) {
      const memoryContext = memories[0];
      if (memoryContext.content.includes(context.participantName)) {
        responseTemplate += " This reminds me of our previous conversations.";
      }
    }
    
    // Adjust for personality traits
    const bigFive = this.personalitySystem.getBigFive();
    if (bigFive.agreeableness > 70) {
      responseTemplate = "I really appreciate you sharing that. " + responseTemplate;
    }
    
    if (style.empathy > 80) {
      responseTemplate = "I can sense this is important to you. " + responseTemplate;
    }
    
    return responseTemplate;
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
