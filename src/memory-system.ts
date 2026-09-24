import { Memory, SerializedMemory } from './types';
import { v4 as uuidv4 } from 'uuid';
import { parseDate } from './snapshot-utils';

export class MemorySystem {
  private memories: Map<string, Memory> = new Map();
  private shortTermMemory: Memory[] = [];
  private longTermMemory: Memory[] = [];
  private maxShortTermSize: number;
  private maxLongTermSize: number;

  constructor(
    shortTermCapacity: number = 50,
    longTermCapacity: number = 1000
  ) {
    this.maxShortTermSize = shortTermCapacity;
    this.maxLongTermSize = longTermCapacity;
  }

  /**
   * Store a new memory in the system
   */
  store(content: string, type: Memory['type'], importance: number = 50, emotional_weight: number = 0, tags: string[] = []): Memory {
    const memory: Memory = {
      id: uuidv4(),
      content,
      type,
      importance,
      emotional_weight,
      timestamp: new Date(),
      tags,
      associations: []
    };

    this.memories.set(memory.id, memory);
    
    // Add to short-term memory initially
    this.shortTermMemory.unshift(memory);
    
    // Manage memory capacity
    this.consolidateMemories();
    
    return memory;
  }

  /**
   * Retrieve memories based on query and context
   */
  recall(query: string, limit: number = 10, minImportance: number = 0): Memory[] {
    const allMemories = Array.from(this.memories.values());
    
    // Simple relevance scoring based on content matching and importance
    const relevantMemories = allMemories
      .filter(memory => memory.importance >= minImportance)
      .map(memory => ({
        memory,
        relevance: this.calculateRelevance(memory, query)
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(item => item.memory);

    return relevantMemories;
  }

  /**
   * Get memories by type
   */
  getMemoriesByType(type: Memory['type']): Memory[] {
    return Array.from(this.memories.values())
      .filter(memory => memory.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recent memories
   */
  getRecentMemories(count: number = 10): Memory[] {
    return Array.from(this.memories.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  /**
   * Associate two memories together
   */
  associateMemories(memoryId1: string, memoryId2: string): void {
    const memory1 = this.memories.get(memoryId1);
    const memory2 = this.memories.get(memoryId2);
    
    if (memory1 && memory2) {
      if (!memory1.associations) memory1.associations = [];
      if (!memory2.associations) memory2.associations = [];
      
      if (!memory1.associations.includes(memoryId2)) {
        memory1.associations.push(memoryId2);
      }
      if (!memory2.associations.includes(memoryId1)) {
        memory2.associations.push(memoryId1);
      }
    }
  }

  /**
   * Get associated memories for a given memory
   */
  getAssociatedMemories(memoryId: string): Memory[] {
    const memory = this.memories.get(memoryId);
    if (!memory || !memory.associations) return [];
    
    return memory.associations
      .map(id => this.memories.get(id))
      .filter(m => m !== undefined) as Memory[];
  }

  /**
   * Strengthen a memory (increase importance)
   */
  strengthenMemory(memoryId: string, amount: number = 10): void {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.importance = Math.min(100, memory.importance + amount);
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    totalMemories: number;
    shortTermCount: number;
    longTermCount: number;
    averageImportance: number;
    memoryTypes: Record<string, number>;
  } {
    const allMemories = Array.from(this.memories.values());
    const avgImportance = allMemories.reduce((sum, m) => sum + m.importance, 0) / allMemories.length || 0;
    
    const typeCount: Record<string, number> = {};
    allMemories.forEach(memory => {
      typeCount[memory.type] = (typeCount[memory.type] || 0) + 1;
    });

    return {
      totalMemories: allMemories.length,
      shortTermCount: this.shortTermMemory.length,
      longTermCount: this.longTermMemory.length,
      averageImportance: Math.round(avgImportance),
      memoryTypes: typeCount
    };
  }

  /**
   * Calculate relevance score for memory based on query
   */
  private calculateRelevance(memory: Memory, query: string): number {
    const queryLower = query.toLowerCase().trim();
    const contentLower = memory.content.toLowerCase();
    
    let matchScore = 0;
    
    // Direct full-query content match
    if (queryLower.length > 2 && contentLower.includes(queryLower)) {
      matchScore += 100;
    }
    
    // Extract query terms (filter out punctuation and common stop words)
    const stopWords = new Set([
      'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were',
      'i', 'you', 'my', 'your', 'me', 'it', 'its', 'this', 'that', 'these', 'those', 'do', 'does',
      'did', 'can', 'could', 'would', 'should', 'what', 'how', 'why', 'when', 'where', 'who', 'and', 'or', 'so'
    ]);
    
    const queryWords = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
      
    // Keyword matches in memory content
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        matchScore += 25;
      }
    });

    // Tag matches
    if (memory.tags && memory.tags.length > 0) {
      memory.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (queryLower.includes(tagLower)) {
          matchScore += 35;
        }
        queryWords.forEach(word => {
          if (tagLower.includes(word)) {
            matchScore += 20;
          }
        });
      });
    }
    
    // Only apply importance and recency boosts if there is actual relevance
    if (matchScore > 0) {
      // Importance bonus
      matchScore += memory.importance * 0.3;
      
      // Recency bonus (memories created recently get boost)
      const minutesSince = (Date.now() - memory.timestamp.getTime()) / (1000 * 60);
      const recencyBonus = Math.max(0, 15 - minutesSince / 60);
      matchScore += recencyBonus;
    }
    
    return matchScore;
  }

  /**
   * Consolidate memories between short-term and long-term storage
   */
  private consolidateMemories(): void {
    // Move important short-term memories to long-term
    if (this.shortTermMemory.length > this.maxShortTermSize) {
      const toConsolidate = this.shortTermMemory.splice(this.maxShortTermSize);
      
      toConsolidate.forEach(memory => {
        if (memory.importance >= 60) { // Important memories go to long-term
          this.longTermMemory.unshift(memory);
        } else {
          // Less important memories are forgotten
          this.memories.delete(memory.id);
        }
      });
    }
    
    // Maintain long-term memory capacity
    if (this.longTermMemory.length > this.maxLongTermSize) {
      const forgotten = this.longTermMemory.splice(this.maxLongTermSize);
      forgotten.forEach(memory => {
        this.memories.delete(memory.id);
      });
    }
  }

  /**
   * Export memories for persistence (dates as ISO strings, JSON-safe)
   */
  export(): SerializedMemory[] {
    return Array.from(this.memories.values()).map(memory => ({
      ...memory,
      timestamp: memory.timestamp.toISOString()
    }));
  }

  /**
   * Replace current memory state with data from a snapshot.
   * Clearing first means repeated imports don't duplicate memories.
   */
  import(memories: SerializedMemory[]): void {
    this.memories.clear();
    this.shortTermMemory = [];
    this.longTermMemory = [];

    memories.forEach(serialized => {
      const memory: Memory = {
        ...serialized,
        timestamp: parseDate(serialized.timestamp, `memory[${serialized.id}].timestamp`)
      };
      this.memories.set(memory.id, memory);
      if (memory.importance >= 60) {
        this.longTermMemory.push(memory);
      } else {
        this.shortTermMemory.push(memory);
      }
    });

    this.consolidateMemories();
  }
}