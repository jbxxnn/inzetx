'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import type { WizardData } from './FreelancerWizard';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiMagicIcon, ArrowUpLeft02Icon, ArrowUpRight02Icon } from '@hugeicons/core-free-icons';

interface Step2DescriptionProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}


type SubStep = 'skills' | 'description' | 'tasks';

export function Step2Description({ data, onUpdate, onNext, onPrevious }: Step2DescriptionProps) {
  const [description, setDescription] = useState(data.description || '');
  const [exampleTasks, setExampleTasks] = useState<string[]>(data.exampleTasks || []);
  const [customTask, setCustomTask] = useState('');
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  
  // Progressive step state - initialize based on existing data
  const getInitialSubStep = (): SubStep => {
    if (!data.skills || data.skills.length === 0) return 'skills';
    if (!data.description || data.description.trim().length === 0) return 'description';
    return 'tasks';
  };
  
  const [currentSubStep, setCurrentSubStep] = useState<SubStep>(getInitialSubStep());
  const [isAnimating, setIsAnimating] = useState(false);
  
  // AI Assistant state
  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  
  // AI-generated example tasks state
  const [aiGeneratedTasks, setAiGeneratedTasks] = useState<string[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const tasksTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // AI-generated skills state
  const [aiGeneratedSkills, setAiGeneratedSkills] = useState<string[]>([]);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const skillsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced effect to generate skills when user types
  useEffect(() => {
    // Clear existing timeout
    if (skillsTimeoutRef.current) {
      clearTimeout(skillsTimeoutRef.current);
    }

    // Only generate if user has typed something
    if (!customSkill || customSkill.trim().length === 0) {
      setAiGeneratedSkills([]);
      return;
    }

    // Debounce the API call
    skillsTimeoutRef.current = setTimeout(async () => {
      const input = customSkill.trim();
      if (!input) {
        setAiGeneratedSkills([]);
        return;
      }

      setIsGeneratingSkills(true);
      try {
        const response = await fetch('/api/ai/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            input,
            existingSkills: skills,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate skills');

        const { skills: generatedSkills } = await response.json();
        setAiGeneratedSkills(generatedSkills);
      } catch (error) {
        console.error('Error generating skills:', error);
        // Don't show error to user, just keep existing suggestions
      } finally {
        setIsGeneratingSkills(false);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => {
      if (skillsTimeoutRef.current) {
        clearTimeout(skillsTimeoutRef.current);
      }
    };
  }, [customSkill, skills]);

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      onUpdate({ skills: newSkills });
      setCustomSkill('');
      setAiGeneratedSkills([]); // Clear suggestions after adding
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    onUpdate({ skills: newSkills });
  };

  const handleAddTask = (task: string) => {
    if (task && !exampleTasks.includes(task)) {
      const newTasks = [...exampleTasks, task];
      setExampleTasks(newTasks);
      onUpdate({ exampleTasks: newTasks });
      setCustomTask('');
    }
  };

  const handleRemoveTask = (task: string) => {
    const newTasks = exampleTasks.filter((t) => t !== task);
    setExampleTasks(newTasks);
    onUpdate({ exampleTasks: newTasks });
  };

  const handleOpenAIAssistant = async () => {
    if (skills.length === 0) return;
    
    setIsAISheetOpen(true);
    setIsGeneratingQuestions(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setGeneratedDescription('');

    try {
      const response = await fetch('/api/ai/description-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const { questions: generatedQuestions } = await response.json();
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGenerateDescription = async () => {
    if (questions.length === 0 || Object.keys(answers).length === 0) return;

    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/ai/description-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, answers }),
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const { description } = await response.json();
      setGeneratedDescription(description);
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleUseGeneratedDescription = () => {
    if (generatedDescription) {
      setDescription(generatedDescription);
      setIsAISheetOpen(false);
    }
  };

  // Generate AI example tasks based on skills and description
  const generateExampleTasks = async (skillsToUse: string[], descriptionToUse: string) => {
    if (skillsToUse.length === 0) {
      setAiGeneratedTasks([]);
      return;
    }

    setIsGeneratingTasks(true);
    try {
      const response = await fetch('/api/ai/example-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          skills: skillsToUse,
          description: descriptionToUse || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate tasks');

      const { tasks } = await response.json();
      setAiGeneratedTasks(tasks);
    } catch (error) {
      console.error('Error generating example tasks:', error);
      // Don't show error to user, just keep existing suggestions
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Debounced effect to generate tasks when skills or description change
  useEffect(() => {
    // Clear existing timeout
    if (tasksTimeoutRef.current) {
      clearTimeout(tasksTimeoutRef.current);
    }

    // Only generate if we have skills
    if (skills.length === 0) {
      setAiGeneratedTasks([]);
      return;
    }

    // Debounce the API call
    tasksTimeoutRef.current = setTimeout(() => {
      generateExampleTasks(skills, description);
    }, 1000); // Wait 1 second after user stops typing/selecting

    return () => {
      if (tasksTimeoutRef.current) {
        clearTimeout(tasksTimeoutRef.current);
      }
    };
  }, [skills, description]);

  const handleRefreshTasks = () => {
    generateExampleTasks(skills, description);
  };

  // Handle progression to next sub-step
  const handleContinueToNext = () => {
    if (currentSubStep === 'skills') {
      if (skills.length === 0) return; // Can't continue without skills
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('description');
        setIsAnimating(false);
      }, 400); // Match animation duration
    } else if (currentSubStep === 'description') {
      if (description.trim().length === 0) return; // Can't continue without description
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('tasks');
        setIsAnimating(false);
      }, 400);
    }
  };

  // Handle going back to previous sub-step
  const handleBackToPrevious = () => {
    if (currentSubStep === 'tasks') {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('description');
        setIsAnimating(false);
      }, 400);
    } else if (currentSubStep === 'description') {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('skills');
        setIsAnimating(false);
      }, 400);
    }
  };

  const handleNext = () => {
    onUpdate({
      description: description.trim(),
      exampleTasks,
      skills,
    });
    onNext();
  };

  const isValid = description.trim().length > 0;
  
  // Use only AI-generated tasks, filtering out already selected tasks
  const uniqueTaskSuggestions = aiGeneratedTasks.filter(
    (task) => !exampleTasks.includes(task)
  );

  return (
    <div className="flex flex-col gap-6  lg:overflow-y-auto lg:px-4 w-full">
      <div className="relative min-h-[400px]">
        {/* Skills Selector */}
        {currentSubStep === 'skills' && (
          <div className={`flex flex-col gap-6 ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
            <div className="flex flex-col gap-2">
          <Label className="text-secondary-foreground text-2xl md:text-2xl text-center lg:text-left font-bold">
            Your Skills <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-secondary-foreground mb-2">
            Select the skills that best describe what you can do. This helps us create a better description for you.
          </p>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 rounded-full bg-primary text-secondary-foreground">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-2">
            <Input
              type="text"
              value={customSkill}
              className="bg-primary-foreground h-15 pl-8 text-5xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customSkill.trim()) {
                  e.preventDefault();
                  handleAddSkill(customSkill.trim());
                }
              }}
              placeholder="Type a skill or keyword to get suggestions..."
            />
            <Button
              type="button"
              variant="outline"
              className="bg-secondary-foreground border border-primary rounded-full text-secondary w-full lg:w-36 h-15 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground text-3xl"
              onClick={() => {
                if (customSkill.trim()) {
                  handleAddSkill(customSkill.trim());
                }
              }}
            >
              Add
            </Button>
          </div>

          {/* AI-generated skill suggestions */}
          {isGeneratingSkills && aiGeneratedSkills.length === 0 && (
            <div className="flex items-center justify-center py-4 text-sm text-secondary-foreground">
              <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
              {/* Generating skill suggestions... */}
            </div>
          )}

          {aiGeneratedSkills.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-secondary-foreground">
                Suggested skills based on &quot;{customSkill}&quot;
              </p>
              <div className="flex flex-wrap gap-2">
                {aiGeneratedSkills.filter((skill) => !skills.includes(skill)).map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant="outline"
                    className="bg-primary-foreground h-10 text-sm md:text-sm border border-primary rounded-full text-secondary-foreground placeholder:text-secondary-foreground hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                    size="sm"
                    onClick={() => handleAddSkill(skill)}
                  >
                    + {skill}
                  </Button>
                ))}
              </div>
            </div>
          )}
            </div>
            
            {/* Continue button for skills */}
            {skills.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleContinueToNext}
                  className="bg-secondary-foreground border border-primary rounded-full text-secondary w-14 h-14 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground rotate-45"
                >
                  <HugeiconsIcon icon={ArrowUpRight02Icon} size={24} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Description Field with AI Assistant */}
        {currentSubStep === 'description' && (
          <div className={`flex flex-col gap-6 ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
            {/* Back button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPrevious}
              className="bg-secondary-foreground border border-primary rounded-full text-secondary w-10 h-10 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground mb-2 rotate-[-45deg]"
            >
             <HugeiconsIcon icon={ArrowUpLeft02Icon} size={24} />
            </Button>
            <div className="flex flex-col gap-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            <Label htmlFor="description" className="text-secondary-foreground text-2xl md:text-2xl text-center lg:text-left font-bold">
              Description <span className="text-destructive">*</span>
            </Label>
            {skills.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-secondary-foreground border border-primary rounded-full text-secondary hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground w-full lg:w-auto"
                onClick={handleOpenAIAssistant}
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-sm md:text-sm">Help me write it</span>
              </Button>
            )}
          </div>
          <p className="text-sm text-secondary-foreground">
            Be specific about your skills and experience. This helps our AI create a better profile for you.
          </p>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: 'I can assemble furniture, fix small repairs at home, help move boxes, and do basic gardening. I have experience with IKEA furniture assembly and basic home maintenance.'"
            className="flex min-h-[150px] w-full text-secondary-foreground rounded-md border border-accent bg-primary-foreground px-4 py-2 text-md md:text-md shadow-sm placeholder:text-secondary-foreground/50 focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            required
            style={{
              borderRadius: '30px',
            }}
          />
          <p className="text-xs text-secondary-foreground">
            {skills.length === 0 
              ? 'Select your skills above, then use "Help me write it" to get AI assistance.'
              : 'Be specific about your skills and experience. This helps our AI create a better profile for you.'}
          </p>
            </div>
            
            {/* Continue button for description */}
            {description.trim().length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleContinueToNext}
                  className="bg-secondary-foreground border border-primary rounded-full text-secondary w-14 h-14 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground rotate-45"
                >
                  <HugeiconsIcon icon={ArrowUpRight02Icon} size={24} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Example Tasks */}
        {currentSubStep === 'tasks' && (
          <div className={`flex flex-col gap-6 ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
            {/* Back button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPrevious}
              className="bg-secondary-foreground border border-primary rounded-full text-secondary w-10 h-10 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground mb-2 rotate-[-45deg]"
            >
             <HugeiconsIcon icon={ArrowUpLeft02Icon} size={24} />
            </Button>
            <div className="flex flex-col gap-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            <Label className="text-secondary-foreground text-lg md:text-lg text-center lg:text-left">Example Tasks</Label>
            {skills.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-secondary-foreground border border-primary rounded-full text-secondary hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground w-full lg:w-auto"
                onClick={handleRefreshTasks}
                disabled={isGeneratingTasks}
              >
                {isGeneratingTasks ? (
                  <>
                  <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Refresh suggestions
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-sm text-secondary-foreground mb-2">
            {skills.length > 0
              ? 'AI-generated suggestions based on your skills. Click to add or add your own.'
              : 'Add specific tasks you can help with. Select your skills above to get AI-generated suggestions.'}
          </p>
          
          {exampleTasks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {exampleTasks.map((task) => (
                <Badge key={task} variant="secondary" className="flex items-center gap-1 rounded-full bg-primary text-secondary-foreground">
                  {task}
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {isGeneratingTasks && aiGeneratedTasks.length === 0 && (
            <div className="flex items-center justify-center py-4 text-sm text-secondary-foreground">
              <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
              Generating task suggestions...
            </div>
          )}

          {uniqueTaskSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {uniqueTaskSuggestions.map((task) => (
                <Button
                  key={task}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-primary-foreground h-10 text-sm md:text-sm border border-primary rounded-full text-secondary-foreground placeholder:text-secondary-foreground hover:bg-primary hover:text-secondary-foreground"
                  onClick={() => handleAddTask(task)}
                >
                  + {task}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-2">
            <Input
              type="text"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customTask.trim()) {
                  e.preventDefault();
                  handleAddTask(customTask.trim());
                }
              }}
              placeholder="Add a custom task..."
              className="bg-primary-foreground h-15 pl-8 text-5xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (customTask.trim()) {
                  handleAddTask(customTask.trim());
                }
              }}
              className="bg-secondary-foreground border border-primary rounded-full text-secondary w-full lg:w-36 h-15 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground text-3xl"
               >
              Add
            </Button>
          </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between gap-4 mt-8">
        <Button variant="outline" onClick={onPrevious} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
          Previous
        </Button>
        {currentSubStep === 'tasks' && (
          <Button onClick={handleNext} disabled={!isValid} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
            Next: Location & Service Area
          </Button>
        )}
      </div>

      {/* AI Assistant Modal */}
      <Dialog open={isAISheetOpen} onOpenChange={setIsAISheetOpen}>
        <DialogContent className="sm:max-w-lg bg-secondary border border-primary" style={{ borderRadius: '10px' }}>
          <DialogHeader>
            <DialogTitle>AI Description Assistant</DialogTitle>
            <DialogDescription className="text-secondary-foreground">
              Answer a few questions about your skills and we&apos;ll create a compelling description for you.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-6">
            {isGeneratingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
                <span className="ml-2 text-sm text-secondary-foreground">Generating questions...</span>
              </div>
            ) : questions.length > 0 ? (
              <>
                {!generatedDescription ? (
                  <>
                    {/* Questions Flow */}
                    <div className="flex flex-col gap-4">
                      <div className="text-sm text-secondary-foreground">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Label>{questions[currentQuestionIndex]}</Label>
                        <textarea
                          value={answers[questions[currentQuestionIndex]] || ''}
                          onChange={(e) => handleAnswerChange(questions[currentQuestionIndex], e.target.value)}
                          placeholder="Type your answer here..."
                          className="flex min-h-[100px] w-full rounded-md border border-primary bg-primary-foreground px-3 py-2 text-sm shadow-sm placeholder:text-secondary-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          style={{ borderRadius: '10px' }}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                        >
                          Previous
                        </Button>
                        {currentQuestionIndex < questions.length - 1 ? (
                          <Button onClick={handleNextQuestion} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
                            Next
                          </Button>
                        ) : (
                          <Button
                            onClick={handleGenerateDescription}
                            disabled={isGeneratingDescription || !answers[questions[currentQuestionIndex]]?.trim()}
                            className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                          >
                            {isGeneratingDescription ? (
                              <>
                                <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
                                Generating...
                              </>
                            ) : (
                              'Generate Description'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Generated Description Preview */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label>Generated Description</Label>
                        <div className="mt-2 p-4 bg-secondary-foreground rounded-md border border-primary" style={{ borderRadius: '10px' }}>
                          <p className="text-sm whitespace-pre-wrap">{generatedDescription}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setGeneratedDescription('');
                            setCurrentQuestionIndex(0);
                            setAnswers({});
                          }}
                          className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                        >
                          Start Over
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDescription}
                          className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                        >
                          {isGeneratingDescription ? (
                            <>
                              <HugeiconsIcon icon={AiMagicIcon} className="animate-pulse" />
                              Regenerating...
                            </>
                          ) : (
                            'Regenerate'
                          )}
                        </Button>
                        <Button
                          onClick={handleUseGeneratedDescription}
                          className="flex-1 bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground"
                        >
                          Use This Description
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-sm text-secondary-foreground text-center py-8">
                No questions generated. Please try again.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


