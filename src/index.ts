// SoulForge - A Framework for Building Digital Beings
// "Not just chatbots — you create entities."

import { Soul } from './soul';

export { Soul } from './soul';
export { MemorySystem } from './memory-system';
export { MoodEngine } from './mood-engine';
export { PersonalitySystem } from './personality-system';

export * from './types';

// Convenience factory functions
export function createSoul(name: string, role: string) {
  return new Soul().withIdentity({ name, role });
}

export function createCompanion(name: string) {
  return new Soul()
    .withIdentity({ name, role: 'Companion' })
    .withEmpathy(85)
    .withPersonality({
      bigFive: {
        openness: 75,
        conscientiousness: 65,
        extraversion: 70,
        agreeableness: 85,
        neuroticism: 25
      },
      mbti: 'ENFJ'
    });
}

export function createNPC(name: string, role: string, archetype: string = 'The Guide') {
  return new Soul()
    .withIdentity({ name, role })
    .withPersonality({
      bigFive: {
        openness: 60,
        conscientiousness: 70,
        extraversion: 55,
        agreeableness: 65,
        neuroticism: 40
      },
      archetype
    });
}

export function createTeacher(name: string, subject?: string) {
  const role = subject ? `${subject} Teacher` : 'Teacher';
  return new Soul()
    .withIdentity({ name, role })
    .withEmpathy(80)
    .withPersonality({
      bigFive: {
        openness: 85,
        conscientiousness: 90,
        extraversion: 60,
        agreeableness: 75,
        neuroticism: 20
      },
      mbti: 'ENFJ',
      archetype: 'The Mentor'
    });
}
