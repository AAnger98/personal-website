import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface DefinitionContextValue {
  activeWord: string | null;
  activeDefinition: string | null;
  showDefinition: (word: string, definition: string) => void;
  hideDefinition: () => void;
}

const DefinitionContext = createContext<DefinitionContextValue | null>(null);

interface DefinitionProviderProps {
  children: ReactNode;
}

export function DefinitionProvider({ children }: DefinitionProviderProps) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [activeDefinition, setActiveDefinition] = useState<string | null>(null);

  const showDefinition = useCallback((word: string, definition: string) => {
    setActiveWord(word);
    setActiveDefinition(definition);
  }, []);

  const hideDefinition = useCallback(() => {
    setActiveWord(null);
    setActiveDefinition(null);
  }, []);

  return (
    <DefinitionContext.Provider value={{ activeWord, activeDefinition, showDefinition, hideDefinition }}>
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
