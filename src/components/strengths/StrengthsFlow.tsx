// src/components/strengths/StrengthsFlow.tsx
import { useState, useEffect } from 'react';
import { logEvent } from '../../lib/telemetry';
import WordSelectionStep, { type Word } from './WordSelectionStep';
import { DefinitionProvider } from './DefinitionContext';
import StepProgress from './StepProgress';
import ReflectionStep from './ReflectionStep';
import PitchStep from './PitchStep';
import PdfDownloadStep from './PdfDownloadStep';
import FeedbackStep from './FeedbackStep';

interface Props {
  words: Word[];
}

export interface Reflection {
  why: string;
  moment: string;
}

export type Step = 'word-selection' | 'reflection' | 'pitch' | 'pdf' | 'feedback';

const STEP_NUMBER: Record<Step, number> = {
  'word-selection': 1,
  'reflection': 2,
  'pitch': 3,
  'pdf': 4,
  'feedback': 5,
};

export default function StrengthsFlow({ words }: Props) {
  const [step, setStep] = useState<Step>('word-selection');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [reflections, setReflections] = useState<Record<string, Reflection>>({});
  const [pitch, setPitch] = useState('');

  // Fire flow-started telemetry once on mount — enables abandonment-rate-by-step calculation
  useEffect(() => {
    logEvent('strengths_flow_started');
  }, []);

  const handleRestart = () => {
    logEvent('strengths_flow_started'); // re-fires on each restart session
    setStep('word-selection');
    setSelectedWords([]);
    setReflections({});
    setPitch('');
  };

  return (
    <div>
      <StepProgress
        current={STEP_NUMBER[step]}
        total={5}
        onRestart={handleRestart}
      />

      {step === 'word-selection' && (
        <DefinitionProvider>
          <WordSelectionStep
            words={words}
            initialSelected={selectedWords}
            onComplete={selected => {
              setSelectedWords(selected);
              setStep('reflection');
            }}
          />
        </DefinitionProvider>
      )}

      {step === 'reflection' && (
        <ReflectionStep
          selectedWords={selectedWords}
          onComplete={data => {
            setReflections(data);
            setStep('pitch');
          }}
          onBack={() => setStep('word-selection')}
        />
      )}

      {step === 'pitch' && selectedWords.length > 0 && (
        <PitchStep
          topWord={selectedWords[0]!}
          onComplete={text => {
            setPitch(text);
            setStep('pdf');
          }}
          onBack={() => setStep('reflection')}
        />
      )}

      {step === 'pdf' && (
        <PdfDownloadStep
          selectedWords={selectedWords}
          reflections={reflections}
          pitch={pitch}
          onComplete={() => setStep('feedback')}
          onBack={() => setStep('pitch')}
        />
      )}

      {step === 'feedback' && (
        <FeedbackStep onComplete={handleRestart} />
      )}
    </div>
  );
}
