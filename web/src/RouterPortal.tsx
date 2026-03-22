import { ReactNode, Fragment as ReactFragment, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import NotFoundView from "./views/NotFoundView";
import ObjectEditor from "./views/editor/objects/ObjectEditor";
import LanguageEditor from "./views/editor/languages/LanguageEditor";
import EnumEditor from "./views/editor/enums/EnumEditor";
import ErrorEditor from "./views/editor/errors/ErrorEditor";
import VersionEditor from "./views/editor/versions/VersionEditor";
import { SidebarLayout } from "./components/Sidebar";
import { SidebarProvider } from "./ctx/SidebarContext";
import Home from "./views/Home";
import About from "./views/About";

declare type Portal = { path: string; component: ReactNode };

const authenticatedPortals: Portal[] = [];

// Raw Routes
const rawPortals: Portal[] = [
  { path: "/home", component: <Home /> },
  { path: "/about", component: <About /> },
];

const sidebarPortals: Portal[] = [
  // { path: "/editor/objects", component: <ObjectEditor /> },
  { path: "/editor/enums", component: <EnumEditor /> },
  // { path: "/editor/localization", component: <LanguageEditor /> },
  // { path: "/editor/errors", component: <ErrorEditor /> },
  { path: "/editor/versions", component: <VersionEditor /> },
  { path: "/editor/*", component: <Navigate to="/editor/enums" /> },
];

export default function Portal() {
  return (
    <Box
      zIndex={1}
      pos="fixed"
      inset={0}
      w="100dvw"
      h="100dvh"
      overflowY="auto"
      backgroundColor="brand.bg"
      color="brand.color"
    >
      <SidebarProvider>
        <Routes>
          {rawPortals.map((p: Portal, i) => (
            <Route key={i} path={p.path} element={p.component} />
          ))}

          {sidebarPortals.map((p: Portal, i) => (
            <Route key={i} path={p.path} element={<SidebarLayout key={`sl-${i}`}>{p.component}</SidebarLayout>} />
          ))}
          <Route path={"/"} element={<Navigate to="/home" />} />
          {/* <Route path={"/"} element={<Navigate to="/editor/objects" />} /> */}
          <Route path={"*"} element={<NotFoundView />} />
        </Routes>
      </SidebarProvider>
    </Box>
  );
}
