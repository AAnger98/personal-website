// src/components/strengths/ReflectionStep.tsx
import { useState, useRef, useCallback } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Reflection } from './StrengthsFlow';

interface Props {
  selectedWords: string[];
  onComplete: (reflections: Record<string, Reflection>) => void;
  onBack: () => void;
  onReorder: (newOrder: string[]) => void;
}

const MIN_CHARS = 50;

const PROMPTS: [keyof Reflection, string][] = [
  ['why', 'Why did you choose this word?'],
  ['moment', 'What experience or moment brought this word to mind?'],
];

function getPlaceholder(key: keyof Reflection, word: string): string {
  const lc = word.toLowerCase();
  if (key === 'why') {
    return `I am at my best when I'm ${lc}...`;
  }
  return `A time my ${lc} made a difference was...`;
}

export default function ReflectionStep({ selectedWords, onComplete, onBack, onReorder }: Props) {
  const [fields, setFields] = useState<Record<string, Reflection>>(
    () => Object.fromEntries(selectedWords.map(w => [w, { why: '', moment: '' }]))
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fieldTimers = useRef<Record<string, number>>({});
  const fieldStart = useRef<Record<string, number>>({});

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

  // Touch drag state
  const touchState = useRef<{
    active: boolean;
    startIndex: number;
    startY: number;
    currentY: number;
    cardHeight: number;
  } | null>(null);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchOffsetY, setTouchOffsetY] = useState(0);
  const [touchDropTarget, setTouchDropTarget] = useState<number | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const handleChange = (word: string, key: keyof Reflection, value: string) => {
    setFields(prev => ({
      ...prev,
      [word]: { ...prev[word], [key]: value },
    }));
  };

  const handleFocus = (fieldId: string) => {
    fieldStart.current[fieldId] = Date.now();
  };

  const handleBlur = (fieldId: string, value: string) => {
    const start = fieldStart.current[fieldId];
    if (start) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      fieldTimers.current[fieldId] = (fieldTimers.current[fieldId] ?? 0) + elapsed;
    }
    setTouched(prev => new Set(prev).add(fieldId));
    logEvent('strengths_reflection_field_blur', {
      field_id: fieldId,
      char_count: value.length,
      is_blank: value.trim().length === 0,
    });
  };

  const handleContinue = () => {
    selectedWords.forEach(word => {
      PROMPTS.forEach(([key]) => {
        const val = fields[word][key];
        if (val.trim().length === 0) {
          logEvent('strengths_reflection_skipped', { field_id: `${word}__${key}` });
        }
      });
    });

    logEvent('strengths_reflection_complete', {
      total_time_s: Object.values(fieldTimers.current).reduce((a, b) => a + b, 0),
    });

    onComplete(fields);
  };

  // Keyboard reorder
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    const newOrder = [...selectedWords];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index]!, newOrder[index - 1]!];
    onReorder(newOrder);
    setLiveMessage(`${selectedWords[index]} moved to position ${index} of ${selectedWords.length}`);
  }, [selectedWords, onReorder]);

  const handleMoveDown = useCallback((index: number) => {
    if (index >= selectedWords.length - 1) return;
    const newOrder = [...selectedWords];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1]!, newOrder[index]!];
    onReorder(newOrder);
    setLiveMessage(`${selectedWords[index]} moved to position ${index + 2} of ${selectedWords.length}`);
  }, [selectedWords, onReorder]);

  // Track whether drag was initiated from the handle
  const dragFromHandle = useRef(false);

  // HTML5 Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!dragFromHandle.current) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    // Apply lifted visual after a tick so the drag image captures the original
    requestAnimationFrame(() => {
      setDragIndex(index);
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex === null) return;
    setDropTarget(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      cleanupDrag();
      return;
    }
    const newOrder = [...selectedWords];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, moved!);
    onReorder(newOrder);
    setLiveMessage(`${moved} moved to position ${targetIndex + 1} of ${selectedWords.length}`);
    cleanupDrag();
  };

  const handleDragEnd = () => {
    dragFromHandle.current = false;
    cleanupDrag();
  };

  const cleanupDrag = () => {
    setDragIndex(null);
    setDropTarget(null);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    if (!touch) return;
    const card = (e.currentTarget as HTMLElement).closest('.sr-word-block') as HTMLElement | null;
    const cardHeight = card?.offsetHeight ?? 100;
    touchState.current = {
      active: true,
      startIndex: index,
      startY: touch.clientY,
      currentY: touch.clientY,
      cardHeight,
    };
    setTouchDragIndex(index);
    setTouchOffsetY(0);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    if (!ts?.active) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    ts.currentY = touch.clientY;
    const offset = ts.currentY - ts.startY;
    setTouchOffsetY(offset);

    // Calculate drop target based on offset
    const moveSteps = Math.round(offset / ts.cardHeight);
    const newTarget = Math.max(0, Math.min(selectedWords.length - 1, ts.startIndex + moveSteps));
    setTouchDropTarget(newTarget !== ts.startIndex ? newTarget : null);
  }, [selectedWords.length]);

  const handleTouchEnd = useCallback(() => {
    const ts = touchState.current;
    if (!ts?.active) {
      setTouchDragIndex(null);
      setTouchOffsetY(0);
      setTouchDropTarget(null);
      return;
    }

    const offset = ts.currentY - ts.startY;
    const moveSteps = Math.round(offset / ts.cardHeight);
    const targetIndex = Math.max(0, Math.min(selectedWords.length - 1, ts.startIndex + moveSteps));

    if (targetIndex !== ts.startIndex) {
      const newOrder = [...selectedWords];
      const [moved] = newOrder.splice(ts.startIndex, 1);
      newOrder.splice(targetIndex, 0, moved!);
      onReorder(newOrder);
      setLiveMessage(`${moved} moved to position ${targetIndex + 1} of ${selectedWords.length}`);
    }

    touchState.current = null;
    setTouchDragIndex(null);
    setTouchOffsetY(0);
    setTouchDropTarget(null);
  }, [selectedWords, onReorder]);

  // Escape to cancel drag
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanupDrag();
      touchState.current = null;
      setTouchDragIndex(null);
      setTouchOffsetY(0);
      setTouchDropTarget(null);
    }
  }, []);

  return (
    <div className="sw-root" onKeyDown={handleKeyDown}>
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">REFLECT</span>
          <h1 className="sw-title">Reflect</h1>
          <p className="sw-desc">
            For each strength, answer the two prompts. Don&apos;t edit yourself — write what comes naturally.
            <br />
            <span className="sr-reorder-hint">Drag cards or use ▲▼ buttons to reorder your strengths by priority.</span>
          </p>
        </div>
      </div>

      {/* ARIA live region for reorder announcements */}
      <div aria-live="assertive" className="sr-visually-hidden" role="status">
        {liveMessage}
      </div>

      <div className="sr-words" ref={cardsContainerRef}>
        {selectedWords.map((word, wordIndex) => {
          const isDragging = dragIndex === wordIndex;
          const isTouchDragging = touchDragIndex === wordIndex;
          const isDropTarget = dropTarget === wordIndex && dragIndex !== null && dragIndex !== wordIndex;
          const isTouchDropTarget = touchDropTarget === wordIndex && touchDragIndex !== null && touchDragIndex !== wordIndex;

          return (
            <div
              key={word}
              className={
                'sr-word-block' +
                (isDragging ? ' sr-word-block--dragging' : '') +
                (isTouchDragging ? ' sr-word-block--touch-dragging' : '') +
                (isDropTarget || isTouchDropTarget ? ' sr-word-block--drop-target' : '')
              }
              draggable
              onDragStart={e => handleDragStart(e, wordIndex)}
              onDragOver={e => handleDragOver(e, wordIndex)}
              onDrop={e => handleDrop(e, wordIndex)}
              onDragEnd={handleDragEnd}
              aria-roledescription="reorderable item"
              style={
                isTouchDragging
                  ? { transform: `translateY(${touchOffsetY}px)`, zIndex: 10, position: 'relative' as const }
                  : undefined
              }
            >
              <div className="sr-word-toolbar">
                <span
                  className="sr-drag-handle"
                  aria-hidden="true"
                  onMouseDown={() => { dragFromHandle.current = true; }}
                  onMouseUp={() => { dragFromHandle.current = false; }}
                  onTouchStart={e => handleTouchStart(e, wordIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  ⠿
                </span>
                <div className="sr-reorder-buttons">
                  <button
                    className="sr-reorder-btn"
                    type="button"
                    disabled={wordIndex === 0}
                    onClick={() => handleMoveUp(wordIndex)}
                    aria-label={`Move ${word} up`}
                  >
                    ▲
                  </button>
                  <button
                    className="sr-reorder-btn"
                    type="button"
                    disabled={wordIndex === selectedWords.length - 1}
                    onClick={() => handleMoveDown(wordIndex)}
                    aria-label={`Move ${word} down`}
                  >
                    ▼
                  </button>
                </div>
              </div>

              <h2 className="sr-word-header">
                <span className="sr-word-num">{wordIndex + 1}.</span> {word}
              </h2>

              {PROMPTS.map(([key, label]) => {
                const fieldId = `${word}__${key}`;
                const value = fields[word][key];
                const isTouched = touched.has(fieldId);
                const showNudge = isTouched && value.trim().length > 0 && value.trim().length < MIN_CHARS;

                return (
                  <div key={key} className="sr-field">
                    <label className="sr-label" htmlFor={fieldId}>{label}</label>
                    <textarea
                      id={fieldId}
                      className="sr-textarea"
                      value={value}
                      placeholder={getPlaceholder(key, word)}
                      rows={3}
                      onChange={e => handleChange(word, key, e.target.value)}
                      onFocus={() => handleFocus(fieldId)}
                      onBlur={e => handleBlur(fieldId, e.target.value)}
                    />
                    <div aria-live="polite">
                      {showNudge && (
                        <p className="sr-nudge">
                          Try to add a bit more detail — {MIN_CHARS - value.trim().length} more characters recommended.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={handleContinue} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
