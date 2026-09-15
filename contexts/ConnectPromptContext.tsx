"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ConnectPromptContextValue {
  isShaking: boolean;
  promptConnect: () => void;
  clearShake: () => void;
}

// Consumers outside a <ConnectPromptProvider> (e.g. ConnectBtn rendered in the
// dashboard shell) get inert no-ops instead of a thrown error, since the
// shake prompt only makes sense where a provider wraps a CTA + ConnectBtn pair.
const noop = () => {};
const defaultValue: ConnectPromptContextValue = {
  isShaking: false,
  promptConnect: noop,
  clearShake: noop,
};

const ConnectPromptContext =
  createContext<ConnectPromptContextValue>(defaultValue);

export function ConnectPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isShaking, setIsShaking] = useState(false);

  const promptConnect = useCallback(() => setIsShaking(true), []);
  const clearShake = useCallback(() => setIsShaking(false), []);

  const value = useMemo(
    () => ({ isShaking, promptConnect, clearShake }),
    [isShaking, promptConnect, clearShake]
  );

  return (
    <ConnectPromptContext.Provider value={value}>
      {children}
    </ConnectPromptContext.Provider>
  );
}

export function useConnectPrompt() {
  return useContext(ConnectPromptContext);
}
