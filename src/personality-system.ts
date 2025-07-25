import { PersonalityConfig, BigFiveTraits, MBTIType, EmotionalState, ConversationContext } from './types';

export class PersonalitySystem {
  private config: PersonalityConfig;
  private adaptationRate: number;

  constructor(config: PersonalityConfig, adaptationRate: number = 5) {
    this.config = {
      bigFive: config.bigFive || this.getDefaultBigFive(),
      mbti: config.mbti || 'ISFJ',
      temperament: config.temperament || 'phlegmatic',
      archetype: config.archetype || 'The Helper'
    };
    this.adaptationRate = adaptationRate;
  }

  /**
   * Get personality configuration
   */
  getConfig(): PersonalityConfig {
    return { ...this.config };
  }

  /**
   * Get Big Five traits
   */
  getBigFive(): BigFiveTraits {
    return { ...this.config.bigFive! };
  }

  /**
   * Update Big Five traits (personality adaptation)
   */
  updateBigFive(changes: Partial<BigFiveTraits>): void {
    if (!this.config.bigFive) return;
    
    Object.entries(changes).forEach(([trait, value]) => {
      if (typeof value === 'number' && trait in this.config.bigFive!) {
        const currentValue = this.config.bigFive![trait as keyof BigFiveTraits];
        const change = (value - currentValue) * (this.adaptationRate / 100);
        this.config.bigFive![trait as keyof BigFiveTraits] = Math.max(0, Math.min(100, currentValue + change));
      }
    });
  }

  /**
   * Generate response style based on personality
   */
  getResponseStyle(emotionalState: EmotionalState, context: ConversationContext): {
    tone: string;
    verbosity: 'concise' | 'moderate' | 'verbose';
    formality: 'casual' | 'neutral' | 'formal';
    empathy: number;
    assertiveness: number;
  } {
    const bigFive = this.config.bigFive!;
    const { mood, confidence, socialBattery } = emotionalState;

    // Base response style on Big Five traits
    const extraversionEffect = bigFive.extraversion / 100;
    const agreeablenessEffect = bigFive.agreeableness / 100;
    const conscientiousnessEffect = bigFive.conscientiousness / 100;
    const neuroticismEffect = bigFive.neuroticism / 100;
    const opennessEffect = bigFive.openness / 100;

    // Determine verbosity
    let verbosity: 'concise' | 'moderate' | 'verbose' = 'moderate';
    if (extraversionEffect > 0.7 && socialBattery > 60) {
      verbosity = 'verbose';
    } else if (extraversionEffect < 0.3 || socialBattery < 30) {
      verbosity = 'concise';
    }

    // Determine formality
    let formality: 'casual' | 'neutral' | 'formal' = 'neutral';
    if (conscientiousnessEffect > 0.7) {
      formality = 'formal';
    } else if (extraversionEffect > 0.6 && agreeablenessEffect > 0.6) {
      formality = 'casual';
    }

    // Adjust based on relationship
    if (context.relationship === 'friend' || context.relationship === 'family') {
      formality = 'casual';
      if (verbosity === 'concise') verbosity = 'moderate';
    } else if (context.relationship === 'professional') {
      formality = 'formal';
    }

    // Calculate empathy and assertiveness
    const empathy = Math.round(agreeablenessEffect * 100 * (1 - neuroticismEffect * 0.3));
    const assertiveness = Math.round(
      (extraversionEffect * confidence / 100) * 100 * (1 - agreeablenessEffect * 0.2)
    );

    // Determine tone based on mood and personality
    let tone = this.determineTone(mood, bigFive, emotionalState);

    return {
      tone,
      verbosity,
      formality,
      empathy,
      assertiveness
    };
  }

  /**
   * Get personality-based decision making tendencies
   */
  getDecisionStyle(): {
    analysisDepth: 'shallow' | 'moderate' | 'deep';
    riskTolerance: 'low' | 'moderate' | 'high';
    timePreference: 'immediate' | 'considered' | 'deliberate';
    socialConsideration: number; // 0-100
  } {
    const bigFive = this.config.bigFive!;
    
    // Analysis depth based on openness and conscientiousness
    let analysisDepth: 'shallow' | 'moderate' | 'deep' = 'moderate';
    if (bigFive.openness > 70 && bigFive.conscientiousness > 60) {
      analysisDepth = 'deep';
    } else if (bigFive.openness < 40 || bigFive.conscientiousness < 40) {
      analysisDepth = 'shallow';
    }

    // Risk tolerance based on neuroticism and openness
    let riskTolerance: 'low' | 'moderate' | 'high' = 'moderate';
    if (bigFive.neuroticism > 60) {
      riskTolerance = 'low';
    } else if (bigFive.openness > 70 && bigFive.neuroticism < 40) {
      riskTolerance = 'high';
    }

    // Time preference based on conscientiousness
    let timePreference: 'immediate' | 'considered' | 'deliberate' = 'considered';
    if (bigFive.conscientiousness > 75) {
      timePreference = 'deliberate';
    } else if (bigFive.conscientiousness < 40) {
      timePreference = 'immediate';
    }

    // Social consideration based on agreeableness
    const socialConsideration = Math.round(bigFive.agreeableness);

    return {
      analysisDepth,
      riskTolerance,
      timePreference,
      socialConsideration
    };
  }

  /**
   * Generate personality-based behavioral tendencies
   */
  getBehavioralTendencies(): {
    curiosityLevel: number;
    socialSeeking: number;
    emotionalExpression: number;
    planningOrientation: number;
    changeAdaptability: number;
  } {
    const bigFive = this.config.bigFive!;

    return {
      curiosityLevel: Math.round(bigFive.openness),
      socialSeeking: Math.round(bigFive.extraversion),
      emotionalExpression: Math.round((100 - bigFive.neuroticism + bigFive.extraversion) / 2),
      planningOrientation: Math.round(bigFive.conscientiousness),
      changeAdaptability: Math.round((bigFive.openness + (100 - bigFive.neuroticism)) / 2)
    };
  }

  /**
   * Get personality description for external understanding
   */
  getPersonalityDescription(): string {
    const bigFive = this.config.bigFive!;
    const mbti = this.config.mbti!;
    
    const traits = [];
    
    if (bigFive.extraversion > 60) traits.push('outgoing');
    else if (bigFive.extraversion < 40) traits.push('reserved');
    
    if (bigFive.agreeableness > 70) traits.push('compassionate');
    else if (bigFive.agreeableness < 30) traits.push('competitive');
    
    if (bigFive.conscientiousness > 70) traits.push('organized');
    else if (bigFive.conscientiousness < 30) traits.push('spontaneous');
    
    if (bigFive.neuroticism > 60) traits.push('sensitive');
    else if (bigFive.neuroticism < 30) traits.push('resilient');
    
    if (bigFive.openness > 70) traits.push('creative');
    else if (bigFive.openness < 30) traits.push('practical');

    return `${mbti} personality type with ${traits.join(', ')} tendencies. ${this.config.archetype} archetype.`;
  }

  /**
   * Predict likely response to situation based on personality
   */
  predictResponse(situation: string, emotionalContext: EmotionalState): {
    likelyReaction: string;
    confidence: number;
    reasoning: string;
  } {
    const bigFive = this.config.bigFive!;
    const tendencies = this.getBehavioralTendencies();
    
    // Simple heuristic-based prediction
    let reaction = 'thoughtful consideration';
    let confidence = 50;
    let reasoning = 'Based on balanced personality traits';
    
    // High openness responses
    if (bigFive.openness > 70) {
      reaction = 'curious exploration';
      confidence += 20;
      reasoning = 'High openness suggests interest in new experiences';
    }
    
    // High conscientiousness responses
    if (bigFive.conscientiousness > 70) {
      reaction = 'careful planning and analysis';
      confidence += 15;
      reasoning += ', high conscientiousness indicates systematic approach';
    }
    
    // High neuroticism responses
    if (bigFive.neuroticism > 60) {
      reaction = 'cautious evaluation';
      confidence += 10;
      reasoning += ', neuroticism suggests careful risk assessment';
    }
    
    // Mood influences
    if (emotionalContext.mood === 'anxious') {
      reaction = 'hesitant consideration';
      reasoning += ', current anxious mood increases caution';
    } else if (emotionalContext.mood === 'excited') {
      reaction = 'enthusiastic engagement';
      reasoning += ', current excited mood increases openness';
    }

    return {
      likelyReaction: reaction,
      confidence: Math.min(90, confidence),
      reasoning
    };
  }

  /**
   * Get default Big Five personality traits
   */
  private getDefaultBigFive(): BigFiveTraits {
    return {
      openness: 60,
      conscientiousness: 65,
      extraversion: 45,
      agreeableness: 70,
      neuroticism: 35
    };
  }

  /**
   * Determine tone based on mood and personality
   */
  private determineTone(mood: string, bigFive: BigFiveTraits, emotionalState: EmotionalState): string {
    const agreeablenessEffect = bigFive.agreeableness / 100;
    const extraversionEffect = bigFive.extraversion / 100;
    const neuroticismEffect = bigFive.neuroticism / 100;

    switch (mood) {
      case 'joyful':
        return extraversionEffect > 0.6 ? 'enthusiastic' : 'warm';
      case 'content':
        return 'pleasant';
      case 'excited':
        return 'energetic';
      case 'anxious':
        return neuroticismEffect > 0.6 ? 'worried' : 'cautious';
      case 'frustrated':
        return agreeablenessEffect > 0.7 ? 'strained' : 'direct';
      case 'melancholic':
        return 'thoughtful';
      case 'contemplative':
        return 'reflective';
      case 'curious':
        return 'inquisitive';
      case 'calm':
        return 'serene';
      default:
        return agreeablenessEffect > 0.6 ? 'friendly' : 'neutral';
    }
  }
}
