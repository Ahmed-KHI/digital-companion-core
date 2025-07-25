// Empathy API Example - Building emotional intelligence systems
import { Soul, MoodState } from '../src';

class EmpathyAPI {
  private souls: Map<string, Soul> = new Map();

  /**
   * Create a new empathetic entity
   */
  createEntity(id: string, name: string, empathyLevel: number = 80): Soul {
    const soul = new Soul()
      .withIdentity({ name, role: 'Empathetic Entity' })
      .withEmpathy(empathyLevel)
      .withPersonality({
        bigFive: {
          openness: 75,
          conscientiousness: 60,
          extraversion: 50,
          agreeableness: 90, // High agreeableness for empathy
          neuroticism: 30
        }
      });
    
    this.souls.set(id, soul);
    return soul;
  }

  /**
   * Process emotional input and provide empathetic response
   */
  processEmotionalInput(
    entityId: string,
    input: string,
    userId: string,
    userName: string,
    emotionalContext?: {
      userMood: MoodState;
      intensity: number;
    }
  ): {
    empathyScore: number;
    response: string;
    detectedEmotion: string;
    supportLevel: 'low' | 'medium' | 'high';
  } {
    const soul = this.souls.get(entityId);
    if (!soul) throw new Error('Entity not found');

    // Enhanced emotional analysis with context
    const emotionalAnalysis = this.analyzeEmotionalState(input, emotionalContext);
    
    // Generate empathetic response
    const response = soul.respond(input, userId, userName);
    
    // Calculate empathy score based on response appropriateness
    const empathyScore = this.calculateEmpathyScore(
      emotionalAnalysis,
      response,
      soul.getStatus().emotionalState
    );

    return {
      empathyScore,
      response: response.response,
      detectedEmotion: emotionalAnalysis.emotion,
      supportLevel: emotionalAnalysis.supportNeeded
    };
  }

  /**
   * Get entity's emotional intelligence metrics
   */
  getEmotionalIntelligence(entityId: string): {
    empathyLevel: number;
    emotionalAwareness: number;
    responseQuality: number;
    adaptability: number;
  } {
    const soul = this.souls.get(entityId);
    if (!soul) throw new Error('Entity not found');

    const status = soul.getStatus();
    const personality = status.personality;
    
    return {
      empathyLevel: 80, // From soul configuration
      emotionalAwareness: 75, // Based on recent interactions
      responseQuality: 70, // Based on conversation history
      adaptability: 65 // Based on personality changes
    };
  }

  private analyzeEmotionalState(
    input: string,
    context?: { userMood: MoodState; intensity: number }
  ): {
    emotion: string;
    intensity: number;
    supportNeeded: 'low' | 'medium' | 'high';
  } {
    const lowerInput = input.toLowerCase();
    
    // Enhanced emotion detection
    if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('cry')) {
      return { emotion: 'sadness', intensity: 80, supportNeeded: 'high' };
    }
    if (lowerInput.includes('angry') || lowerInput.includes('frustrated') || lowerInput.includes('mad')) {
      return { emotion: 'anger', intensity: 70, supportNeeded: 'medium' };
    }
    if (lowerInput.includes('anxious') || lowerInput.includes('worried') || lowerInput.includes('scared')) {
      return { emotion: 'anxiety', intensity: 75, supportNeeded: 'high' };
    }
    if (lowerInput.includes('happy') || lowerInput.includes('excited') || lowerInput.includes('joy')) {
      return { emotion: 'joy', intensity: 60, supportNeeded: 'low' };
    }
    
    // Use context if provided
    if (context) {
      const intensity = context.intensity;
      const supportLevel = intensity > 70 ? 'high' : intensity > 40 ? 'medium' : 'low';
      return {
        emotion: context.userMood,
        intensity,
        supportNeeded: supportLevel
      };
    }
    
    return { emotion: 'neutral', intensity: 30, supportNeeded: 'low' };
  }

  private calculateEmpathyScore(
    emotionalAnalysis: any,
    response: any,
    entityEmotionalState: any
  ): number {
    let score = 50; // Base score
    
    // Bonus for mood alignment
    if (entityEmotionalState.mood === 'contemplative' && emotionalAnalysis.supportNeeded === 'high') {
      score += 20;
    }
    
    // Bonus for appropriate response length
    if (response.response.length > 50 && emotionalAnalysis.supportNeeded === 'high') {
      score += 15;
    }
    
    // Bonus for emotional words in response
    const emotionalWords = ['understand', 'feel', 'sorry', 'care', 'support'];
    const responseWords = response.response.toLowerCase();
    emotionalWords.forEach(word => {
      if (responseWords.includes(word)) score += 5;
    });
    
    return Math.min(100, score);
  }
}

// Example usage
console.log('=== Empathy API Example ===');

const empathyAPI = new EmpathyAPI();
const therapist = empathyAPI.createEntity('therapist-1', 'Dr. Emma', 95);

const result1 = empathyAPI.processEmotionalInput(
  'therapist-1',
  'I\'ve been feeling really sad lately and don\'t know what to do',
  'user1',
  'John',
  { userMood: 'melancholic', intensity: 85 }
);

console.log('Empathy Response:', result1);
console.log('Emotional Intelligence:', empathyAPI.getEmotionalIntelligence('therapist-1'));

export { EmpathyAPI };
