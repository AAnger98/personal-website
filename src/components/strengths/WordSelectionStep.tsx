import { useState, useEffect, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';

export interface Word {
  word: string;
  definition: string;
}

interface Props {
  words: Word[];
  initialSelected?: string[];
  onComplete: (selected: string[]) => void;
}

const TIMER_SECONDS = 5 * 60;
const WARN_SECONDS = 60;
const MAX_WORDS = 5;

type Phase = 'selecting' | 'timeout';

export default function WordSelectionStep({ words, initialSelected = [], onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState<Phase>('selecting');

  // Telemetry refs — always current, no stale closure issues
  const startedAt = useRef(Date.now());
  const firstSelectedAt = useRef<number | null>(null);
  const restarts = useRef(0);
  const selectedRef = useRef<string[]>([]);
  selectedRef.current = selected;

  useEffect(() => {
    if (phase !== 'selecting') return;

    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          const count = selectedRef.current.length;
          if (count < MAX_WORDS) {
            setPhase('timeout');
            logEvent('strengths_timer_expired', { selection_count: count });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [phase]);

  const toggleWord = (word: string) => {
    setSelected(prev => {
      const isSelected = prev.includes(word);
      if (!isSelected && prev.length >= MAX_WORDS) return prev;
      if (!isSelected && firstSelectedAt.current === null) {
        firstSelectedAt.current = Date.now();
      }
      return isSelected ? prev.filter(w => w !== word) : [...prev, word];
    });
  };

  const handleContinue = () => {
    if (selected.length !== MAX_WORDS) return;
    logEvent('strengths_selection_complete', {
      total_time_s: Math.round((Date.now() - startedAt.current) / 1000),
      time_to_first_s: firstSelectedAt.current
        ? Math.round((firstSelectedAt.current - startedAt.current) / 1000)
        : 0,
      timer_expired: timeLeft === 0,
      restart_count: restarts.current,
    });
    onComplete(selected);
  };

  const handleRestart = () => {
    restarts.current += 1;
    logEvent('strengths_restart', { restart_count: restarts.current });
    setSelected([]);
    setTimeLeft(TIMER_SECONDS);
    startedAt.current = Date.now();
    firstSelectedAt.current = null;
    setPhase('selecting');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= WARN_SECONDS && timeLeft > 0;
  const maxReached = selected.length >= MAX_WORDS;

  if (phase === 'timeout') {
    return (
      <div className="sw-timeout">
        <div className="sw-timeout__frame">
          <p className="sw-timeout__title">TIME EXPIRED</p>
          <p className="sw-timeout__message">
            {selected.length < MAX_WORDS
              ? `You selected ${selected.length} of ${MAX_WORDS} required strengths.`
              : 'Select 5 strengths to continue.'}
          </p>
          <p className="sw-timeout__sub">
            Trust your instincts — the words that came to mind first are data.
          </p>
          <button className="sw-btn" onClick={handleRestart}>
            ▶ TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-root">
      {/* Header */}
      <div className="sw-header">
        <div className="sw-header__left">
          <h1 className="sw-title">Select Your Strengths</h1>
          <p className="sw-desc">
            Choose exactly 5 words that resonate. Don&apos;t overthink it — go with instinct.
          </p>
        </div>
        <div className={`sw-timer${isWarning ? ' sw-timer--warn' : ''}`}>
          <span className="sw-timer__label">TIME REMAINING</span>
          <span className="sw-timer__display">{formatTime(timeLeft)}</span>
          {isWarning && <span className="sw-timer__warning">less than 1 minute</span>}
        </div>
      </div>

      {/* Selection counter */}
      <div className="sw-counter">
        <span className={maxReached ? 'sw-counter__num sw-counter__num--full' : 'sw-counter__num'}>
          {selected.length}
        </span>
        <span className="sw-counter__sep"> / </span>
        <span className="sw-counter__total">{MAX_WORDS} selected</span>
      </div>

      {/* Word grid */}
      <div className="sw-grid" role="group" aria-label="Strength words">
        {words.map(({ word }) => {
          const isSelected = selected.includes(word);
          const isDisabled = !isSelected && maxReached;
          return (
            <button
              key={word}
              className={`sw-chip${isSelected ? ' sw-chip--selected' : ''}${isDisabled ? ' sw-chip--disabled' : ''}`}
              onClick={() => toggleWord(word)}
              aria-pressed={isSelected}
              disabled={isDisabled}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sw-footer">
        <button
          className={`sw-btn sw-btn--primary${selected.length === MAX_WORDS ? '' : ' sw-btn--inactive'}`}
          onClick={handleContinue}
          disabled={selected.length !== MAX_WORDS}
          aria-disabled={selected.length !== MAX_WORDS}
        >
          {selected.length === MAX_WORDS ? 'CONTINUE →' : `SELECT ${MAX_WORDS - selected.length} MORE`}
        </button>
      </div>
    </div>
  );
}
