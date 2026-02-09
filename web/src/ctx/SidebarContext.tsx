import { createContext, ReactNode, useContext } from "react";
import { useBreakpointValue, useDisclosure } from "@chakra-ui/react/hooks";

interface SidebarContextProps {
  condensed: boolean;
  forceCondensed: boolean;
  condenseUi: boolean;
  toggleCondensed: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  condensed: false,
  forceCondensed: false,
  condenseUi: false,
  toggleCondensed: () => void 0,
});

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const forceCondensed = useBreakpointValue({ base: true, sm: true, md: false }, { fallback: "base" }) ?? false;
  const { open: condensed, onToggle: toggleCondensed } = useDisclosure();
  const condenseUi = condensed || forceCondensed;
  const ctxValue = {
    condensed,
    forceCondensed,
    condenseUi,
    toggleCondensed,
  };
  return <SidebarContext.Provider value={ctxValue}>{children}</SidebarContext.Provider>;
};

export const useSidebarContext = () => useContext(SidebarContext);
