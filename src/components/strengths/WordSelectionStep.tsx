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
  const [wordOrder, setWordOrder] = useState<string[]>(initialSelected);
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
    setWordOrder(initialSelected);
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

  const triggerTravelAnimation = (word: string) => {
    const btn = buttonRefs.current.get(word);
    if (!btn) return;

    const srcRect = btn.getBoundingClientRect();
    // Skip animation if element is not visible/rendered
    if (srcRect.width === 0 && srcRect.height === 0) return;

    const targetSlot = document.querySelector<HTMLElement>('.sw-island__slot--empty');
    if (!targetSlot) return;

    const tgtRect = targetSlot.getBoundingClientRect();
    if (tgtRect.width === 0 && tgtRect.height === 0) return;

    // Create ghost chip at source position
    const ghost = document.createElement('span');
    ghost.className = 'sw-ghost-chip';
    ghost.textContent = `\u2611 ${word}`;
    ghost.style.left = `${srcRect.left}px`;
    ghost.style.top = `${srcRect.top}px`;
    ghost.style.width = `${srcRect.width}px`;
    ghost.style.height = `${srcRect.height}px`;

    document.body.appendChild(ghost);

    // Calculate delta to target slot
    const dx = tgtRect.left - srcRect.left;
    const dy = tgtRect.top - srcRect.top;

    // Force a reflow so initial state is painted before transition starts
    void ghost.offsetWidth;

    // Apply flying class and inline transform to trigger CSS transition
    ghost.classList.add('sw-ghost-chip--flying');
    ghost.style.transform = `translate(${dx}px, ${dy}px)`;

    // Remove ghost after animation completes
    const onEnd = () => {
      ghost.removeEventListener('transitionend', onEnd);
      if (ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    };
    ghost.addEventListener('transitionend', onEnd);
    // Fallback removal in case transitionend doesn't fire
    setTimeout(() => {
      if (ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    }, 400);
  };

  const toggleWord = (word: string) => {
    const isCurrentlySelected = selectedRef.current.has(word);

    if (!isCurrentlySelected) {
      // Word is being ADDED — trigger travel animation before state update
      triggerTravelAnimation(word);
    } else {
      // Word is being REMOVED — apply removing class to island chip
      const islandChips = document.querySelectorAll<HTMLElement>('.sw-island__slot--filled');
      islandChips.forEach(chip => {
        const label = chip.querySelector('.sw-island__chip-label');
        if (label && label.textContent?.includes(word)) {
          chip.classList.add('sw-island__chip--removing');
        }
      });
    }

    if (!isCurrentlySelected) {
      // Adding
      setSelected(prev => {
        if (prev.size >= MAX_WORDS) return prev;
        if (firstSelectedAt.current === null) {
          firstSelectedAt.current = Date.now();
        }
        const next = new Set(prev);
        next.add(word);
        return next;
      });
      setWordOrder(prev => {
        if (prev.length >= MAX_WORDS) return prev;
        return [...prev, word];
      });
    } else {
      // Removing — delay state update to allow fade-out animation (200ms)
      setTimeout(() => {
        setSelected(prev => {
          const next = new Set(prev);
          next.delete(word);
          return next;
        });
        setWordOrder(prev => prev.filter(w => w !== word));
      }, 200);
    }
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
    onComplete(wordOrder);
  };

  const handleRestart = () => {
    restarts.current += 1;
    logEvent('strengths_restart', { restart_count: restarts.current });
    setSelected(new Set());
    setWordOrder([]);
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
        <div className={`sw-timer${isWarning ? ' sw-timer--warn' : ''}`} aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
          <span className="sw-timer__label" aria-hidden="true">TIME REMAINING</span>
          <span className="sw-timer__display" aria-hidden="true">{formatTime(timeLeft)}</span>
          {isWarning && <span className="sw-timer__warning" aria-live="polite" role="status">Less than 1 minute remaining</span>}
        </div>
      </div>

      {/* Selection island */}
      <SelectionIsland
        selectedWords={wordOrder}
        maxWords={MAX_WORDS}
        onDeselect={toggleWord}
        onReorder={setWordOrder}
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
              ref={el => {
                if (el) {
                  buttonRefs.current.set(word, el);
                } else {
                  buttonRefs.current.delete(word);
                }
              }}
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
