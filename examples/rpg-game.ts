// Real Project Example: RPG Game with Smart NPCs
// Shows how to use SoulForge for intelligent game characters

import { Soul, createNPC } from '../src';

interface GameWorld {
  npcs: Map<string, GameNPC>;
  playerActions: Array<{
    playerId: string;
    action: string;
    target?: string;
    timestamp: Date;
  }>;
}

interface GameNPC {
  soul: Soul;
  location: string;
  inventory: string[];
  questsOffered: string[];
  relationship: Map<string, number>; // playerId -> relationship level (-100 to 100)
}

class RPGGame {
  private world: GameWorld;
  private questLog: Map<string, any[]> = new Map(); // playerId -> quests

  constructor() {
    this.world = {
      npcs: new Map(),
      playerActions: []
    };
    this.initializeWorld();
  }

  private initializeWorld() {
    // Create diverse NPCs with different personalities and roles

    // 1. Village Blacksmith - Gruff but skilled
    const blacksmith = createNPC('Thorin Ironforge', 'Master Blacksmith', 'The Craftsman')
      .withIdentity({
        background: '30 years of forging weapons and armor',
        goals: ['Create perfect weapons', 'Train worthy apprentices', 'Protect the village'],
        beliefs: ['Quality over quantity', 'Hard work pays off', 'Respect must be earned'],
        values: ['Craftsmanship', 'Tradition', 'Honor']
      })
      .withPersonality({
        bigFive: {
          openness: 40,        // Traditional, set in ways
          conscientiousness: 95, // Extremely meticulous
          extraversion: 30,    // Prefers working alone
          agreeableness: 50,   // Fair but not overly friendly
          neuroticism: 20      // Steady under pressure
        },
        mbti: 'ISTJ'
      });

    // 2. Tavern Keeper - Social and wise
    const tavernKeeper = createNPC('Rosie Goldmug', 'Tavern Keeper', 'The Connector')
      .withIdentity({
        background: 'Runs the village tavern, knows everyone\'s business',
        goals: ['Keep everyone happy', 'Gather information', 'Maintain peace'],
        beliefs: ['Everyone has a story', 'Gossip is valuable currency', 'A drink solves most problems'],
        values: ['Hospitality', 'Community', 'Wisdom']
      })
      .withPersonality({
        bigFive: {
          openness: 80,        // Loves new stories and people
          conscientiousness: 70, // Organized business
          extraversion: 90,    // Highly social
          agreeableness: 85,   // Very friendly
          neuroticism: 25      // Calm and reassuring
        },
        mbti: 'ESFJ'
      });

    // 3. Mysterious Wizard - Eccentric genius
    const wizard = createNPC('Zephyr the Enigmatic', 'Court Wizard', 'The Sage')
      .withIdentity({
        background: 'Centuries of magical study, advisor to royalty',
        goals: ['Unlock universe secrets', 'Prevent magical disasters', 'Find worthy students'],
        beliefs: ['Knowledge is power', 'Magic has consequences', 'Time reveals all truths'],
        values: ['Wisdom', 'Balance', 'Progress']
      })
      .withPersonality({
        bigFive: {
          openness: 98,        // Extremely creative and curious
          conscientiousness: 60, // Focused but absent-minded
          extraversion: 40,    // Prefers solitude for study
          agreeableness: 70,   // Kind but distracted
          neuroticism: 45      // Slightly anxious about magical threats
        },
        mbti: 'INTP'
      });

    // 4. City Guard Captain - Dutiful protector
    const guardCaptain = createNPC('Captain Elena Stormwind', 'Guard Captain', 'The Protector')
      .withIdentity({
        background: 'Rose through ranks, dedicated to law and order',
        goals: ['Protect citizens', 'Maintain justice', 'Train new recruits'],
        beliefs: ['Law applies to everyone', 'Courage in face of danger', 'Teamwork saves lives'],
        values: ['Justice', 'Duty', 'Courage']
      })
      .withPersonality({
        bigFive: {
          openness: 60,        // Open to new tactics
          conscientiousness: 90, // Extremely dutiful
          extraversion: 70,    // Natural leader
          agreeableness: 75,   // Fair and protective
          neuroticism: 20      // Calm in crisis
        },
        mbti: 'ENFJ'
      });

    // Register NPCs
    this.registerNPC('blacksmith', blacksmith, 'Forge', ['Iron Sword', 'Steel Armor', 'Repair Kit'], ['Apprentice Needed', 'Rare Ore Hunt']);
    this.registerNPC('tavern-keeper', tavernKeeper, 'Golden Mug Tavern', ['Ale', 'Bread', 'Room Key'], ['Find Missing Merchant', 'Settle Bar Fight']);
    this.registerNPC('wizard', wizard, 'Wizard Tower', ['Spell Scroll', 'Magic Potion', 'Crystal Orb'], ['Ancient Artifact', 'Stop Dark Ritual']);
    this.registerNPC('guard-captain', guardCaptain, 'Guard House', ['City Map', 'Badge of Honor'], ['Bandit Problem', 'Missing Person']);
  }

  private registerNPC(id: string, soul: Soul, location: string, inventory: string[], quests: string[]) {
    this.world.npcs.set(id, {
      soul,
      location,
      inventory,
      questsOffered: quests,
      relationship: new Map()
    });
  }

  // Player interacts with NPC
  interact(playerId: string, playerName: string, npcId: string, message: string): {
    npcResponse: string;
    mood: string;
    relationshipChange: number;
    availableActions: string[];
    questUpdates: string[];
  } {
    const npc = this.world.npcs.get(npcId);
    if (!npc) {
      throw new Error(`NPC ${npcId} not found`);
    }

    // Get current relationship level
    const currentRelationship = npc.relationship.get(playerId) || 0;

    // NPC responds based on personality and relationship
    const response = npc.soul.respond(message, playerId, playerName);

    // Calculate relationship change based on interaction
    const relationshipChange = this.calculateRelationshipChange(message, response, currentRelationship);
    npc.relationship.set(playerId, Math.max(-100, Math.min(100, currentRelationship + relationshipChange)));

    // Determine available actions based on relationship and NPC type
    const availableActions = this.getAvailableActions(npcId, npc, currentRelationship + relationshipChange);

    // Check for quest updates
    const questUpdates = this.checkQuestUpdates(playerId, npcId, message);

    // Log the interaction
    this.world.playerActions.push({
      playerId,
      action: `talked to ${npcId}`,
      target: npcId,
      timestamp: new Date()
    });

    return {
      npcResponse: response.response,
      mood: response.mood,
      relationshipChange,
      availableActions,
      questUpdates
    };
  }

  private calculateRelationshipChange(message: string, response: any, currentRel: number): number {
    let change = 0;
    
    // Positive interactions
    if (message.toLowerCase().includes('help') || message.toLowerCase().includes('please')) {
      change += 2;
    }
    if (message.toLowerCase().includes('thank')) {
      change += 3;
    }
    
    // Negative interactions
    if (message.toLowerCase().includes('stupid') || message.toLowerCase().includes('useless')) {
      change -= 5;
    }
    if (message.toLowerCase().includes('threat') || message.toLowerCase().includes('kill')) {
      change -= 10;
    }
    
    // Mood-based adjustments
    if (response.mood === 'joyful' || response.mood === 'content') {
      change += 1;
    } else if (response.mood === 'frustrated' || response.mood === 'anxious') {
      change -= 1;
    }
    
    return change;
  }

  private getAvailableActions(npcId: string, npc: GameNPC, relationship: number): string[] {
    const actions = ['Talk', 'Ask about location'];
    
    // Relationship-based actions
    if (relationship > 20) {
      actions.push('Ask for favor');
    }
    if (relationship > 50) {
      actions.push('Share secret');
    }
    if (relationship < -20) {
      actions.push('Apologize');
    }
    
    // NPC-specific actions
    switch (npcId) {
      case 'blacksmith':
        actions.push('Buy weapon', 'Repair equipment');
        if (relationship > 30) actions.push('Learn crafting');
        break;
      case 'tavern-keeper':
        actions.push('Buy drink', 'Rent room', 'Ask for gossip');
        break;
      case 'wizard':
        actions.push('Buy spell', 'Ask about magic');
        if (relationship > 40) actions.push('Request training');
        break;
      case 'guard-captain':
        actions.push('Report crime', 'Ask for directions');
        if (relationship > 60) actions.push('Join guard');
        break;
    }
    
    return actions;
  }

  private checkQuestUpdates(playerId: string, npcId: string, message: string): string[] {
    const updates: string[] = [];
    
    // Simple quest progression logic
    if (message.toLowerCase().includes('quest') || message.toLowerCase().includes('job')) {
      const npc = this.world.npcs.get(npcId);
      if (npc && npc.questsOffered.length > 0) {
        updates.push(`New quest available: ${npc.questsOffered[0]}`);
      }
    }
    
    return updates;
  }

  // Get NPC status
  getNPCStatus(npcId: string): any {
    const npc = this.world.npcs.get(npcId);
    if (!npc) return null;

    const status = npc.soul.getStatus();
    return {
      identity: status.identity,
      location: npc.location,
      mood: status.mood,
      personality: status.personality,
      inventory: npc.inventory,
      quests: npc.questsOffered,
      memoryStats: status.memoryStats
    };
  }

  // Simulate a full game interaction
  simulateGameplay(): void {
    console.log('🎮 RPG GAME WITH SOULFORGE NPCs\n');
    
    const scenarios = [
      {
        player: 'Hero',
        npc: 'blacksmith',
        interactions: [
          'Hello, I need a new sword',
          'What materials do you need for the best weapon?',
          'Thank you for your expertise, master blacksmith',
          'I\'ll bring you those rare ores you mentioned'
        ]
      },
      {
        player: 'Rogue',
        npc: 'tavern-keeper',
        interactions: [
          'I\'m looking for information about suspicious activities',
          'Has anyone strange passed through recently?',
          'Thanks for the tip, here\'s a gold coin for your trouble',
          'Keep your ears open for me'
        ]
      },
      {
        player: 'Mage',
        npc: 'wizard',
        interactions: [
          'Master Zephyr, I seek knowledge of ancient magic',
          'Can you teach me about elemental manipulation?',
          'I\'ve brought these rare components as payment',
          'Your wisdom is invaluable, thank you'
        ]
      }
    ];

    scenarios.forEach(scenario => {
      console.log(`=== ${scenario.player} visits the ${scenario.npc} ===\n`);
      
      let totalRelationship = 0;
      
      scenario.interactions.forEach((message, index) => {
        const result = this.interact('player1', scenario.player, scenario.npc, message);
        
        console.log(`${scenario.player}: "${message}"`);
        console.log(`${this.getNPCStatus(scenario.npc).identity.name}: "${result.npcResponse}"`);
        console.log(`💭 Mood: ${result.mood} | Relationship: ${result.relationshipChange > 0 ? '+' : ''}${result.relationshipChange}`);
        console.log(`⚡ Available actions: ${result.availableActions.join(', ')}`);
        
        if (result.questUpdates.length > 0) {
          console.log(`📜 ${result.questUpdates.join(', ')}`);
        }
        
        totalRelationship += result.relationshipChange;
        console.log('');
      });
      
      console.log(`📊 Final relationship with ${this.getNPCStatus(scenario.npc).identity.name}: ${totalRelationship}\n`);
    });

    console.log('🎯 This demonstrates:');
    console.log('✅ NPCs with distinct personalities affecting dialogue');
    console.log('✅ Relationship system based on player interactions');
    console.log('✅ Dynamic available actions based on relationships');
    console.log('✅ Personality-driven responses to same situations');
    console.log('✅ Memory of past interactions influencing behavior');
    console.log('✅ Quest and progression integration');
  }

  // Get world analytics
  getWorldAnalytics(): any {
    const npcAnalytics = Array.from(this.world.npcs.entries()).map(([id, npc]) => {
      const status = npc.soul.getStatus();
      return {
        id,
        name: status.identity.name,
        mood: status.mood,
        totalMemories: status.memoryStats.totalMemories,
        averageRelationship: Array.from(npc.relationship.values()).reduce((a, b) => a + b, 0) / Math.max(npc.relationship.size, 1)
      };
    });

    return {
      totalNPCs: this.world.npcs.size,
      totalInteractions: this.world.playerActions.length,
      npcStatus: npcAnalytics
    };
  }
}

// Demo
if (require.main === module) {
  const game = new RPGGame();
  game.simulateGameplay();
  
  console.log('\n📈 WORLD ANALYTICS:');
  console.log(JSON.stringify(game.getWorldAnalytics(), null, 2));
}

export { RPGGame };
