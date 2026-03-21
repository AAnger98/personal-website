import { useState, useEffect, useRef, useCallback } from 'react';
import { logEvent } from '../../lib/telemetry';
import SelectionIsland from './SelectionIsland';
import DefinitionPreviewBar from './DefinitionPreviewBar';
import { useDefinition } from './DefinitionContext';

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
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState<Phase>('selecting');
  const { showDefinition, hideDefinition } = useDefinition();

  // Telemetry refs — always current, no stale closure issues
  const startedAt = useRef(Date.now());
  const firstSelectedAt = useRef<number | null>(null);
  const restarts = useRef(0);
  const selectedRef = useRef<Set<string>>(new Set(initialSelected));
  selectedRef.current = selected;

  // Button refs for travel animation
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Sync with parent-driven resets (e.g., restart from StrengthsFlow)
  useEffect(() => {
    setSelected(new Set(initialSelected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelected.length]);

  useEffect(() => {
    if (phase !== 'selecting') return;

    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          const count = selectedRef.current.size;
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
      const isSelected = prev.has(word);
      if (!isSelected && prev.size >= MAX_WORDS) return prev;
      if (!isSelected && firstSelectedAt.current === null) {
        firstSelectedAt.current = Date.now();
      }
      const next = new Set(prev);
      if (isSelected) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (selected.size !== MAX_WORDS) return;
    logEvent('strengths_selection_complete', {
      total_time_s: Math.round((Date.now() - startedAt.current) / 1000),
      time_to_first_s: firstSelectedAt.current
        ? Math.round((firstSelectedAt.current - startedAt.current) / 1000)
        : 0,
      timer_expired: timeLeft === 0,
      restart_count: restarts.current,
    });
    onComplete(Array.from(selected));
  };

  const handleRestart = () => {
    restarts.current += 1;
    logEvent('strengths_restart', { restart_count: restarts.current });
    setSelected(new Set());
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

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((word: string, definition: string) => {
    longPressTimer.current = setTimeout(() => {
      showDefinition(word, definition);
    }, 500);
  }, [showDefinition]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    hideDefinition();
  }, [hideDefinition]);

  const isWarning = timeLeft <= WARN_SECONDS && timeLeft > 0;
  const maxReached = selected.size >= MAX_WORDS;

  if (phase === 'timeout') {
    return (
      <div className="sw-timeout">
        <div className="sw-timeout__frame">
          <p className="sw-timeout__title">TIME EXPIRED</p>
          <p className="sw-timeout__message">
            {selected.size < MAX_WORDS
              ? `You selected ${selected.size} of ${MAX_WORDS} required strengths.`
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

      {/* Selection island */}
      <SelectionIsland
        selectedWords={Array.from(selected)}
        maxWords={MAX_WORDS}
        onDeselect={toggleWord}
      />

      {/* Definition preview bar */}
      <DefinitionPreviewBar />

      {/* Word grid */}
      <div className="sw-grid" role="group" aria-label="Strength words">
        {words.map(({ word, definition }) => {
          const isSelected = selected.has(word);
          const isMaxed = !isSelected && maxReached;
          return (
            <button
              key={word}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isMaxed || undefined}
              className={`sw-chip${isSelected ? ' sw-chip--selected' : ''}${isMaxed ? ' sw-chip--maxed' : ''}`}
              onClick={() => {
                if (isMaxed) return;
                toggleWord(word);
              }}
              onMouseEnter={() => showDefinition(word, definition)}
              onMouseLeave={() => hideDefinition()}
              onFocus={() => showDefinition(word, definition)}
              onBlur={() => hideDefinition()}
              onTouchStart={() => handleTouchStart(word, definition)}
              onTouchEnd={handleTouchEnd}
            >
              {isSelected ? '☑' : '☐'} {word}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sw-footer">
        <button
          className={`sw-btn sw-btn--primary${selected.size === MAX_WORDS ? '' : ' sw-btn--inactive'}`}
          onClick={handleContinue}
          disabled={selected.size !== MAX_WORDS}
        >
          {selected.size === MAX_WORDS ? 'CONTINUE →' : `SELECT ${MAX_WORDS - selected.size} MORE`}
        </button>
      </div>
    </div>
  );
}
