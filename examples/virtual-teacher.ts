// Example: Virtual Teacher
import { createTeacher } from '../src';

const teacher = createTeacher('Professor Chen', 'Computer Science')
  .withMood('curious');

console.log('=== Virtual Teacher Example ===');
console.log('Teacher Status:', teacher.getStatus());

// Student interactions
const lesson1 = teacher.respond('Can you explain what recursion is?', 'student1', 'Alice');
console.log('Professor Chen:', lesson1.response);

const lesson2 = teacher.respond('I\'m struggling with this concept', 'student1', 'Alice');
console.log('Professor Chen:', lesson2.response);
console.log('Empathy response - Mood:', lesson2.mood);

const lesson3 = teacher.respond('Thank you, that makes much more sense now!', 'student1', 'Alice');
console.log('Professor Chen:', lesson3.response);
console.log('Satisfaction - Mood:', lesson3.mood);

// Different student
const lesson4 = teacher.respond('What are the practical applications of AI?', 'student2', 'Bob');
console.log('\nProfessor Chen to Bob:', lesson4.response);

// Teacher reflection on teaching experience
const teacherReflection = teacher.reflect();
console.log('\nTeacher Reflection:');
console.log('Insights:', teacherReflection.insights);
console.log('Personality changes:', teacherReflection.personalityChanges);

export { teacher };
