import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollegeExamPrep } from './CollegeExamPrep';
import { PlacementPrep } from './PlacementPrep';
import type { User } from '@/App';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('placement');

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-2">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p className="text-gray-600">
            Choose your preparation path and start learning with AI-powered guidance.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="college" 
              className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                College Exam Prep
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="placement"
              className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Placement Prep
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="college" className="space-y-6">
            <CollegeExamPrep />
          </TabsContent>

          <TabsContent value="placement" className="space-y-6">
            <PlacementPrep />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
