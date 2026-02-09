import { ReactNode } from "react";
import { FileText, Hash, Languages, Download, ChevronRight, ChevronLeft, MessageSquareWarning } from "lucide-react";
import Conditional from "./commons/Conditional";
import { Link, useLocation } from "react-router-dom";
import { Flex } from "@chakra-ui/react/flex";
import { Badge } from "@chakra-ui/react/badge";
import { Text } from "@chakra-ui/react/text";
import { Box } from "@chakra-ui/react/box";
import { Button, IconButton } from "@chakra-ui/react/button";
import { useDraftContext } from "@akc/ui/ctx/DraftContext";
import { useSidebarContext } from "@akc/ui/ctx/SidebarContext";

const enlargedWidth = "16rem";
const condensedWidth = "5rem";
const editorLinks = {
  // "/editor/objects": { title: "Objects", icon: <FileText /> },
  "/editor/enums": { title: "Enums", icon: <Hash /> },
  // "/editor/localization": { title: "Localization", icon: <Languages /> },
  // "/editor/errors": { title: "Errors", icon: <MessageSquareWarning /> },
  "/editor/versions": { title: "Versions", icon: <Download /> },
};

export default function Sidebar() {
  const { drafting } = useDraftContext();
  const loc = useLocation();
  const { condensed, condenseUi, toggleCondensed, forceCondensed } = useSidebarContext();

  return (
    <Flex
      w={condenseUi ? condensedWidth : enlargedWidth}
      h="100dvh"
      borderRight="white .5px solid"
      borderColor="brand.bgLighter"
      bg="brand.surface"
      flexShrink="0"
      flexDir="column"
    >
      <Flex borderBottom="white .5px solid" borderColor="brand.bgLighter" minH="5rem" p="1rem" wrap="wrap">
        <Conditional if={!condenseUi}>
          <Text fontSize="lg" fontWeight="bold" w="100%">
            Akashic Records
          </Text>
          <Flex w="100%">
            <Text fontSize="xs" fontWeight="bold">
              API Contract Editor
            </Text>
            <Conditional if={drafting}>
              <Badge variant="surface" ml="auto">
                Draft
              </Badge>
            </Conditional>
          </Flex>
        </Conditional>
        <Conditional if={condenseUi}>
          <img src="/akashicontract/favicons/favicon.svg" />
        </Conditional>
      </Flex>
      <Box h="100%" p="1rem">
        {Object.entries(editorLinks).map(([path, { icon, title }]) => (
          <Button
            key={path}
            color={loc.pathname.startsWith(path) ? "brand.highlight" : "unset"}
            w="100%"
            bg="brand.surface"
            asChild
            justifyContent={condenseUi ? "center" : "flex-start"}
            px={condenseUi ? ".5rem" : "unset"}
            _hover={{ bg: "brand.surfaceLighter" }}
          >
            <Link to={path}>
              {icon} {!condenseUi ? title : ""}
            </Link>
          </Button>
        ))}
      </Box>
      <Conditional if={!forceCondensed}>
        <Flex minH="4rem" borderTop="white .5px solid" borderColor="brand.bgLighter" p="1rem" justifyContent="center">
          <Conditional if={condensed}>
            <IconButton onClick={toggleCondensed} bg="brand.surface" _hover={{ bg: "brand.surfaceLighter" }}>
              <ChevronRight />
            </IconButton>
          </Conditional>
          <Conditional if={!condensed}>
            <Button onClick={toggleCondensed} bg="brand.surface" _hover={{ bg: "brand.surfaceLighter" }}>
              <ChevronLeft /> Collapse
            </Button>
          </Conditional>
        </Flex>
      </Conditional>
    </Flex>
  );
}

export function SidebarLayout(props: { children: ReactNode | ReactNode[] }) {
  return (
    <Flex zIndex={1} pos="fixed" w="100dvw" h="100dvh" backgroundColor="brand.bg" color="brand.color">
      <Sidebar />
      <Box w="100%" h="100%" p="2rem">
        {props.children}
      </Box>
    </Flex>
  );
}
