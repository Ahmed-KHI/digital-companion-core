// Real Project Example: Web API Integration
// Shows how to use SoulForge in a REST API for a therapy/counseling app

import { Soul, createCompanion } from '../src';
import * as http from 'http';
import * as url from 'url';

interface TherapySession {
  sessionId: string;
  clientId: string;
  therapistSoul: Soul;
  startTime: Date;
  messages: Array<{
    timestamp: Date;
    sender: 'client' | 'therapist';
    content: string;
    mood?: string;
    emotions?: string[];
  }>;
  sessionNotes: string[];
}

class TherapyAPI {
  private sessions: Map<string, TherapySession> = new Map();
  private therapists: Map<string, Soul> = new Map();

  constructor() {
    this.initializeTherapists();
  }

  private initializeTherapists() {
    // Create different types of therapy AI personalities

    // 1. Cognitive Behavioral Therapy Specialist
    const cbtTherapist = new Soul()
      .withIdentity({
        name: 'Dr. Sarah Chen',
        role: 'CBT Therapist',
        background: 'PhD in Clinical Psychology, specializes in Cognitive Behavioral Therapy',
        goals: ['Help clients identify thought patterns', 'Develop coping strategies', 'Build resilience'],
        beliefs: ['Thoughts influence feelings', 'Change is possible', 'Self-awareness is key'],
        values: ['Empathy', 'Evidence-based practice', 'Client empowerment']
      })
      .withPersonality({
        bigFive: {
          openness: 85,        // Open to different perspectives
          conscientiousness: 90, // Structured and reliable
          extraversion: 60,    // Warm but not overwhelming
          agreeableness: 95,   // Highly empathetic
          neuroticism: 10      // Very emotionally stable
        },
        mbti: 'INFJ'          // The Advocate - insightful and empathetic
      })
      .withEmpathy(98);

    // 2. Mindfulness and Meditation Guide
    const mindfulnessTherapist = new Soul()
      .withIdentity({
        name: 'Master Li Wei',
        role: 'Mindfulness Therapist',
        background: '20+ years of meditation practice, integrates Eastern and Western approaches',
        goals: ['Teach present-moment awareness', 'Reduce anxiety through mindfulness', 'Foster inner peace'],
        beliefs: ['Present moment is all we have', 'Suffering comes from attachment', 'Inner peace is achievable'],
        values: ['Compassion', 'Wisdom', 'Acceptance']
      })
      .withPersonality({
        bigFive: {
          openness: 95,        // Very open to spiritual concepts
          conscientiousness: 80, // Disciplined practice
          extraversion: 40,    // Calm and introspective
          agreeableness: 90,   // Gentle and accepting
          neuroticism: 5       // Extremely calm
        },
        mbti: 'INFP'          // The Mediator - idealistic and caring
      })
      .withEmpathy(95);

    this.therapists.set('cbt', cbtTherapist);
    this.therapists.set('mindfulness', mindfulnessTherapist);
  }

  // Start a new therapy session
  startSession(clientId: string, therapistType: string): string {
    const therapist = this.therapists.get(therapistType);
    if (!therapist) {
      throw new Error(`Therapist type ${therapistType} not found`);
    }

    const sessionId = this.generateSessionId();
    const session: TherapySession = {
      sessionId,
      clientId,
      therapistSoul: therapist,
      startTime: new Date(),
      messages: [],
      sessionNotes: []
    };

    // Initialize session with therapist introduction
    const introResponse = therapist.respond(
      `New therapy session started with client ${clientId}`,
      clientId,
      'Client'
    );

    session.messages.push({
      timestamp: new Date(),
      sender: 'therapist',
      content: this.generateWelcomeMessage(therapistType),
      mood: introResponse.mood
    });

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  // Send message in therapy session
  sendMessage(sessionId: string, message: string): {
    response: string;
    mood: string;
    therapeuticInsights: string[];
    suggestedTechniques: string[];
    riskAssessment: 'low' | 'medium' | 'high';
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Client message
    session.messages.push({
      timestamp: new Date(),
      sender: 'client',
      content: message,
      emotions: this.detectEmotions(message)
    });

    // Therapist response
    const response = session.therapistSoul.respond(message, session.clientId, 'Client');
    
    // Analyze message for therapeutic insights
    const insights = this.generateTherapeuticInsights(message, response, session);
    const techniques = this.suggestTechniques(message, session.therapistSoul.getStatus().identity.role);
    const riskLevel = this.assessRisk(message);

    // Store therapist response
    session.messages.push({
      timestamp: new Date(),
      sender: 'therapist',
      content: response.response,
      mood: response.mood
    });

    // Add session notes
    if (insights.length > 0) {
      session.sessionNotes.push(`Insights: ${insights.join(', ')}`);
    }

    return {
      response: response.response,
      mood: response.mood,
      therapeuticInsights: insights,
      suggestedTechniques: techniques,
      riskAssessment: riskLevel
    };
  }

  // Get session summary
  getSessionSummary(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const therapistReflection = session.therapistSoul.reflect();
    const clientEmotions = this.analyzeSessionEmotions(session);

    return {
      sessionId,
      duration: Date.now() - session.startTime.getTime(),
      messageCount: session.messages.length,
      therapistInsights: therapistReflection.insights,
      clientEmotionalJourney: clientEmotions,
      sessionNotes: session.sessionNotes,
      recommendations: this.generateRecommendations(session)
    };
  }

  private generateWelcomeMessage(therapistType: string): string {
    const welcomes = {
      cbt: "Hello, I'm Dr. Sarah Chen. I'm here to help you explore your thoughts and feelings. Together, we'll work on identifying patterns and developing healthy coping strategies. How are you feeling today?",
      mindfulness: "Welcome. I'm Master Li Wei. In our time together, we'll explore the present moment and cultivate inner peace. There's no judgment here, only acceptance and growth. What brings you to our session today?"
    };
    return welcomes[therapistType as keyof typeof welcomes] || "Hello, I'm here to support you today.";
  }

  private detectEmotions(message: string): string[] {
    const emotions: string[] = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) emotions.push('anxiety');
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) emotions.push('sadness');
    if (lowerMessage.includes('angry') || lowerMessage.includes('mad')) emotions.push('anger');
    if (lowerMessage.includes('happy') || lowerMessage.includes('joy')) emotions.push('happiness');
    if (lowerMessage.includes('fear') || lowerMessage.includes('scared')) emotions.push('fear');
    if (lowerMessage.includes('guilt') || lowerMessage.includes('shame')) emotions.push('guilt');

    return emotions;
  }

  private generateTherapeuticInsights(message: string, response: any, session: TherapySession): string[] {
    const insights: string[] = [];

    // Pattern detection
    if (message.toLowerCase().includes('always') || message.toLowerCase().includes('never')) {
      insights.push('Client using absolute thinking patterns');
    }

    if (message.toLowerCase().includes('should') || message.toLowerCase().includes('must')) {
      insights.push('Client expressing perfectionist tendencies');
    }

    // Emotional state analysis
    if (response.mood === 'contemplative') {
      insights.push('Deep emotional processing occurring');
    }

    // Progress indicators
    if (message.toLowerCase().includes('understand') || message.toLowerCase().includes('realize')) {
      insights.push('Client showing self-awareness and insight');
    }

    return insights;
  }

  private suggestTechniques(message: string, therapistRole: string): string[] {
    const techniques: string[] = [];

    if (therapistRole.includes('CBT')) {
      if (message.toLowerCase().includes('anxious')) {
        techniques.push('Thought challenging exercise', 'Breathing techniques', 'Grounding exercise');
      }
      if (message.toLowerCase().includes('negative')) {
        techniques.push('Cognitive restructuring', 'Evidence examination');
      }
    }

    if (therapistRole.includes('Mindfulness')) {
      if (message.toLowerCase().includes('overwhelm')) {
        techniques.push('5-4-3-2-1 grounding technique', 'Body scan meditation');
      }
      if (message.toLowerCase().includes('stress')) {
        techniques.push('Mindful breathing', 'Loving-kindness meditation');
      }
    }

    return techniques;
  }

  private assessRisk(message: string): 'low' | 'medium' | 'high' {
    const lowerMessage = message.toLowerCase();
    
    // High risk indicators
    if (lowerMessage.includes('hurt myself') || lowerMessage.includes('end it all')) {
      return 'high';
    }
    
    // Medium risk indicators
    if (lowerMessage.includes('hopeless') || lowerMessage.includes('worthless')) {
      return 'medium';
    }
    
    return 'low';
  }

  private analyzeSessionEmotions(session: TherapySession): any {
    const emotions = session.messages
      .filter(m => m.emotions)
      .flatMap(m => m.emotions || []);

    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      primaryEmotions: Object.keys(emotionCounts),
      emotionalProgression: emotions,
      dominantEmotion: Object.entries(emotionCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral'
    };
  }

  private generateRecommendations(session: TherapySession): string[] {
    const recommendations: string[] = [];
    const emotions = this.analyzeSessionEmotions(session);

    if (emotions.primaryEmotions.includes('anxiety')) {
      recommendations.push('Practice daily breathing exercises');
      recommendations.push('Consider mindfulness meditation');
    }

    if (emotions.primaryEmotions.includes('sadness')) {
      recommendations.push('Engage in physical activity');
      recommendations.push('Connect with supportive friends/family');
    }

    recommendations.push('Continue regular therapy sessions');
    recommendations.push('Keep a mood journal');

    return recommendations;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Create HTTP server
  createServer(): http.Server {
    return http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsedUrl = url.parse(req.url || '', true);
      const pathname = parsedUrl.pathname;

      try {
        if (pathname === '/start-session' && req.method === 'POST') {
          this.handleStartSession(req, res);
        } else if (pathname === '/send-message' && req.method === 'POST') {
          this.handleSendMessage(req, res);
        } else if (pathname?.startsWith('/session-summary/') && req.method === 'GET') {
          this.handleSessionSummary(req, res, pathname);
        } else if (pathname === '/health' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'healthy', therapists: Array.from(this.therapists.keys()) }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (error as Error).message }));
      }
    });
  }

  private handleStartSession(req: http.IncomingMessage, res: http.ServerResponse) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { clientId, therapistType } = JSON.parse(body);
      const sessionId = this.startSession(clientId, therapistType);
      const session = this.sessions.get(sessionId)!;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sessionId,
        welcomeMessage: session.messages[0].content,
        therapistName: session.therapistSoul.getStatus().identity.name
      }));
    });
  }

  private handleSendMessage(req: http.IncomingMessage, res: http.ServerResponse) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { sessionId, message } = JSON.parse(body);
      const result = this.sendMessage(sessionId, message);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }

  private handleSessionSummary(req: http.IncomingMessage, res: http.ServerResponse, pathname: string) {
    const sessionId = pathname.split('/')[2];
    const summary = this.getSessionSummary(sessionId);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(summary));
  }
}

// Demo function
function runTherapyDemo() {
  console.log('🏥 SOULFORGE THERAPY API DEMO\n');
  
  const therapyAPI = new TherapyAPI();
  
  // Simulate a CBT session
  console.log('=== CBT Therapy Session ===');
  const sessionId = therapyAPI.startSession('client123', 'cbt');
  console.log('Session started:', sessionId);
  
  const messages = [
    "I've been having trouble sleeping and I keep worrying about everything",
    "I always think something bad is going to happen",
    "I feel like I should be able to handle this on my own",
    "That makes sense, I never thought about it that way"
  ];
  
  messages.forEach(message => {
    console.log(`\nClient: "${message}"`);
    const response = therapyAPI.sendMessage(sessionId, message);
    console.log(`Therapist: "${response.response}"`);
    console.log(`💭 Mood: ${response.mood}`);
    console.log(`🔍 Insights: ${response.therapeuticInsights.join(', ') || 'None'}`);
    console.log(`🛠️ Techniques: ${response.suggestedTechniques.join(', ') || 'None'}`);
    console.log(`⚠️ Risk: ${response.riskAssessment}`);
  });
  
  const summary = therapyAPI.getSessionSummary(sessionId);
  console.log('\n📋 Session Summary:');
  console.log(`Duration: ${Math.round(summary.duration / 1000)} seconds`);
  console.log(`Messages: ${summary.messageCount}`);
  console.log(`Insights: ${summary.therapistInsights.join(', ')}`);
  console.log(`Recommendations: ${summary.recommendations.join(', ')}`);
  
  console.log('\n🎯 This demonstrates:');
  console.log('✅ AI therapists with specialized training and personalities');
  console.log('✅ Real-time therapeutic insight generation');
  console.log('✅ Risk assessment and safety monitoring');
  console.log('✅ Session analytics and progress tracking');
  console.log('✅ RESTful API for integration with therapy apps');
}

// Run demo
if (require.main === module) {
  runTherapyDemo();
}

export { TherapyAPI };
