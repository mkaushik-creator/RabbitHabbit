import { useState } from 'react';
import { OnboardingInput } from '@shared/schema';
import QuestionCard from './QuestionCard';
import { CONTENT_TYPES, AUDIENCES, TONES, PLATFORMS, IMAGE_OPTIONS } from '@/constants';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingInput) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<{
    contentType: string;
    audience: string;
    tone: string;
    platforms: string[];
    imageOption: string;
  }>({
    contentType: '',
    audience: '',
    tone: '',
    platforms: [],
    imageOption: '',
  });

  // Questions to ask
  const questions = [
    {
      title: "What type of content do you want to create?",
      description: "Select the type of content you want to generate",
      options: CONTENT_TYPES,
      key: "contentType" as const,
      layout: "grid" as const,
    },
    {
      title: "Who's your target audience?",
      description: "Select the audience you're creating content for",
      options: AUDIENCES,
      key: "audience" as const,
      layout: "list" as const,
    },
    {
      title: "What tone would you like to use?",
      description: "Select the tone for your content",
      options: TONES,
      key: "tone" as const,
      layout: "grid" as const,
    },
    {
      title: "Which platforms do you want to post on?",
      description: "Select all the platforms you want to generate content for",
      options: PLATFORMS,
      key: "platforms" as const,
      layout: "grid" as const,
      multiSelect: true,
    },
    {
      title: "Do you want to include images?",
      description: "Select an image option for your content",
      options: IMAGE_OPTIONS,
      key: "imageOption" as const,
      layout: "list" as const,
    },
  ];

  const currentQuestion = questions[step];
  
  // Handle selection for single select questions
  const handleSingleSelection = (value: string) => {
    const newSelections = { ...selections, [currentQuestion.key]: value };
    setSelections(newSelections);
    
    // If this is the last question, complete the flow
    if (step === questions.length - 1) {
      const formattedData: OnboardingInput = {
        contentType: newSelections.contentType,
        audience: newSelections.audience,
        tone: newSelections.tone,
        platforms: newSelections.platforms,
        imageOption: newSelections.imageOption,
      };
      onComplete(formattedData);
    } else {
      // Otherwise, go to next question
      setStep(step + 1);
    }
  };
  
  // Handle selection for multi-select questions
  const handleMultiSelection = (value: string) => {
    const currentValues = selections[currentQuestion.key] as string[];
    const newValues = currentValues.includes(value) 
      ? currentValues.filter(v => v !== value)  // Remove if already selected
      : [...currentValues, value];              // Add if not already selected
    
    setSelections({ ...selections, [currentQuestion.key]: newValues });
  };
  
  // Decide whether to show continue button based on if it's multi-select
  const showContinueButton = currentQuestion.multiSelect;
  
  // Handle continue button for multi-select questions
  const handleContinue = () => {
    if (step === questions.length - 1) {
      const formattedData: OnboardingInput = {
        contentType: selections.contentType,
        audience: selections.audience,
        tone: selections.tone,
        platforms: selections.platforms,
        imageOption: selections.imageOption,
      };
      onComplete(formattedData);
    } else {
      setStep(step + 1);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center px-6 pb-8">
      {/* Progress indicator */}
      <div className="w-full max-w-md mt-4 mb-8">
        <div className="text-xs text-gray-500 mb-1">
          Step {step + 1} of {questions.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question cards */}
      <div className="w-full max-w-md">
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            isVisible={step === index}
            title={question.title}
            description={question.description}
            options={question.options}
            layout={question.layout}
            selectedValue={
              question.multiSelect 
                ? '' // For multi-select, we'll handle selection separately
                : selections[question.key] as string
            }
            multiSelect={question.multiSelect}
            selectedValues={question.multiSelect ? selections[question.key] as string[] : []}
            onSelect={question.multiSelect ? handleMultiSelection : handleSingleSelection}
          />
        ))}
      </div>
      
      {/* Continue button for multi-select questions */}
      {showContinueButton && (
        <div className="w-full max-w-md mt-8">
          <button
            className="w-full bg-primary text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={(selections[currentQuestion.key] as string[]).length === 0}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}