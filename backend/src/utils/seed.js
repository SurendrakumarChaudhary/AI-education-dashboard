const mongoose = require('mongoose');
const { User, Question, Test } = require('../models');
require('dotenv').config();

// Sample questions data
const sampleQuestions = [
  // Data Structures - MCQ
  {
    type: 'mcq',
    category: 'college',
    subject: 'Data Structures',
    difficulty: 'easy',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    correctAnswer: 1,
    answer: 'O(log n)',
    explanation: 'Binary search works by repeatedly dividing the search interval in half, resulting in logarithmic time complexity.',
    tags: ['algorithms', 'searching', 'complexity']
  },
  {
    type: 'mcq',
    category: 'college',
    subject: 'Data Structures',
    difficulty: 'medium',
    question: 'Which data structure uses LIFO (Last In First Out) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctAnswer: 1,
    answer: 'Stack',
    explanation: 'A stack follows the LIFO principle where the last element added is the first one to be removed.',
    tags: ['stack', 'data-structures']
  },
  {
    type: 'mcq',
    category: 'college',
    subject: 'Data Structures',
    difficulty: 'hard',
    question: 'What is the time complexity of inserting an element in a balanced BST?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    answer: 'O(log n)',
    explanation: 'In a balanced Binary Search Tree, insertion takes O(log n) time as we need to traverse from root to leaf.',
    tags: ['bst', 'trees', 'complexity']
  },
  // Operating Systems - MCQ
  {
    type: 'mcq',
    category: 'college',
    subject: 'Operating Systems',
    difficulty: 'medium',
    question: 'Which scheduling algorithm provides the shortest average waiting time?',
    options: ['FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'],
    correctAnswer: 1,
    answer: 'SJF (Shortest Job First)',
    explanation: 'SJF scheduling minimizes the average waiting time by executing the shortest jobs first.',
    tags: ['scheduling', 'cpu-scheduling']
  },
  {
    type: 'mcq',
    category: 'college',
    subject: 'Operating Systems',
    difficulty: 'easy',
    question: 'What is a deadlock?',
    options: [
      'A process that runs forever',
      'A situation where two or more processes are waiting for each other',
      'A system crash',
      'Memory overflow'
    ],
    correctAnswer: 1,
    answer: 'A situation where two or more processes are waiting for each other',
    explanation: 'Deadlock occurs when processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.',
    tags: ['deadlock', 'process-management']
  },
  // Database Management - MCQ
  {
    type: 'mcq',
    category: 'college',
    subject: 'Database Management',
    difficulty: 'medium',
    question: 'Which normal form eliminates transitive dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctAnswer: 2,
    answer: '3NF (Third Normal Form)',
    explanation: 'Third Normal Form eliminates transitive dependencies, ensuring non-key attributes depend only on the primary key.',
    tags: ['normalization', 'database-design']
  },
  // Computer Networks - MCQ
  {
    type: 'mcq',
    category: 'college',
    subject: 'Computer Networks',
    difficulty: 'easy',
    question: 'Which protocol is used for secure web browsing?',
    options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    correctAnswer: 2,
    answer: 'HTTPS',
    explanation: 'HTTPS (HTTP Secure) encrypts data transmitted between the browser and server using SSL/TLS.',
    tags: ['networking', 'security', 'web']
  },
  // Algorithms - MCQ
  {
    type: 'mcq',
    category: 'college',
    subject: 'Algorithms',
    difficulty: 'medium',
    question: 'What is the space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 2,
    answer: 'O(n)',
    explanation: 'Merge sort requires O(n) auxiliary space to store temporary arrays during the merge process.',
    tags: ['sorting', 'merge-sort', 'complexity']
  },
  // OOP - Q&A
  {
    type: 'qa',
    category: 'college',
    subject: 'Object-Oriented Programming',
    difficulty: 'medium',
    question: 'Explain the four pillars of OOP.',
    answer: `The four pillars of Object-Oriented Programming are:

1. Encapsulation: Bundling data and methods that operate on that data within a single unit (class), and controlling access to that data.

2. Inheritance: Creating new classes from existing ones, allowing code reuse and establishing a parent-child relationship.

3. Polymorphism: The ability of objects to take multiple forms, allowing methods to do different things based on the object it is acting upon.

4. Abstraction: Hiding complex implementation details and showing only the essential features to the user.`,
    explanation: 'These four principles form the foundation of object-oriented programming and help in creating modular, reusable, and maintainable code.',
    tags: ['oop', 'programming-paradigms']
  },
  // Software Engineering - Q&A
  {
    type: 'qa',
    category: 'college',
    subject: 'Software Engineering',
    difficulty: 'medium',
    question: 'What is the difference between Agile and Waterfall methodologies?',
    answer: `Waterfall is a linear, sequential approach where each phase must be completed before the next begins. It's rigid but provides clear structure.

Agile is iterative and incremental, with continuous feedback and adaptation. It emphasizes:
- Customer collaboration over contract negotiation
- Responding to change over following a plan
- Working software over comprehensive documentation
- Individuals and interactions over processes and tools`,
    explanation: 'Agile is more flexible and suitable for projects with changing requirements, while Waterfall works well for projects with well-defined requirements.',
    tags: ['methodologies', 'project-management']
  },
  // Data Structures - Q&A
  {
    type: 'qa',
    category: 'college',
    subject: 'Data Structures',
    difficulty: 'medium',
    question: 'Compare Array and Linked List.',
    answer: `Array:
- Fixed size (in most languages)
- Contiguous memory allocation
- O(1) access time by index
- O(n) insertion/deletion in middle
- Cache friendly

Linked List:
- Dynamic size
- Non-contiguous memory
- O(n) access time
- O(1) insertion/deletion at known position
- Extra memory for pointers`,
    explanation: 'Arrays are better for random access and cache performance, while linked lists excel at dynamic size and efficient insertions/deletions.',
    tags: ['arrays', 'linked-lists', 'comparison']
  },
  // Frontend - Placement MCQ
  {
    type: 'mcq',
    category: 'placement',
    subject: 'Frontend Development',
    role: 'Frontend Developer',
    difficulty: 'medium',
    question: 'What is the Virtual DOM in React?',
    options: [
      'A direct copy of the actual DOM',
      'A lightweight JavaScript representation of the DOM',
      'A browser API',
      'A CSS framework'
    ],
    correctAnswer: 1,
    answer: 'A lightweight JavaScript representation of the DOM',
    explanation: 'The Virtual DOM is a JavaScript object that represents the real DOM. React uses it to optimize updates by comparing changes and only updating what\'s necessary.',
    tags: ['react', 'virtual-dom', 'frontend']
  },
  // Backend - Placement MCQ
  {
    type: 'mcq',
    category: 'placement',
    subject: 'Backend Development',
    role: 'Backend Developer',
    difficulty: 'medium',
    question: 'What is REST?',
    options: [
      'A programming language',
      'An architectural style for designing networked applications',
      'A database system',
      'A frontend framework'
    ],
    correctAnswer: 1,
    answer: 'An architectural style for designing networked applications',
    explanation: 'REST (Representational State Transfer) is an architectural style that defines a set of constraints for creating web services.',
    tags: ['rest', 'api', 'backend']
  }
];

// Sample tests data
const sampleTests = [
  {
    title: 'Data Structures Fundamentals',
    description: 'Test your knowledge of basic data structures including arrays, linked lists, stacks, and queues.',
    category: 'college',
    subject: 'Data Structures',
    difficulty: 'easy',
    settings: {
      duration: 15,
      passingScore: 60,
      allowRetake: true,
      showAnswers: true,
      shuffleQuestions: true
    },
    tags: ['data-structures', 'basics']
  },
  {
    title: 'Operating Systems Basics',
    description: 'Cover process management, memory management, and file systems.',
    category: 'college',
    subject: 'Operating Systems',
    difficulty: 'medium',
    settings: {
      duration: 20,
      passingScore: 65,
      allowRetake: true,
      showAnswers: true,
      shuffleQuestions: true
    },
    tags: ['os', 'processes', 'memory']
  },
  {
    title: 'Frontend Developer Interview',
    description: 'Practice questions for Frontend Developer role covering React, JavaScript, and CSS.',
    category: 'placement',
    subject: 'Frontend Development',
    role: 'Frontend Developer',
    difficulty: 'medium',
    settings: {
      duration: 30,
      passingScore: 70,
      allowRetake: true,
      showAnswers: true,
      shuffleQuestions: true
    },
    tags: ['frontend', 'react', 'javascript']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devio');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Question.deleteMany({});
    await Test.deleteMany({});
    console.log('Cleared existing questions and tests');

    // Insert questions
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`Inserted ${questions.length} questions`);

    // Create tests with question references
    for (const testData of sampleTests) {
      // Find relevant questions for this test
      const relevantQuestions = questions.filter(q => 
        q.subject === testData.subject && 
        q.category === testData.category
      ).slice(0, 5); // Take first 5 questions

      if (relevantQuestions.length > 0) {
        const testQuestions = relevantQuestions.map((q, index) => ({
          question: q._id,
          order: index
        }));

        await Test.create({
          ...testData,
          questions: testQuestions
        });
        console.log(`Created test: ${testData.title}`);
      }
    }

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@devio.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@devio.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Created admin user: admin@devio.com / admin123');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Admin: admin@devio.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
