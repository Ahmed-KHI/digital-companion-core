// Core personality and psychology types for SoulForge

export interface BigFiveTraits {
  openness: number;        // 0-100: Openness to experience
  conscientiousness: number; // 0-100: Conscientiousness  
  extraversion: number;    // 0-100: Extraversion
  agreeableness: number;   // 0-100: Agreeableness
  neuroticism: number;     // 0-100: Neuroticism
}

export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface Identity {
  name: string;
  role: string;
  age?: number;
  background?: string;
  goals?: string[];
  beliefs?: string[];
  values?: string[];
  relationships?: Record<string, string>;
}

export interface PersonalityConfig {
  bigFive?: BigFiveTraits;
  mbti?: MBTIType;
  temperament?: 'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic';
  archetype?: string;
}

export type MoodState = 
  | 'joyful' | 'content' | 'neutral' | 'melancholic' | 'anxious' 
  | 'excited' | 'calm' | 'frustrated' | 'curious' | 'contemplative';

export interface EmotionalState {
  mood: MoodState;
  energy: number;      // 0-100: Energy level
  stress: number;      // 0-100: Stress level
  confidence: number;  // 0-100: Confidence level
  socialBattery: number; // 0-100: Social interaction capacity
}

export interface Memory {
  id: string;
  content: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'emotional';
  importance: number;  // 0-100: How important this memory is
  emotional_weight: number; // -100 to 100: Emotional valence
  timestamp: Date;
  tags?: string[];
  associations?: string[]; // IDs of related memories
}

export interface Thought {
  id: string;
  content: string;
  type: 'reflection' | 'decision' | 'observation' | 'planning' | 'emotion';
  timestamp: Date;
  triggers?: string[]; // What caused this thought
}

export interface ConversationContext {
  participantId: string;
  participantName: string;
  relationship: string;
  currentTopic?: string;
  emotionalTone?: string;
  history: Array<{
    speaker: string;
    message: string;
    timestamp: Date;
    emotionalResponse?: string;
  }>;
}

export interface SoulConfig {
  identity: Identity;
  personality?: PersonalityConfig;
  initialMood?: MoodState;
  memoryCapacity?: number;
  thoughtFrequency?: number; // How often internal monologue generates thoughts
  empathyLevel?: number;     // 0-100: How empathetic the soul is
  learningRate?: number;     // 0-100: How quickly personality adapts
}
