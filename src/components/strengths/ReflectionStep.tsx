// src/components/strengths/ReflectionStep.tsx
import { useState, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Reflection } from './StrengthsFlow';

interface Props {
  selectedWords: string[];
  onComplete: (reflections: Record<string, Reflection>) => void;
  onBack: () => void;
}

const MIN_CHARS = 50;

const PROMPTS: [keyof Reflection, string, string][] = [
  ['why', 'Why did you choose this word?', 'e.g. "I chose this because I naturally find myself doing it without being asked..."'],
  ['moment', 'What experience or moment brought this word to mind?', 'e.g. "I remember a time when our team was stuck and I..."'],
];

export default function ReflectionStep({ selectedWords, onComplete, onBack }: Props) {
  const [fields, setFields] = useState<Record<string, Reflection>>(
    () => Object.fromEntries(selectedWords.map(w => [w, { why: '', moment: '' }]))
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fieldTimers = useRef<Record<string, number>>({});
  const fieldStart = useRef<Record<string, number>>({});

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

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">REFLECT</span>
          <h1 className="sw-title">Reflect</h1>
          <p className="sw-desc">
            For each strength, answer the two prompts. Don&apos;t edit yourself — write what comes naturally.
          </p>
        </div>
      </div>

      <div className="sr-words">
        {selectedWords.map((word, wordIndex) => (
          <div key={word} className="sr-word-block">
            <h2 className="sr-word-header">
              <span className="sr-word-num">{wordIndex + 1}.</span> {word}
            </h2>

            {PROMPTS.map(([key, label, placeholder]) => {
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
                    placeholder={placeholder}
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
        ))}
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
