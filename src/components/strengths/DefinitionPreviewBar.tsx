import { useState, useEffect } from 'react';
import { useDefinition } from './DefinitionContext';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export default function DefinitionPreviewBar() {
  const { activeWord, activeDefinition } = useDefinition();
  const isMobile = useIsMobile();

  const idlePrompt = isMobile
    ? 'Tap and hold a word to see its definition'
    : 'Hover over a word to see its definition';

  const isActive = activeWord !== null && activeDefinition !== null;

  return (
    <div className="sw-definition-bar">
      <p
        className={`sw-definition-bar__content${isActive ? ' sw-definition-bar__content--active' : ' sw-definition-bar__content--idle'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {isActive ? (
          <>
            <span className="sw-definition-bar__word">{activeWord}</span>
            <span className="sw-definition-bar__sep"> — </span>
            <span className="sw-definition-bar__text">{activeDefinition}</span>
          </>
        ) : (
          <span className="sw-definition-bar__prompt">{idlePrompt}</span>
        )}
      </p>
    </div>
  );
}
