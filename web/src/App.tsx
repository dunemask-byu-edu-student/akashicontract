import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import RouterPortal from "./RouterPortal";
import { Toaster } from "@akc/ui/components/commons/Toaster";
import CONFIG from "./config";
import { ChakraProvider } from "@chakra-ui/react/styled-system";
import { CHAKRA_SYSTEM } from "./utils/chakra-system";
import { DraftProvider } from "./ctx/DraftContext";
import { CollectionProvider } from "./ctx/CollectionContext";

export default function App() {
  return (
    <ChakraProvider value={CHAKRA_SYSTEM}>
      <Toaster />
      <BrowserRouter basename={CONFIG.ENV.BASE_URL}>
        <DraftProvider>
          <CollectionProvider>
            <InitProvider>
              <RouterPortal />
            </InitProvider>
          </CollectionProvider>
        </DraftProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

function InitProvider(props: { children: ReactNode }) {
  // useInitHooks();
  return props.children;
}
