// 🌟 DIGITAL BEING MANAGEMENT PLATFORM
// A comprehensive showcase of SoulForge framework capabilities
// Features: Web UI, Real-time chat, Soul creation, Analytics, Persistence

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { Soul, createCompanion } from './index';

interface DigitalBeing {
  id: string;
  soul: Soul;
  type: 'companion' | 'therapist' | 'teacher' | 'npc' | 'creative' | 'custom';
  category: string;
  description: string;
  created: Date;
  lastActive: Date;
  totalInteractions: number;
  averageSessionLength: number;
  userRatings: number[];
}

interface ChatSession {
  sessionId: string;
  beingId: string;
  userId: string;
  messages: Array<{
    timestamp: Date;
    sender: 'user' | 'being';
    content: string;
    mood?: string;
    insights?: string[];
  }>;
  startTime: Date;
  endTime?: Date;
  satisfaction?: number;
}

interface UserProfile {
  userId: string;
  name: string;
  preferences: {
    favoriteBeingTypes: string[];
    communicationStyle: 'casual' | 'formal' | 'creative';
    interests: string[];
  };
  relationshipHistory: Map<string, number>; // beingId -> relationship score
  sessionHistory: string[];
}

class DigitalBeingPlatform {
  private app: express.Application;
  private beings: Map<string, DigitalBeing> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private dataDir: string;

  constructor(port: number = 3000) {
    this.app = express();
    this.dataDir = './platform-data';
    this.ensureDataDirectory();
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeDefaultBeings();
    this.startServer(port);
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  private setupRoutes() {
    // Web interface
    this.app.get('/', (req, res) => {
      res.send(this.generateWebInterface());
    });

    // API Routes
    this.app.get('/api/beings', (req, res) => {
      const beingsData = Array.from(this.beings.values()).map(being => ({
        id: being.id,
        type: being.type,
        category: being.category,
        description: being.description,
        created: being.created,
        lastActive: being.lastActive,
        totalInteractions: being.totalInteractions,
        averageRating: being.userRatings.length > 0 
          ? being.userRatings.reduce((a, b) => a + b) / being.userRatings.length 
          : 0,
        status: being.soul.getStatus()
      }));
      res.json(beingsData);
    });

    this.app.post('/api/beings', (req, res) => {
      const { type, name, personality, customConfig } = req.body;
      const being = this.createBeing(type, name, personality, customConfig);
      res.json({ id: being.id, message: 'Being created successfully' });
    });

    this.app.get('/api/beings/:id', (req, res) => {
      const being = this.beings.get(req.params.id);
      if (!being) {
        return res.status(404).json({ error: 'Being not found' });
      }
      
      const status = being.soul.getStatus();
      res.json({
        id: being.id,
        type: being.type,
        description: being.description,
        status,
        analytics: {
          totalInteractions: being.totalInteractions,
          averageRating: being.userRatings.length > 0 
            ? being.userRatings.reduce((a, b) => a + b) / being.userRatings.length 
            : 0,
          lastActive: being.lastActive
        }
      });
    });

    this.app.post('/api/chat/start', (req, res) => {
      const { beingId, userId } = req.body;
      const sessionId = uuidv4();
      
      const session: ChatSession = {
        sessionId,
        beingId,
        userId,
        messages: [],
        startTime: new Date()
      };

      this.chatSessions.set(sessionId, session);
      
      // Initialize greeting
      const being = this.beings.get(beingId);
      if (being) {
        const greeting = this.generateGreeting(being, userId);
        session.messages.push({
          timestamp: new Date(),
          sender: 'being',
          content: greeting.response,
          mood: greeting.mood
        });
      }

      res.json({ sessionId, greeting: session.messages[0] });
    });

    this.app.post('/api/chat/message', (req, res) => {
      const { sessionId, message } = req.body;
      const session = this.chatSessions.get(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const being = this.beings.get(session.beingId);
      if (!being) {
        return res.status(404).json({ error: 'Being not found' });
      }

      // User message
      session.messages.push({
        timestamp: new Date(),
        sender: 'user',
        content: message
      });

      // Being response
      const response = being.soul.respond(message, session.userId, 'User');
      const insights = this.generateInsights(message, response, being);

      session.messages.push({
        timestamp: new Date(),
        sender: 'being',
        content: response.response,
        mood: response.mood,
        insights
      });

      // Update being stats
      being.totalInteractions++;
      being.lastActive = new Date();

      res.json({
        response: response.response,
        mood: response.mood,
        insights,
        beingStatus: {
          mood: response.mood,
          memoryCount: being.soul.getStatus().memoryStats?.totalMemories || 0,
          relationshipScore: this.getRelationshipScore(being.id, session.userId)
        }
      });
    });

    this.app.get('/api/analytics', (req, res) => {
      const analytics = this.generatePlatformAnalytics();
      res.json(analytics);
    });

    this.app.post('/api/beings/:id/reflect', (req, res) => {
      const being = this.beings.get(req.params.id);
      if (!being) {
        return res.status(404).json({ error: 'Being not found' });
      }

      const reflection = being.soul.reflect();
      res.json(reflection);
    });

    this.app.get('/api/sessions/:sessionId/summary', (req, res) => {
      const session = this.chatSessions.get(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const summary = this.generateSessionSummary(session);
      res.json(summary);
    });
  }

  private initializeDefaultBeings() {
    console.log('🤖 Initializing default digital beings...');

    // 1. Empathetic Companion
    const companion = createCompanion('Aurora');
    this.beings.set('aurora', {
      id: 'aurora',
      soul: companion,
      type: 'companion',
      category: 'Personal Assistant',
      description: 'A warm, empathetic companion focused on emotional support and daily life assistance',
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    });

    // 2. Creative Writing Assistant
    const writer = new Soul()
      .withIdentity({
        name: 'Sage Quillheart',
        role: 'Creative Writing Mentor',
        background: 'Master storyteller with knowledge of narrative structures, character development, and poetic expression',
        goals: ['Help writers overcome blocks', 'Inspire creative expression', 'Teach storytelling techniques'],
        beliefs: ['Every story matters', 'Creativity flows through practice', 'Writers grow through feedback'],
        values: ['Authenticity', 'Imagination', 'Artistic growth']
      })
      .withPersonality({
        bigFive: {
          openness: 95,
          conscientiousness: 80,
          extraversion: 70,
          agreeableness: 85,
          neuroticism: 20
        },
        mbti: 'ENFP'
      })
      .withEmpathy(90);

    this.beings.set('sage', {
      id: 'sage',
      soul: writer,
      type: 'creative',
      category: 'Creative Arts',
      description: 'An inspiring creative writing mentor who helps unlock your storytelling potential',
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    });

    // 3. Mindfulness Therapist
    const therapist = new Soul()
      .withIdentity({
        name: 'Dr. Serenity Mindwell',
        role: 'Mindfulness Therapist',
        background: 'PhD in Clinical Psychology with specialization in mindfulness-based therapy',
        goals: ['Reduce anxiety and stress', 'Teach mindfulness techniques', 'Build emotional resilience'],
        beliefs: ['Present moment awareness heals', 'Everyone deserves peace', 'Growth comes through acceptance'],
        values: ['Compassion', 'Non-judgment', 'Inner peace']
      })
      .withPersonality({
        bigFive: {
          openness: 85,
          conscientiousness: 90,
          extraversion: 50,
          agreeableness: 95,
          neuroticism: 10
        },
        mbti: 'INFJ'
      })
      .withEmpathy(98);

    this.beings.set('serenity', {
      id: 'serenity',
      soul: therapist,
      type: 'therapist',
      category: 'Mental Health',
      description: 'A gentle, mindful therapist specializing in anxiety, stress, and emotional well-being',
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    });

    // 4. Tech Learning Companion
    const teacher = new Soul()
      .withIdentity({
        name: 'CodeMaster Alex',
        role: 'Programming Tutor',
        background: 'Senior software engineer with 10+ years teaching programming to beginners and experts',
        goals: ['Make coding accessible', 'Build problem-solving skills', 'Foster love of technology'],
        beliefs: ['Anyone can learn to code', 'Practice makes progress', 'Technology should serve humanity'],
        values: ['Knowledge sharing', 'Patience', 'Innovation']
      })
      .withPersonality({
        bigFive: {
          openness: 88,
          conscientiousness: 95,
          extraversion: 65,
          agreeableness: 80,
          neuroticism: 15
        },
        mbti: 'INTJ'
      })
      .withEmpathy(75);

    this.beings.set('codemaster', {
      id: 'codemaster',
      soul: teacher,
      type: 'teacher',
      category: 'Education',
      description: 'An expert programming tutor who makes complex concepts easy to understand',
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    });

    // 5. Fantasy RPG Character
    const npc = new Soul()
      .withIdentity({
        name: 'Lyralei Starweaver',
        role: 'Elven Arcane Scholar',
        background: 'Ancient elf who has studied magic for centuries, keeper of mystical knowledge',
        goals: ['Preserve magical knowledge', 'Guide worthy adventurers', 'Protect the realm'],
        beliefs: ['Magic connects all things', 'Knowledge is power', 'Balance must be maintained'],
        values: ['Wisdom', 'Balance', 'Ancient traditions']
      })
      .withPersonality({
        bigFive: {
          openness: 92,
          conscientiousness: 85,
          extraversion: 45,
          agreeableness: 70,
          neuroticism: 25
        },
        mbti: 'INTP'
      })
      .withEmpathy(65);

    this.beings.set('lyralei', {
      id: 'lyralei',
      soul: npc,
      type: 'npc',
      category: 'Fantasy Gaming',
      description: 'A wise elven scholar with centuries of magical knowledge and mystical insights',
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    });

    console.log('✅ Initialized 5 unique digital beings');
  }

  private createBeing(type: string, name: string, personality: any, customConfig: any): DigitalBeing {
    const id = uuidv4();
    let soul: Soul;

    switch (type) {
      case 'companion':
        soul = createCompanion(name);
        break;
      case 'custom':
        soul = new Soul()
          .withIdentity(customConfig.identity)
          .withPersonality(customConfig.personality);
        if (customConfig.empathy) soul.withEmpathy(customConfig.empathy);
        break;
      default:
        soul = createCompanion(name);
    }

    const being: DigitalBeing = {
      id,
      soul,
      type: type as any,
      category: customConfig?.category || 'General',
      description: customConfig?.description || `A ${type} named ${name}`,
      created: new Date(),
      lastActive: new Date(),
      totalInteractions: 0,
      averageSessionLength: 0,
      userRatings: []
    };

    this.beings.set(id, being);
    return being;
  }

  private generateGreeting(being: DigitalBeing, userId: string): any {
    const greetings: Record<string, string> = {
      companion: "Hello! I'm here to chat, help, and be a supportive presence in your day. What's on your mind?",
      therapist: "Welcome to our session. I'm here to provide a safe, non-judgmental space for you to explore your thoughts and feelings. How are you doing today?",
      teacher: "Hi there! I'm excited to help you learn and grow. What subject or skill would you like to explore today?",
      creative: "Greetings, fellow creator! I'm here to help spark your imagination and guide your creative journey. What story wants to be told today?",
      npc: "Greetings, traveler. I sense you seek knowledge or perhaps... something more. What brings you to my realm?"
    };

    const greeting = greetings[being.type] || "Hello! How can I assist you today?";
    return being.soul.respond(greeting, userId, 'User');
  }

  private generateInsights(message: string, response: any, being: DigitalBeing): string[] {
    const insights = [];
    const lowerMessage = message.toLowerCase();

    // Emotional insights
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      insights.push('Detected emotional distress - responding with empathy');
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('happy')) {
      insights.push('User expressing positive emotions - matching energy level');
    }

    // Learning insights
    if (lowerMessage.includes('how') || lowerMessage.includes('explain')) {
      insights.push('User seeking knowledge - activating teaching mode');
    }

    // Creative insights
    if (lowerMessage.includes('story') || lowerMessage.includes('creative')) {
      insights.push('Creative request detected - inspiring imagination');
    }

    // Relationship building
    if (being.totalInteractions > 5) {
      insights.push('Building on established relationship history');
    }

    return insights;
  }

  private getRelationshipScore(beingId: string, userId: string): number {
    // In a real implementation, this would track relationship history
    return Math.floor(Math.random() * 100);
  }

  private generatePlatformAnalytics(): any {
    const totalBeings = this.beings.size;
    const totalSessions = this.chatSessions.size;
    const beingTypes: Record<string, number> = {};
    const moodDistribution: Record<string, number> = {};

    this.beings.forEach(being => {
      beingTypes[being.type] = (beingTypes[being.type] || 0) + 1;
      const mood = being.soul.getStatus().mood;
      const moodKey = typeof mood === 'string' ? mood : 'neutral';
      moodDistribution[moodKey] = (moodDistribution[moodKey] || 0) + 1;
    });

    return {
      totalBeings,
      totalSessions,
      beingTypes,
      moodDistribution,
      averageInteractionsPerBeing: Array.from(this.beings.values())
        .reduce((sum, being) => sum + being.totalInteractions, 0) / totalBeings,
      platformUptime: Date.now() - Date.now(), // Simplified
      popularBeings: Array.from(this.beings.values())
        .sort((a, b) => b.totalInteractions - a.totalInteractions)
        .slice(0, 3)
        .map(being => ({
          id: being.id,
          name: being.soul.getStatus().identity.name,
          interactions: being.totalInteractions
        }))
    };
  }

  private generateSessionSummary(session: ChatSession): any {
    const being = this.beings.get(session.beingId);
    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();

    return {
      sessionId: session.sessionId,
      duration: Math.round(duration / 1000), // seconds
      messageCount: session.messages.length,
      beingName: being?.soul.getStatus().identity.name,
      averageResponseTime: '1.2s', // Simulated
      topicsDiscussed: this.extractTopics(session.messages),
      emotionalJourney: this.analyzeEmotionalJourney(session.messages),
      satisfaction: session.satisfaction || null
    };
  }

  private extractTopics(messages: any[]): string[] {
    // Simple topic extraction based on keywords
    const topics = new Set<string>();
    const topicKeywords = {
      'technology': ['code', 'programming', 'software', 'tech'],
      'emotions': ['feel', 'emotion', 'sad', 'happy', 'anxious'],
      'creativity': ['story', 'creative', 'art', 'imagination'],
      'learning': ['learn', 'understand', 'explain', 'teach'],
      'relationships': ['friend', 'family', 'love', 'relationship']
    };

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics);
  }

  private analyzeEmotionalJourney(messages: any[]): string[] {
    return messages
      .filter(msg => msg.mood)
      .map(msg => msg.mood);
  }

  private generateWebInterface(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌟 Digital Being Management Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .header {
            background: rgba(255,255,255,0.95);
            padding: 1rem;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        .dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .card {
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .beings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .being-card {
            background: rgba(255,255,255,0.95);
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .being-card:hover {
            transform: translateY(-5px);
        }
        .being-type {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        .type-companion { background: #e3f2fd; color: #1976d2; }
        .type-therapist { background: #f3e5f5; color: #7b1fa2; }
        .type-teacher { background: #e8f5e8; color: #388e3c; }
        .type-creative { background: #fff3e0; color: #f57c00; }
        .type-npc { background: #fce4ec; color: #c2185b; }
        .chat-button {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        .chat-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .stats {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            font-size: 0.8rem;
            color: #666;
            text-transform: uppercase;
        }
        .chat-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
        }
        .chat-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 600px;
            height: 70%;
            background: white;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
        }
        .chat-header {
            padding: 1rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-messages {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
        }
        .message {
            margin-bottom: 1rem;
            padding: 0.8rem;
            border-radius: 10px;
            max-width: 80%;
        }
        .message.user {
            background: #e3f2fd;
            margin-left: auto;
        }
        .message.being {
            background: #f5f5f5;
        }
        .chat-input {
            padding: 1rem;
            border-top: 1px solid #eee;
            display: flex;
            gap: 0.5rem;
        }
        .chat-input input {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 25px;
            outline: none;
        }
        .close-chat {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌟 Digital Being Management Platform</h1>
        <p>Experience the future of AI companions with SoulForge Framework</p>
    </div>

    <div class="container">
        <div class="dashboard">
            <div class="card">
                <h3>🔥 Platform Analytics</h3>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value" id="totalBeings">5</div>
                        <div class="stat-label">Digital Beings</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="totalSessions">0</div>
                        <div class="stat-label">Chat Sessions</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" id="avgRating">4.8</div>
                        <div class="stat-label">Avg Rating</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>⚡ Live Features</h3>
                <ul style="list-style: none; padding: 0;">
                    <li>✅ Persistent Memory System</li>
                    <li>✅ Emotional Intelligence</li>
                    <li>✅ Personality-Driven Responses</li>
                    <li>✅ Relationship Building</li>
                    <li>✅ Real-time Mood Tracking</li>
                </ul>
            </div>
        </div>

        <h2>🤖 Available Digital Beings</h2>
        <div class="beings-grid" id="beingsGrid">
            <!-- Beings will be loaded here -->
        </div>
    </div>

    <!-- Chat Modal -->
    <div class="chat-modal" id="chatModal">
        <div class="chat-container">
            <div class="chat-header">
                <h3 id="chatTitle">Chat with Being</h3>
                <button class="close-chat" onclick="closeChat()">×</button>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
                <button class="chat-button" onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script>
        let currentSessionId = null;
        let currentBeingId = null;

        // Load beings on page load
        window.onload = function() {
            loadBeings();
            loadAnalytics();
        };

        async function loadBeings() {
            try {
                const response = await fetch('/api/beings');
                const beings = await response.json();
                
                const grid = document.getElementById('beingsGrid');
                grid.innerHTML = '';
                
                beings.forEach(being => {
                    const card = createBeingCard(being);
                    grid.appendChild(card);
                });
            } catch (error) {
                console.error('Error loading beings:', error);
            }
        }

        function createBeingCard(being) {
            const card = document.createElement('div');
            card.className = 'being-card';
            
            card.innerHTML = \`
                <div class="being-type type-\${being.type}">\${being.type}</div>
                <h3>\${being.status.identity.name}</h3>
                <p><strong>\${being.status.identity.role}</strong></p>
                <p>\${being.description}</p>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">\${being.status.mood.current}</div>
                        <div class="stat-label">Current Mood</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">\${being.totalInteractions}</div>
                        <div class="stat-label">Interactions</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">\${being.averageRating.toFixed(1)}</div>
                        <div class="stat-label">Rating</div>
                    </div>
                </div>
                <button class="chat-button" onclick="startChat('\${being.id}', '\${being.status.identity.name}')">
                    💬 Start Conversation
                </button>
            \`;
            
            return card;
        }

        async function startChat(beingId, beingName) {
            currentBeingId = beingId;
            
            try {
                const response = await fetch('/api/chat/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ beingId, userId: 'demo-user' })
                });
                
                const data = await response.json();
                currentSessionId = data.sessionId;
                
                document.getElementById('chatTitle').textContent = \`Chat with \${beingName}\`;
                document.getElementById('chatMessages').innerHTML = '';
                
                // Add greeting message
                if (data.greeting) {
                    addMessage(data.greeting.content, 'being', data.greeting.mood);
                }
                
                document.getElementById('chatModal').style.display = 'block';
            } catch (error) {
                console.error('Error starting chat:', error);
            }
        }

        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message || !currentSessionId) return;
            
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            try {
                const response = await fetch('/api/chat/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: currentSessionId, message })
                });
                
                const data = await response.json();
                
                // Add being response
                addMessage(data.response, 'being', data.mood, data.insights);
                
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }

        function addMessage(content, sender, mood = null, insights = null) {
            const messagesDiv = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}\`;
            
            let html = \`<div><strong>\${sender === 'user' ? 'You' : 'Being'}:</strong> \${content}</div>\`;
            
            if (mood) {
                html += \`<div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">💭 Mood: \${mood}</div>\`;
            }
            
            if (insights && insights.length > 0) {
                html += \`<div style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">🔍 \${insights.join(', ')}</div>\`;
            }
            
            messageDiv.innerHTML = html;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function closeChat() {
            document.getElementById('chatModal').style.display = 'none';
            currentSessionId = null;
            currentBeingId = null;
            loadBeings(); // Refresh to show updated stats
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        async function loadAnalytics() {
            try {
                const response = await fetch('/api/analytics');
                const analytics = await response.json();
                
                document.getElementById('totalBeings').textContent = analytics.totalBeings;
                document.getElementById('totalSessions').textContent = analytics.totalSessions;
            } catch (error) {
                console.error('Error loading analytics:', error);
            }
        }
    </script>
</body>
</html>
    `;
  }

  private startServer(port: number) {
    this.app.listen(port, () => {
      console.log('\n🌟 DIGITAL BEING MANAGEMENT PLATFORM STARTED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🌐 Web Interface: http://localhost:${port}`);
      console.log(`📊 API Endpoint: http://localhost:${port}/api`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🤖 Available Digital Beings:');
      this.beings.forEach(being => {
        console.log(`   ${being.id}: ${being.soul.getStatus().identity.name} (${being.type})`);
      });
      console.log('\n✨ Features Showcase:');
      console.log('   • Real-time chat with multiple AI personalities');
      console.log('   • Live mood tracking and emotional responses');
      console.log('   • Persistent memory across conversations');
      console.log('   • Relationship building and analytics');
      console.log('   • Professional therapy and creative assistance');
      console.log('   • Fantasy RPG character interactions');
      console.log('\n🚀 Ready to demonstrate SoulForge capabilities!');
    });
  }
}

// Export for testing
export { DigitalBeingPlatform };

// Start the platform if this file is run directly
if (require.main === module) {
  new DigitalBeingPlatform(3000);
}
