import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Simulated AI response - In production, this would call an actual API
const simulateAIResponse = async (prompt: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses: Record<string, string> = {
    'frontend': `Here are some common Frontend Developer interview questions:

**Technical Questions:**
1. What is the Virtual DOM and how does it work?
2. Explain the difference between props and state in React.
3. What are React Hooks and why were they introduced?
4. How do you optimize React application performance?
5. Explain CSS specificity and how it works.

**Behavioral Questions:**
1. Tell me about a challenging project you worked on.
2. How do you stay updated with the latest frontend technologies?
3. Describe your approach to debugging a complex issue.

Would you like me to provide detailed answers for any of these questions?`,

    'backend': `Here are essential Backend Developer interview questions:

**Technical Questions:**
1. Explain RESTful API design principles.
2. What is database normalization and why is it important?
3. How do you handle authentication and authorization?
4. Explain the concept of microservices architecture.
5. What are the differences between SQL and NoSQL databases?

**System Design:**
1. Design a URL shortening service.
2. How would you design a scalable notification system?
3. Explain how you would handle millions of concurrent users.

Would you like detailed explanations for any topic?`,

    'fullstack': `Full Stack Developer interview preparation:

**Frontend:**
1. Explain component lifecycle in React.
2. What is server-side rendering and its benefits?
3. How do you manage state in large applications?

**Backend:**
1. Design a scalable database schema for an e-commerce app.
2. Explain caching strategies and their implementations.
3. How do you ensure API security?

**DevOps:**
1. Explain CI/CD pipeline.
2. What is containerization and how does Docker work?

Which area would you like to focus on?`,

    'default': `I'd be happy to help you prepare for your interview! Here are some general tips:

**Preparation Strategy:**
1. Research the company thoroughly
2. Practice coding problems on LeetCode/HackerRank
3. Prepare STAR format answers for behavioral questions
4. Review fundamental concepts in your tech stack

**During the Interview:**
1. Think out loud when solving problems
2. Ask clarifying questions
3. Discuss trade-offs in your solutions
4. Be honest about what you don't know

What specific role or technology would you like to focus on?`
  };

  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('frontend') || lowerPrompt.includes('react')) return responses.frontend;
  if (lowerPrompt.includes('backend') || lowerPrompt.includes('node')) return responses.backend;
  if (lowerPrompt.includes('fullstack') || lowerPrompt.includes('full stack')) return responses.fullstack;
  return responses.default;
};

// Mock Test Data
const mockTests = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your core JavaScript knowledge',
    questions: 10,
    duration: '15 min',
    difficulty: 'Easy',
    tags: ['JS', 'ES6', 'Basics'],
  },
  {
    id: 2,
    title: 'React Advanced Concepts',
    description: 'Hooks, Context, Performance Optimization',
    questions: 15,
    duration: '25 min',
    difficulty: 'Medium',
    tags: ['React', 'Hooks', 'Performance'],
  },
  {
    id: 3,
    title: 'System Design Basics',
    description: 'Scalability, Database Design, APIs',
    questions: 8,
    duration: '30 min',
    difficulty: 'Hard',
    tags: ['System Design', 'Architecture'],
  },
  {
    id: 4,
    title: 'Data Structures & Algorithms',
    description: 'Arrays, Trees, Graphs, Dynamic Programming',
    questions: 12,
    duration: '45 min',
    difficulty: 'Hard',
    tags: ['DSA', 'Algorithms'],
  },
];

// Sample mock test questions
const mockTestQuestions = [
  {
    id: 1,
    question: 'What is the output of: console.log(typeof [])?',
    options: ['"array"', '"object"', '"undefined"', '"null"'],
    correct: 1,
  },
  {
    id: 2,
    question: 'Which method creates a new array with all elements that pass a test?',
    options: ['map()', 'filter()', 'reduce()', 'forEach()'],
    correct: 1,
  },
  {
    id: 3,
    question: 'What is the purpose of the useEffect hook in React?',
    options: [
      'To create state variables',
      'To handle side effects in functional components',
      'To create context providers',
      'To optimize rendering performance'
    ],
    correct: 1,
  },
];

export function PlacementPrep() {
  const [activeTab, setActiveTab] = useState('ai-interview');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I\'m your AI interview assistant. What role are you preparing for? (e.g., Frontend Developer, Backend Developer, Full Stack Developer)' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await simulateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = (testId: number) => {
    setSelectedTest(testId);
    setTestInProgress(true);
    setCurrentQuestion(0);
    setTestAnswers({});
    setTestCompleted(false);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockTestQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    mockTestQuestions.forEach(q => {
      if (testAnswers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  const handleRestartTest = () => {
    setSelectedTest(null);
    setTestInProgress(false);
    setCurrentQuestion(0);
    setTestAnswers({});
    setTestCompleted(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="ai-interview" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Brain className="w-4 h-4 mr-2" />
            AI Interview Prep
          </TabsTrigger>
          <TabsTrigger value="mock-tests" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            Mock Practice Tests
          </TabsTrigger>
        </TabsList>

        {/* AI Interview Prep */}
        <TabsContent value="ai-interview" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Interview Assistant</CardTitle>
                  <p className="text-sm text-gray-500">Get personalized interview questions and answers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === 'ai' && (
                          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span className="text-xs font-medium opacity-70">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about interview questions, topics, or get advice..."
                    className="flex-1 rounded-xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Try: "Give me React interview questions" or "Explain closure in JavaScript"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {['Frontend Developer Questions', 'System Design Basics', 'Behavioral Questions', 'DSA Preparation'].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInputMessage(prompt);
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Mock Tests */}
        <TabsContent value="mock-tests" className="space-y-4">
          {!testInProgress ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {mockTests.map((test) => (
                  <Card key={test.id} className="border-gray-200 hover:shadow-card transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-black mb-1">{test.title}</h3>
                          <p className="text-sm text-gray-500">{test.description}</p>
                        </div>
                        <Badge className={`${
                          test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {test.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {test.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {test.duration}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {test.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Button 
                        onClick={() => handleStartTest(test.id)}
                        className="w-full bg-black hover:bg-gray-800"
                      >
                        Start Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : testCompleted ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">Test Completed!</h3>
                <p className="text-gray-600 mb-6">
                  You scored <span className="font-bold text-green-600">{calculateScore()}</span> out of {mockTestQuestions.length}
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={handleRestartTest} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Take Another Test
                  </Button>
                  <Button onClick={handleRestartTest} className="bg-orange-500 hover:bg-orange-600">
                    Review Answers
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {mockTests.find(t => t.id === selectedTest)?.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {mockTestQuestions.length}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRestartTest}>
                    Exit Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-black mb-4">
                    {mockTestQuestions[currentQuestion].question}
                  </h3>
                  
                  <div className="space-y-3">
                    {mockTestQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(mockTestQuestions[currentQuestion].id, index)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          testAnswers[mockTestQuestions[currentQuestion].id] === index
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            testAnswers[mockTestQuestions[currentQuestion].id] === index
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}>
                            {testAnswers[mockTestQuestions[currentQuestion].id] === index && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {mockTestQuestions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-8 h-1 rounded-full transition-colors ${
                          index < currentQuestion ? 'bg-green-500' :
                          index === currentQuestion ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={testAnswers[mockTestQuestions[currentQuestion].id] === undefined}
                    className="bg-black hover:bg-gray-800"
                  >
                    {currentQuestion < mockTestQuestions.length - 1 ? 'Next Question' : 'Finish Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
