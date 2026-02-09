import { useState, useMemo } from "react";
import { Box, Input, IconButton, SimpleGrid, Flex, Text, VStack, HStack, InputGroup } from "@chakra-ui/react";
import { Search, Grid as GridIcon, List as ListIcon, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import EditorHeader from "@akc/ui/components/EditorHeader";
import ObjectEditorDialog from "./ObjectEditorDialog";
import ObjectCreationDialog from "./ObjectCreationDialog";
import { useSearchParams } from "react-router-dom";
import { useObjects } from "@akc/ui/ctx/RecordHooks";
import { ACRefVinPrefix, ACRObject } from "@akc/parser/elements/ElementsCommon";
import Conditional from "@akc/ui/components/commons/Conditional";

export default function ObjectEditor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const creationOpen = searchParams.get("new") === "true";
  const { items, draftedVins } = useObjects();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // ✅ Pagination sizes per mode
  const pageSize = viewMode === "grid" ? 50 : 10;

  const toggleCreation = () =>
    creationOpen ? setSearchParams((prev) => ({ ...prev })) : setSearchParams((prev) => ({ ...prev, new: "true" }));

  const closeObjectEditor = () => setSearchParams((prev) => ({ ...prev, new: undefined }));

  const filtered = useMemo(
    () => items.filter((e) => e.vin.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));

  return (
    <Box w="100%" h="100%" pos="relative">
      <EditorHeader
        title="API Objects"
        subtitle="Design and manage your API objects"
        button={{ buttonText: "New Object", onButtonClick: toggleCreation }}
      />

      <ObjectCreationDialog open={creationOpen} toggle={toggleCreation} />
      <ObjectEditorDialog close={closeObjectEditor} />

      {/* 🔍 Search + view toggle */}
      <Flex justify="space-between" align="center" mb={4} mt="1rem">
        <Flex align="center" gap={2}>
          <InputGroup endElement={<Search size={18} />} bg="brand.surfaceDarker" color="brand.surfaceText">
            <Input
              placeholder="Search objects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              w="250px"
              size="sm"
            />
          </InputGroup>
        </Flex>

        <Flex align="center" gap={2}>
          <IconButton
            aria-label="Grid View"
            size="sm"
            onClick={() => {
              setViewMode("grid");
              setPage(1);
            }}
          >
            <GridIcon size={18} />
          </IconButton>
          <IconButton
            aria-label="List View"
            size="sm"
            onClick={() => {
              setViewMode("list");
              setPage(1);
            }}
          >
            <ListIcon size={18} />
          </IconButton>
        </Flex>
      </Flex>

      {/* 🧱 Objects Display */}
      <Conditional if={viewMode === "grid"}>
        <SimpleGrid columns={[1, 2, 3, 4, 5]} gap=".5rem">
          {paginated.map((e) => (
            <ObjectTile key={e.vin} item={e} drafted={draftedVins.has(e.vin)} viewMode="grid" />
          ))}
        </SimpleGrid>
      </Conditional>
      <Conditional if={viewMode === "list"}>
        <VStack gap={2} align="stretch">
          {paginated.map((e) => (
            <ObjectTile key={e.vin} item={e} drafted={draftedVins.has(e.vin)} viewMode="list" />
          ))}
        </VStack>
      </Conditional>

      {/* 📄 Pagination pinned bottom-left */}
      <Flex position="absolute" bottom={0} left={0} align="center" gap={3}>
        <IconButton aria-label="Previous Page" onClick={handlePrev} disabled={page === 1} size="sm">
          <ChevronLeft size={18} />
        </IconButton>
        <Text fontSize="sm">
          Page {page} of {totalPages || 1}
        </Text>
        <IconButton
          aria-label="Next Page"
          onClick={handleNext}
          disabled={page === totalPages || totalPages === 0}
          size="sm"
        >
          <ChevronRight size={18} />
        </IconButton>
      </Flex>
    </Box>
  );
}

// 🧩 ObjectTile Component
function ObjectTile({ item, drafted, viewMode }: { item: ACRObject; drafted: boolean; viewMode: "grid" | "list" }) {
  const sizeDisplay = `${item.children.length > 1000 ? "999 + " : item.children.length} properties`;
  const normalizedVin = item.vin.replace(ACRefVinPrefix.object, "");
  const handleClick = () => {
    console.log(`Object clicked: ${item.vin}`);
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="brand.surfaceLighter"
      borderRadius="md"
      p={3}
      bg="brand.surface"
      transition="all 0.2s"
      cursor="pointer"
      _hover={{ opacity: 0.8 }}
      onClick={handleClick}
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" mb={1}>
        <Flex gap=".125rem">
          <FileText size={16} />
          <Text
            fontWeight="bold"
            fontSize="sm"
            display="inline"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            maxWidth="8rem"
            overflow="hidden"
          >
            {normalizedVin}
          </Text>
        </Flex>
        <Conditional if={drafted}>
          <Text fontSize="xs" color="brand.highlight" fontWeight="semibold">
            DRAFT
          </Text>
        </Conditional>
      </Flex>

      <HStack align="start">{sizeDisplay}</HStack>
    </Box>
  );
}
