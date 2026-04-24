import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

// Sample MCQ data
const mcqData = [
  {
    id: 1,
    subject: 'Data Structures',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
    correct: 1,
    explanation: 'Binary search works by repeatedly dividing the search interval in half, resulting in logarithmic time complexity.',
  },
  {
    id: 2,
    subject: 'Operating Systems',
    question: 'Which scheduling algorithm provides the shortest average waiting time?',
    options: ['FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'],
    correct: 1,
    explanation: 'Shortest Job First (SJF) scheduling minimizes the average waiting time by executing the shortest jobs first.',
  },
  {
    id: 3,
    subject: 'Database Management',
    question: 'Which normal form eliminates transitive dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correct: 2,
    explanation: 'Third Normal Form (3NF) eliminates transitive dependencies, ensuring that non-key attributes depend only on the primary key.',
  },
  {
    id: 4,
    subject: 'Computer Networks',
    question: 'Which protocol is used for secure web browsing?',
    options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    correct: 2,
    explanation: 'HTTPS (HTTP Secure) encrypts data transmitted between the browser and server using SSL/TLS.',
  },
  {
    id: 5,
    subject: 'Algorithms',
    question: 'What is the space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 2,
    explanation: 'Merge sort requires O(n) auxiliary space to store the temporary arrays during the merge process.',
  },
];

// Sample Q&A data
const qaData = [
  {
    id: 1,
    subject: 'Object-Oriented Programming',
    question: 'Explain the four pillars of OOP.',
    answer: 'The four pillars of Object-Oriented Programming are:\n\n1. **Encapsulation**: Bundling data and methods that operate on that data within a single unit (class), and controlling access to that data.\n\n2. **Inheritance**: Creating new classes from existing ones, allowing code reuse and establishing a parent-child relationship.\n\n3. **Polymorphism**: The ability of objects to take multiple forms, allowing methods to do different things based on the object it is acting upon.\n\n4. **Abstraction**: Hiding complex implementation details and showing only the essential features to the user.',
  },
  {
    id: 2,
    subject: 'Software Engineering',
    question: 'What is the difference between Agile and Waterfall methodologies?',
    answer: '**Waterfall** is a linear, sequential approach where each phase must be completed before the next begins. It\'s rigid but provides clear structure.\n\n**Agile** is iterative and incremental, with continuous feedback and adaptation. It emphasizes:\n- Customer collaboration over contract negotiation\n- Responding to change over following a plan\n- Working software over comprehensive documentation\n- Individuals and interactions over processes and tools',
  },
  {
    id: 3,
    subject: 'Data Structures',
    question: 'Compare Array and Linked List.',
    answer: '**Array:**\n- Fixed size (in most languages)\n- Contiguous memory allocation\n- O(1) access time by index\n- O(n) insertion/deletion in middle\n- Cache friendly\n\n**Linked List:**\n- Dynamic size\n- Non-contiguous memory\n- O(n) access time\n- O(1) insertion/deletion at known position\n- Extra memory for pointers',
  },
];

export function CollegeExamPrep() {
  const [activeMCQ, setActiveMCQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [expandedQA, setExpandedQA] = useState<number | null>(null);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }
    setShowResult(true);
    if (selectedAnswer === mcqData[activeMCQ].correct) {
      setScore(score + 1);
      toast.success('Correct answer!');
    } else {
      toast.error('Incorrect answer');
    }
    setCompleted([...completed, mcqData[activeMCQ].id]);
  };

  const handleNext = () => {
    if (activeMCQ < mcqData.length - 1) {
      setActiveMCQ(activeMCQ + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      toast.success(`Quiz completed! Your score: ${score + (selectedAnswer === mcqData[activeMCQ].correct ? 1 : 0)}/${mcqData.length}`);
    }
  };

  const handleRestart = () => {
    setActiveMCQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Subjects</p>
              <p className="text-2xl font-bold text-blue-900">5</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completed.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Score</p>
              <p className="text-2xl font-bold text-orange-900">{score}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="mcq" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="mcq" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
            <HelpCircle className="w-4 h-4 mr-2" />
            Multiple Choice Questions
          </TabsTrigger>
          <TabsTrigger value="qa" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Question & Answer
          </TabsTrigger>
        </TabsList>

        {/* MCQ Section */}
        <TabsContent value="mcq" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {mcqData[activeMCQ].subject}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Question {activeMCQ + 1} of {mcqData.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Restart
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-xl font-semibold text-black">
                {mcqData[activeMCQ].question}
              </h3>

              <div className="space-y-3">
                {mcqData[activeMCQ].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === index
                        ? showResult
                          ? index === mcqData[activeMCQ].correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-orange-500 bg-orange-50'
                        : showResult && index === mcqData[activeMCQ].correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? showResult
                            ? index === mcqData[activeMCQ].correct
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-orange-500 bg-orange-500'
                          : showResult && index === mcqData[activeMCQ].correct
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {(selectedAnswer === index || (showResult && index === mcqData[activeMCQ].correct)) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-700">{option}</span>
                      {showResult && index === mcqData[activeMCQ].correct && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showResult && selectedAnswer === index && index !== mcqData[activeMCQ].correct && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Explanation</p>
                      <p className="text-blue-700 text-sm">{mcqData[activeMCQ].explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {!showResult ? (
                  <Button 
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    className="bg-black hover:bg-gray-800"
                  >
                    {activeMCQ < mcqData.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="flex gap-2">
            {mcqData.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < activeMCQ ? 'bg-green-500' : 
                  index === activeMCQ ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </TabsContent>

        {/* Q&A Section */}
        <TabsContent value="qa" className="space-y-4">
          {qaData.map((item) => (
            <Card key={item.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-700 mb-2">
                  {item.subject}
                </Badge>
                <CardTitle className="text-lg font-semibold text-black">
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setExpandedQA(expandedQA === item.id ? null : item.id)}
                  className="w-full justify-between"
                >
                  {expandedQA === item.id ? 'Hide Answer' : 'Show Answer'}
                  <ArrowRight className={`w-4 h-4 transition-transform ${expandedQA === item.id ? 'rotate-90' : ''}`} />
                </Button>
                
                {expandedQA === item.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-slide-up">
                    <div className="prose prose-sm max-w-none">
                      {item.answer.split('\n').map((line, i) => (
                        <p key={i} className="text-gray-700 mb-2">
                          {line.startsWith('**') ? (
                            <strong className="text-black">{line.replace(/\*\*/g, '')}</strong>
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
