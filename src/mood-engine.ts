import { EmotionalState, MoodState, Thought } from './types';
import { v4 as uuidv4 } from 'uuid';

export class MoodEngine {
  private emotionalState: EmotionalState;
  private thoughts: Thought[] = [];
  private moodHistory: Array<{ mood: MoodState; timestamp: Date }> = [];
  private moodTransitionRules: Map<MoodState, MoodState[]> = new Map();

  constructor(initialMood: MoodState = 'neutral') {
    this.emotionalState = {
      mood: initialMood,
      energy: 70,
      stress: 20,
      confidence: 60,
      socialBattery: 80
    };

    this.initializeMoodTransitions();
    this.recordMoodChange(initialMood);
  }

  /**
   * Get current emotional state
   */
  getCurrentState(): EmotionalState {
    return { ...this.emotionalState };
  }

  /**
   * Get current mood
   */
  getCurrentMood(): MoodState {
    return this.emotionalState.mood;
  }

  /**
   * Update mood based on external stimulus
   */
  updateMood(
    stimulus: {
      type: 'positive' | 'negative' | 'neutral';
      intensity: number; // 0-100
      context?: string;
    }
  ): MoodState {
    const { type, intensity, context } = stimulus;
    
    // Adjust emotional state based on stimulus
    switch (type) {
      case 'positive':
        this.emotionalState.energy = Math.min(100, this.emotionalState.energy + intensity * 0.3);
        this.emotionalState.stress = Math.max(0, this.emotionalState.stress - intensity * 0.2);
        this.emotionalState.confidence = Math.min(100, this.emotionalState.confidence + intensity * 0.25);
        break;
        
      case 'negative':
        this.emotionalState.energy = Math.max(0, this.emotionalState.energy - intensity * 0.2);
        this.emotionalState.stress = Math.min(100, this.emotionalState.stress + intensity * 0.4);
        this.emotionalState.confidence = Math.max(0, this.emotionalState.confidence - intensity * 0.15);
        break;
        
      case 'neutral':
        // Gradual return to baseline
        this.emotionalState.energy = this.moveToward(this.emotionalState.energy, 70, 5);
        this.emotionalState.stress = this.moveToward(this.emotionalState.stress, 20, 5);
        this.emotionalState.confidence = this.moveToward(this.emotionalState.confidence, 60, 3);
        break;
    }

    // Determine new mood based on emotional state
    const newMood = this.calculateMoodFromState();
    
    if (newMood !== this.emotionalState.mood) {
      this.emotionalState.mood = newMood;
      this.recordMoodChange(newMood);
      
      // Generate internal thought about mood change
      this.addThought(
        `I'm feeling ${newMood} now${context ? ` because of ${context}` : ''}.`,
        'emotion',
        ['mood_change', context].filter(Boolean) as string[]
      );
    }

    return this.emotionalState.mood;
  }

  /**
   * Adjust social battery (for introversion/extraversion simulation)
   */
  adjustSocialBattery(change: number): void {
    this.emotionalState.socialBattery = Math.max(0, Math.min(100, 
      this.emotionalState.socialBattery + change
    ));
  }

  /**
   * Generate internal monologue thoughts
   */
  generateInternalMonologue(context?: string): Thought | null {
    // Don't generate thoughts too frequently
    if (this.thoughts.length > 0) {
      const lastThought = this.thoughts[this.thoughts.length - 1];
      const timeSinceLastThought = Date.now() - lastThought.timestamp.getTime();
      if (timeSinceLastThought < 30000) { // 30 seconds minimum between thoughts
        return null;
      }
    }

    const thoughtContent = this.generateThoughtContent(context);
    if (thoughtContent) {
      return this.addThought(thoughtContent.content, thoughtContent.type);
    }
    
    return null;
  }

  /**
   * Add a thought to internal monologue
   */
  addThought(content: string, type: Thought['type'], triggers?: string[]): Thought {
    const thought: Thought = {
      id: uuidv4(),
      content,
      type,
      timestamp: new Date(),
      triggers
    };

    this.thoughts.push(thought);
    
    // Keep only recent thoughts
    if (this.thoughts.length > 100) {
      this.thoughts = this.thoughts.slice(-50);
    }

    return thought;
  }

  /**
   * Get recent thoughts
   */
  getRecentThoughts(count: number = 10): Thought[] {
    return this.thoughts.slice(-count);
  }

  /**
   * Get thoughts by type
   */
  getThoughtsByType(type: Thought['type']): Thought[] {
    return this.thoughts.filter(thought => thought.type === type);
  }

  /**
   * Get mood history
   */
  getMoodHistory(hours: number = 24): Array<{ mood: MoodState; timestamp: Date }> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.moodHistory.filter(entry => entry.timestamp >= cutoff);
  }

  /**
   * Simulate natural mood decay over time
   */
  simulateTimePassage(minutes: number): void {
    // Natural energy decay
    this.emotionalState.energy = Math.max(0, this.emotionalState.energy - minutes * 0.1);
    
    // Stress relief over time
    this.emotionalState.stress = Math.max(0, this.emotionalState.stress - minutes * 0.05);
    
    // Social battery recovery when alone
    this.emotionalState.socialBattery = Math.min(100, this.emotionalState.socialBattery + minutes * 0.2);
    
    // Check for mood changes
    const newMood = this.calculateMoodFromState();
    if (newMood !== this.emotionalState.mood) {
      this.emotionalState.mood = newMood;
      this.recordMoodChange(newMood);
    }
  }

  /**
   * Calculate mood based on current emotional state
   */
  private calculateMoodFromState(): MoodState {
    const { energy, stress, confidence, socialBattery } = this.emotionalState;
    
    // High stress states
    if (stress > 70) {
      return energy > 60 ? 'anxious' : 'frustrated';
    }
    
    // Low energy states
    if (energy < 30) {
      return stress > 40 ? 'melancholic' : 'contemplative';
    }
    
    // High energy, low stress states
    if (energy > 80 && stress < 30) {
      return confidence > 70 ? 'joyful' : 'excited';
    }
    
    // Balanced states
    if (confidence > 70 && stress < 40) {
      return energy > 60 ? 'content' : 'calm';
    }
    
    // Curious state when social battery is high and confidence moderate
    if (socialBattery > 70 && confidence > 50 && confidence < 80) {
      return 'curious';
    }
    
    return 'neutral';
  }

  /**
   * Initialize mood transition rules
   */
  private initializeMoodTransitions(): void {
    this.moodTransitionRules.set('joyful', ['content', 'excited', 'neutral']);
    this.moodTransitionRules.set('content', ['joyful', 'calm', 'neutral']);
    this.moodTransitionRules.set('neutral', ['content', 'curious', 'contemplative']);
    this.moodTransitionRules.set('melancholic', ['contemplative', 'neutral', 'frustrated']);
    this.moodTransitionRules.set('anxious', ['frustrated', 'neutral', 'contemplative']);
    this.moodTransitionRules.set('excited', ['joyful', 'content', 'anxious']);
    this.moodTransitionRules.set('calm', ['content', 'contemplative', 'neutral']);
    this.moodTransitionRules.set('frustrated', ['anxious', 'melancholic', 'neutral']);
    this.moodTransitionRules.set('curious', ['excited', 'content', 'neutral']);
    this.moodTransitionRules.set('contemplative', ['calm', 'melancholic', 'neutral']);
  }

  /**
   * Record mood change in history
   */
  private recordMoodChange(mood: MoodState): void {
    this.moodHistory.push({
      mood,
      timestamp: new Date()
    });
    
    // Keep only recent mood history
    if (this.moodHistory.length > 200) {
      this.moodHistory = this.moodHistory.slice(-100);
    }
  }

  /**
   * Generate contextual thought content
   */
  private generateThoughtContent(context?: string): { content: string; type: Thought['type'] } | null {
    const { mood, energy, stress } = this.emotionalState;
    
    const thoughtTemplates = {
      joyful: [
        "I'm feeling really good about things right now.",
        "This is turning out better than I expected.",
        "I have a good feeling about what's coming next."
      ],
      content: [
        "Things seem to be going well.",
        "I'm satisfied with how this is progressing.",
        "There's a nice balance to everything right now."
      ],
      neutral: [
        "Let me think about this carefully.",
        "I wonder what the best approach would be.",
        "There are several ways to look at this."
      ],
      melancholic: [
        "I'm not sure this is going the way I hoped.",
        "Sometimes things don't work out as planned.",
        "I need to process what just happened."
      ],
      anxious: [
        "I hope this goes well.",
        "There are so many variables to consider.",
        "I should prepare for different possibilities."
      ],
      excited: [
        "This is really interesting!",
        "I can't wait to see what happens next.",
        "The possibilities here are fascinating."
      ],
      calm: [
        "Everything feels peaceful right now.",
        "I can think clearly about this.",
        "There's no rush to decide."
      ],
      frustrated: [
        "This isn't working the way it should.",
        "I need to find a different approach.",
        "Why is this so complicated?"
      ],
      curious: [
        "I wonder what would happen if...",
        "That's an interesting perspective.",
        "I'd like to understand this better."
      ],
      contemplative: [
        "There's something deeper to consider here.",
        "I should reflect on what this means.",
        "The implications of this are worth thinking about."
      ]
    };

    const templates = thoughtTemplates[mood];
    if (!templates || templates.length === 0) return null;
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Determine thought type based on content and mood
    let type: Thought['type'] = 'reflection';
    if (randomTemplate.includes('wonder') || randomTemplate.includes('interesting')) {
      type = 'observation';
    } else if (randomTemplate.includes('should') || randomTemplate.includes('need to')) {
      type = 'planning';
    } else if (randomTemplate.includes('feeling') || randomTemplate.includes("I'm")) {
      type = 'emotion';
    }
    
    return {
      content: randomTemplate,
      type
    };
  }

  /**
   * Move a value toward a target gradually
   */
  private moveToward(current: number, target: number, step: number): number {
    if (current < target) {
      return Math.min(target, current + step);
    } else if (current > target) {
      return Math.max(target, current - step);
    }
    return current;
  }
}
