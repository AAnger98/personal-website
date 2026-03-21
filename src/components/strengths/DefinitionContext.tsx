import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface WordDefinition {
  word: string;
  definition: string;
}

export interface DefinitionContextValue {
  activeDefinition: WordDefinition | null;
  showDefinition: (word: string, definition: string) => void;
  hideDefinition: () => void;
}

const DefinitionContext = createContext<DefinitionContextValue | null>(null);

interface DefinitionProviderProps {
  children: ReactNode;
}

export function DefinitionProvider({ children }: DefinitionProviderProps) {
  const [activeDefinition, setActiveDefinition] = useState<WordDefinition | null>(null);

  const showDefinition = useCallback((word: string, definition: string) => {
    setActiveDefinition({ word, definition });
  }, []);

  const hideDefinition = useCallback(() => {
    setActiveDefinition(null);
  }, []);

  return (
    <DefinitionContext.Provider value={{ activeDefinition, showDefinition, hideDefinition }}>
      {children}
    </DefinitionContext.Provider>
  );
}

export function useDefinition(): DefinitionContextValue {
  const ctx = useContext(DefinitionContext);
  if (!ctx) {
    throw new Error('useDefinition must be used within a DefinitionProvider');
  }
  return ctx;
}
