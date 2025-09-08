import React, { useState } from 'react';
import { OnboardingInput } from '@shared/schema';
import { CONTENT_TYPES, AUDIENCES, TONES, PLATFORMS, IMAGE_OPTIONS } from '@/constants';
import { Button } from '@/components/ui/button';

const questions = [
  { id: 1, question: "What do you want to share today?", options: CONTENT_TYPES.map(option => option.value) },
  { id: 2, question: "Who are you speaking to?", options: AUDIENCES.map(option => option.value) },
  { id: 3, question: "What's your tone?", options: TONES.map(option => option.value) },
  { id: 4, question: "What platform(s) do you want to post on?", options: PLATFORMS.map(option => option.value), multiple: true },
  { id: 5, question: "Would you like to generate an image or upload your own?", options: IMAGE_OPTIONS.map(option => option.value) },
];

interface OnboardingScreenProps {
  onComplete: (data: OnboardingInput) => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    // For non-multiple choice questions
    if (!questions[step].multiple) {
      const newAnswers = { ...answers, [questions[step].id]: answer };
      setAnswers(newAnswers);
      
      if (step < questions.length - 1) {
        setStep(step + 1);
        setSelectedOptions([]); // Clear selected options for the next question
      } else {
        // Convert answers to OnboardingInput format
        const formattedData: OnboardingInput = {
          contentType: newAnswers[1] as string,
          audience: newAnswers[2] as string,
          tone: newAnswers[3] as string,
          platforms: newAnswers[4] as string[] || [],
          imageOption: newAnswers[5] as string
        };
        onComplete(formattedData);
      }
    }
  };

  const handleMultipleChoice = (option: string) => {
    // For multiple choice questions (platforms)
    const updatedSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(selected => selected !== option)
      : [...selectedOptions, option];
    
    setSelectedOptions(updatedSelection);
  };

  const handleMultipleSubmit = () => {
    if (selectedOptions.length > 0) {
      const newAnswers = { ...answers, [questions[step].id]: selectedOptions };
      setAnswers(newAnswers);
      
      if (step < questions.length - 1) {
        setStep(step + 1);
        setSelectedOptions([]);
      } else {
        // Convert answers to OnboardingInput format
        const formattedData: OnboardingInput = {
          contentType: newAnswers[1] as string,
          audience: newAnswers[2] as string,
          tone: newAnswers[3] as string,
          platforms: newAnswers[4] as string[] || [],
          imageOption: newAnswers[5] as string
        };
        onComplete(formattedData);
      }
    }
  };

  // Get the appropriate option list for styling
  const getCurrentOptions = () => {
    const questionId = questions[step].id;
    if (questionId === 1) return CONTENT_TYPES;
    if (questionId === 2) return AUDIENCES;
    if (questionId === 3) return TONES;
    if (questionId === 4) return PLATFORMS;
    if (questionId === 5) return IMAGE_OPTIONS;
    return [];
  };

  // Get detailed option information
  const getOptionDetails = (optionValue: string) => {
    const options = getCurrentOptions();
    return options.find(option => option.value === optionValue);
  };

  const currentQuestion = questions[step];
  const isMultipleChoice = !!currentQuestion.multiple;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
          <span className="text-sm text-gray-500">Step {step + 1} of {questions.length}</span>
        </div>
        
        <div className="space-y-3">
          {isMultipleChoice ? (
            <>
              {currentQuestion.options.map((opt, idx) => {
                const optionDetails = getOptionDetails(opt);
                const isSelected = selectedOptions.includes(opt);
                
                return (
                  <button
                    key={idx}
                    className={`w-full flex items-center p-3 rounded-lg border-2 transition
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => handleMultipleChoice(opt)}
                  >
                    <div className="mr-3 flex-shrink-0">
                      <div className={`w-5 h-5 rounded ${isSelected ? 'bg-blue-500' : 'bg-gray-200'} flex items-center justify-center`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
              
              <Button 
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                onClick={handleMultipleSubmit}
                disabled={selectedOptions.length === 0}
              >
                Continue
              </Button>
            </>
          ) : (
            currentQuestion.options.map((opt, idx) => {
              const optionDetails = getOptionDetails(opt);
              
              return (
                <button
                  key={idx}
                  className="w-full flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition"
                  onClick={() => handleAnswer(opt)}
                >
                  <span>{opt}</span>
                </button>
              );
            })
          )}
        </div>
        
        {step > 0 && (
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}