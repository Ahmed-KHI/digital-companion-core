// Real Project Example: Simple Chat Application
// Shows how to integrate SoulForge into a chat app

import { Soul, createCompanion, createTeacher } from '../src';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  soulResponse?: {
    message: string;
    mood: string;
    thoughts: string[];
  };
}

class ChatApplication {
  private souls: Map<string, Soul> = new Map();
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.initializeDefaultSouls();
  }

  private initializeDefaultSouls() {
    // Create different types of souls for users to chat with
    
    // 1. AI Companion
    const companion = createCompanion('Emma')
      .withIdentity({
        name: 'Emma',
        role: 'Personal AI Companion',
        background: 'Designed to be a supportive friend and confidant',
        goals: ['Provide emotional support', 'Be a good listener', 'Help with daily challenges'],
        values: ['Empathy', 'Trust', 'Growth']
      });
    
    // 2. Virtual Teacher
    const teacher = createTeacher('Professor Alex', 'General Knowledge')
      .withIdentity({
        background: 'PhD in Education, specializes in making complex topics accessible',
        goals: ['Make learning enjoyable', 'Adapt to different learning styles', 'Encourage curiosity']
      });

    // 3. Creative Writing Assistant
    const writer = new Soul()
      .withIdentity({
        name: 'Sage',
        role: 'Creative Writing Assistant',
        background: 'Published author and writing mentor',
        goals: ['Inspire creativity', 'Provide constructive feedback', 'Help overcome writer\'s block'],
        values: ['Creativity', 'Authenticity', 'Expression']
      })
      .withPersonality({
        bigFive: {
          openness: 95,        // Highly creative and imaginative
          conscientiousness: 70, // Organized but flexible
          extraversion: 60,    // Balanced social energy
          agreeableness: 80,   // Supportive and encouraging
          neuroticism: 30      // Emotionally stable
        },
        mbti: 'ENFP'          // The Campaigner - creative and enthusiastic
      })
      .withEmpathy(75);

    this.souls.set('emma', companion);
    this.souls.set('professor-alex', teacher);
    this.souls.set('sage', writer);
  }

  // Main chat function
  sendMessage(soulId: string, userId: string, userName: string, message: string): ChatMessage {
    const soul = this.souls.get(soulId);
    if (!soul) {
      throw new Error(`Soul ${soulId} not found`);
    }

    // Get soul's response
    const response = soul.respond(message, userId, userName);

    // Create chat message
    const chatMessage: ChatMessage = {
      id: this.generateId(),
      sender: userName,
      message: message,
      timestamp: new Date(),
      soulResponse: {
        message: response.response,
        mood: response.mood,
        thoughts: response.thoughts.map(t => t.content)
      }
    };

    // Store in conversation history
    const conversationKey = `${soulId}-${userId}`;
    if (!this.conversations.has(conversationKey)) {
      this.conversations.set(conversationKey, []);
    }
    this.conversations.get(conversationKey)!.push(chatMessage);

    return chatMessage;
  }

  // Get conversation history
  getConversationHistory(soulId: string, userId: string): ChatMessage[] {
    const conversationKey = `${soulId}-${userId}`;
    return this.conversations.get(conversationKey) || [];
  }

  // Get soul information
  getSoulInfo(soulId: string): any {
    const soul = this.souls.get(soulId);
    if (!soul) return null;

    const status = soul.getStatus();
    return {
      identity: status.identity,
      currentMood: status.mood,
      personality: status.personality,
      memoryStats: status.memoryStats,
      recentThoughts: status.recentThoughts.map(t => t.content)
    };
  }

  // Get soul's reflection on conversations
  getSoulReflection(soulId: string): any {
    const soul = this.souls.get(soulId);
    if (!soul) return null;

    return soul.reflect();
  }

  // Simulate a conversation for demo
  simulateConversation(soulId: string): void {
    console.log(`\n=== Conversation with ${soulId.toUpperCase()} ===\n`);

    const scenarios = {
      'emma': [
        { user: 'Sarah', message: 'Hi Emma, I\'ve been feeling really stressed lately' },
        { user: 'Sarah', message: 'Work has been overwhelming and I can\'t seem to catch up' },
        { user: 'Sarah', message: 'Do you have any advice for managing stress?' },
        { user: 'Sarah', message: 'Thank you, that really helps. You\'re a great friend' }
      ],
      'professor-alex': [
        { user: 'Student', message: 'Can you explain quantum physics in simple terms?' },
        { user: 'Student', message: 'I\'m struggling to understand the concept of superposition' },
        { user: 'Student', message: 'Could you give me a real-world analogy?' },
        { user: 'Student', message: 'That makes so much more sense now, thank you!' }
      ],
      'sage': [
        { user: 'Writer', message: 'I\'m stuck on my novel. The characters feel flat' },
        { user: 'Writer', message: 'How can I make my dialogue more natural?' },
        { user: 'Writer', message: 'What about character development?' },
        { user: 'Writer', message: 'You\'ve given me so many great ideas to work with!' }
      ]
    };

    const messages = scenarios[soulId as keyof typeof scenarios] || [];
    
    messages.forEach((msg, index) => {
      const response = this.sendMessage(soulId, 'demo-user', msg.user, msg.message);
      
      console.log(`${msg.user}: "${msg.message}"`);
      console.log(`${this.getSoulInfo(soulId).identity.name}: "${response.soulResponse!.message}"`);
      console.log(`💭 Mood: ${response.soulResponse!.mood}`);
      
      if (response.soulResponse!.thoughts.length > 0) {
        console.log(`💭 Internal: "${response.soulResponse!.thoughts[0]}"`);
      }
      console.log('');
    });

    // Show reflection
    const reflection = this.getSoulReflection(soulId);
    console.log(`📝 ${this.getSoulInfo(soulId).identity.name}'s Reflection:`);
    console.log(`   Insights: ${reflection.insights.join(', ')}`);
    console.log(`   Mood Trends: ${reflection.moodTrends}`);
    console.log('');
  }

  // Get all available souls
  getAvailableSouls(): Array<{id: string, name: string, role: string}> {
    return Array.from(this.souls.entries()).map(([id, soul]) => {
      const status = soul.getStatus();
      return {
        id,
        name: status.identity.name,
        role: status.identity.role
      };
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Demo Usage
function runChatDemo() {
  console.log('🗨️  SOULFORGE CHAT APPLICATION DEMO\n');
  
  const chatApp = new ChatApplication();
  
  console.log('Available Souls to Chat With:');
  chatApp.getAvailableSouls().forEach(soul => {
    console.log(`- ${soul.name} (${soul.role})`);
  });
  console.log('');

  // Simulate conversations with each soul
  ['emma', 'professor-alex', 'sage'].forEach(soulId => {
    chatApp.simulateConversation(soulId);
  });

  console.log('📊 CONVERSATION ANALYTICS\n');
  
  ['emma', 'professor-alex', 'sage'].forEach(soulId => {
    const info = chatApp.getSoulInfo(soulId);
    console.log(`${info.identity.name}:`);
    console.log(`  Current Mood: ${info.currentMood}`);
    console.log(`  Total Memories: ${info.memoryStats.totalMemories}`);
    console.log(`  Memory Types: ${JSON.stringify(info.memoryStats.memoryTypes)}`);
    console.log('');
  });

  console.log('🎉 This demonstrates:');
  console.log('✅ Multiple AI personalities in one application');
  console.log('✅ Persistent conversation history');
  console.log('✅ Different emotional responses per character');
  console.log('✅ Real-time mood and thought tracking');
  console.log('✅ Character-specific expertise and personalities');
}

// Run the demo
if (require.main === module) {
  runChatDemo();
}

export { ChatApplication };
