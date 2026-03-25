import { useState, useEffect, useRef, useCallback } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Word } from '../../data/wordlist';

export type { Word };

interface Props {
  words: Word[];
  initialSelected?: string[];
  onComplete: (selected: string[]) => void;
}

interface TooltipPos {
  top: number;
  left: number;
  above: boolean;
}

const TIMER_SECONDS = 5 * 60;
const WARN_SECONDS = 60;
const MAX_WORDS = 5;

type Phase = 'selecting' | 'timeout';

export default function WordSelectionStep({ words, initialSelected = [], onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>([...initialSelected]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState<Phase>('selecting');
  const [activeDefinition, setActiveDefinition] = useState<{ word: string; definition: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);

  const showDefinition = useCallback((target: HTMLElement, word: string, definition: string) => {
    setActiveDefinition({ word, definition });
    const rect = target.getBoundingClientRect();
    const above = rect.top > 80;
    setTooltipPos({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180),
      above,
    });
  }, []);

  const hideDefinition = useCallback(() => {
    setActiveDefinition(null);
    setTooltipPos(null);
  }, []);

  // Telemetry refs — always current, no stale closure issues
  const startedAt = useRef(Date.now());
  const firstSelectedAt = useRef<number | null>(null);
  const restarts = useRef(0);
  const selectedRef = useRef<string[]>([...initialSelected]);
  selectedRef.current = selected;

  // Sync with parent-driven resets (e.g., restart from StrengthsFlow)
  useEffect(() => {
    setSelected([...initialSelected]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelected.length]);

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
      if (isSelected) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setSelected(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
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

      {/* Selection island */}
      {(() => {
        const selectedWords = selected.map(w => {
          const match = words.find(entry => entry.word === w);
          return { word: w, definition: match?.definition ?? '' };
        });
        const count = selectedWords.length;
        const isFull = count >= MAX_WORDS;
        const progressPct = (count / MAX_WORDS) * 100;
        const progressText =
          count === 0
            ? `Select ${MAX_WORDS} words that resonate with you`
            : isFull
              ? `${count} of ${MAX_WORDS} selected \u2014 deselect one to choose another`
              : `${count} of ${MAX_WORDS} selected`;

        return (
          <div className="sw-island" aria-label="Selected words">
            <div className="sw-island__slots">
              {selectedWords.map(({ word }, index) => (
                <span key={word} className="sw-island__chip">
                  <button
                    className="sw-island__chip-move-up"
                    onClick={() => handleReorder(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${word} up`}
                    type="button"
                  >
                    {'\u25B2'}
                  </button>
                  <span className="sw-island__chip-label">{'\u2611'} {word}</span>
                  <button
                    className="sw-island__chip-move-down"
                    onClick={() => handleReorder(index, index + 1)}
                    disabled={index === selectedWords.length - 1}
                    aria-label={`Move ${word} down`}
                    type="button"
                  >
                    {'\u25BC'}
                  </button>
                  <button
                    className="sw-island__chip-close"
                    onClick={() => toggleWord(word)}
                    aria-label={`Deselect ${word}`}
                    type="button"
                  >
                    {'\u2715'}
                  </button>
                </span>
              ))}
              {Array.from({ length: MAX_WORDS - count }, (_, i) => (
                <span key={`empty-${i}`} className="sw-island__empty-slot" aria-hidden="true" />
              ))}
            </div>

            <div className="sw-island__progress">
              <div
                className="sw-island__progress-bar"
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={MAX_WORDS}
                style={{ '--island-progress': `${progressPct}%` } as React.CSSProperties}
              />
              <span className="sw-island__progress-text" aria-live="polite">{progressText}</span>
            </div>
          </div>
        );
      })()}

      {/* Definition preview bar (mobile/touch fallback) */}
      <div className="sw-definition-bar" aria-live="polite">
        {activeDefinition ? (
          <div className="sw-definition-bar__content sw-definition-bar__content--active">
            <span className="sw-definition-bar__word">{activeDefinition.word}</span>
            <span className="sw-definition-bar__sep"> — </span>
            <span className="sw-definition-bar__text">{activeDefinition.definition}</span>
          </div>
        ) : (
          <div className="sw-definition-bar__content sw-definition-bar__content--idle">
            <span className="sw-definition-bar__prompt">Tap a word to see its definition</span>
          </div>
        )}
      </div>

      {/* Floating tooltip (desktop hover/keyboard) */}
      {tooltipPos && activeDefinition && (
        <div
          className={`sw-tooltip${tooltipPos.above ? ' sw-tooltip--above' : ' sw-tooltip--below'}`}
          role="tooltip"
          id="sw-definition-tooltip"
          style={{
            top: tooltipPos.above ? undefined : `${tooltipPos.top}px`,
            bottom: tooltipPos.above ? `${window.innerHeight - tooltipPos.top}px` : undefined,
            left: `${tooltipPos.left}px`,
          }}
        >
          <span className="sw-tooltip__word">{activeDefinition.word}</span>
          <span className="sw-tooltip__sep"> — </span>
          <span className="sw-tooltip__text">{activeDefinition.definition}</span>
        </div>
      )}

      {/* Word grid */}
      <div className="sw-grid" role="group" aria-label="Strength words">
        {words.map(({ word, definition }) => {
          const isSelected = selected.includes(word);
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
              onMouseEnter={(e) => showDefinition(e.currentTarget, word, definition)}
              onMouseLeave={hideDefinition}
              onFocus={(e) => showDefinition(e.currentTarget, word, definition)}
              onBlur={hideDefinition}
              aria-describedby={activeDefinition?.word === word ? 'sw-definition-tooltip' : undefined}
            >
              {isSelected ? '☑' : '☐'} {word}
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
        >
          {selected.length === MAX_WORDS ? 'CONTINUE →' : `SELECT ${MAX_WORDS - selected.length} MORE`}
        </button>
      </div>
    </div>
  );
}
