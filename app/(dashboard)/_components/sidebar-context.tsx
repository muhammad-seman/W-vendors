'use client';

import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  open: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
