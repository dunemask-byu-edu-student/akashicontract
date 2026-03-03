import { useState, useMemo, useEffect } from "react";
import { Box, Input, IconButton, SimpleGrid, Flex, Text, VStack, HStack, InputGroup, Textarea, Button, Select as ChakraSelect } from "@chakra-ui/react";
import { Search, Grid as GridIcon, List as ListIcon, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import EditorHeader from "@akc/ui/components/EditorHeader";
import EnumEditorDialog from "./EnumEditorDialog";
import EnumCreationDialog from "./EnumCreationDialog";
import { useSearchParams } from "react-router-dom";
import { useEnums } from "@akc/ui/ctx/RecordHooks";
import { ACRefVinPrefix, ACREnum } from "@akc/parser/elements/ElementsCommon";
import Conditional from "@akc/ui/components/commons/Conditional";



export default function EnumEditor() {
  // // 🚀 Loading objects from API (NOT tested yet)
  // const [enumContainer, setEnumContainer] = useState<EnumJSON[]>([]);
  // useEffect(() => {
  //   const loadEnums = async () => {
  //     try {
  //       const response = await fetch("/api/contracts/objects/");
  //       const data = await response.json();
  //       setEnumContainer(data);
  //     } catch (err) {
  //       console.error("Failed to load enums:", err);
  //     }
  //   };
  //   loadEnums();
  // }, []);
  // // 🚀 Loading objects from API (NOT tested yet)

  
  // 📖 Load from localStorage for now 
  const [enumContainer, setEnumContainer] = useState<EnumJSON[]>(() => {
    const stored = localStorage.getItem("enumContainer"); // 🚀 Load from endpoint instead of localStorage later
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("enumContainer", JSON.stringify(enumContainer));// 🚀 Replace with API call to save enums
  }, [enumContainer]);
  // 📖 Load from localStorage for now

  const [searchParams, setSearchParams] = useSearchParams();
  const creationOpen = searchParams.get("new") === "true";
  const { items, draftedVins } = useEnums();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // ✅ Pagination sizes per mode
  const pageSize = viewMode === "grid" ? 50 : 10;

  const toggleCreation = () =>
    creationOpen ? setSearchParams((prev) => ({ ...prev })) : setSearchParams((prev) => ({ ...prev, new: "true" }));

  const closeEnumEditor = () => setSearchParams((prev) => ({ ...prev, new: undefined }));

  // Combine saved enums + items from useEnums()
  const filtered = useMemo(() => {
    // Convert saved enums to same shape as items
    const savedEnums = enumContainer.map(e => ({
      vin: e.name,
      values: e.attributes.map(a => a.name)
    }));
    // Merge without duplicates
    const vinSet = new Set(savedEnums.map(e => e.vin));
    const combined = [...savedEnums, ...items.filter(i => !vinSet.has(i.vin))];
    // Filter by search
    return combined.filter(e => e.vin.toLowerCase().includes(search.toLowerCase()));
  }, [enumContainer, items, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));

//   // 🚀 API call to post a new tile or update an existing tile. (NOT tested yet.)
//   const handleTileSave = async (json: EnumJSON) => {
//   try {
//     // API call to POST or PUT depending on backend logic
//     const response = await fetch("/api/contracts/objects", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(json),
//     });
//     const savedEnum = await response.json();
//     // Update local state with backend response
//     setEnumContainer(prev => {
//       const existingIndex = prev.findIndex(e => e.name === savedEnum.name);
//       if (existingIndex !== -1) {
//         const updated = [...prev];
//         updated[existingIndex] = savedEnum;
//         return updated;
//       }
//       return [...prev, savedEnum];
//     });
//   } catch (err) {
//     console.error("Failed to save enum:", err);
//   }
// };
// // 🚀 API call to post a new tile or update an existing tile. (NOT tested yet.)
  
  // 📖 Saving a new tile and/or updating a new tile to localstorage
  // Save function (EnumTile calls this)
  const handleTileSave = (json: EnumJSON) => {
    setEnumContainer(prev => {
      const existingIndex = prev.findIndex(e => e.name === json.name);
      let newContainer = [...prev];
      if (existingIndex !== -1) newContainer[existingIndex] = json;
      else newContainer.push(json);
      // localStorage already updates via useEffect
      // TODO: Later replace the above logic with an API call to the backend
      // API call here <--

      console.log("Saved enum:", json);
      return newContainer;
      // 🚀 For endpoint: remove this state update
      // Instead do await fetch()
    });
  };
  // 📖 Saving a new tile and/or updating a new tile to localstorage

  return (
    <Box w="100%" h="100%" pos="relative">
      <EditorHeader
        title="API Enums"
        subtitle="Design and manage your API enums"
        button={{ buttonText: "New Enum", onButtonClick: toggleCreation }}
      />

      <EnumCreationDialog open={creationOpen} toggle={toggleCreation} />
      <EnumEditorDialog close={closeEnumEditor} />

      {/* 🔍 Search + view toggle */}
      <Flex justify="space-between" align="center" mb={4} mt="1rem">
        <Flex align="center" gap={2}>
          <InputGroup endElement={<Search size={18} />} bg="brand.surfaceDarker" color="brand.surfaceText">
            <Input
              placeholder="Search enums..."
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

      {/* 🧱 Enums Display */}
      <Conditional if={viewMode === "grid"}>
        <SimpleGrid columns={[1, 2, 3, 4, 5]} gap=".5rem">
          {paginated.map((e) => (
            <EnumTile key={e.vin} item={e} drafted={draftedVins.has(e.vin)} viewMode="grid" onSave={handleTileSave}/>
          ))}
        </SimpleGrid>
      </Conditional>
      <Conditional if={viewMode === "list"}>
        <VStack gap={2} align="stretch">
          {paginated.map((e) => (
            <EnumTile key={e.vin} item={e} drafted={draftedVins.has(e.vin)} viewMode="list" onSave={handleTileSave}/>
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

type AttributeType = "STRING" | "BOOLEAN" | "FLOAT";

export interface EnumJSON {
  name: string;
  attributes: { name: string; type: AttributeType }[];
}
  
interface EnumTileProps {
  item: { vin: string; values: string[] };
  drafted: boolean;
  viewMode: "grid" | "list";
  onSave: (json: EnumJSON) => void;
}

// 🧩 EnumTile Component
export function EnumTile({ item, drafted, viewMode, onSave }: EnumTileProps) {
  
  
  const sizeDisplay = `${item.values.length > 1000 ? "999 + " : item.values.length} values`;
  const valueDisplay = item.values.length < 4 ? item.values.join(", ") : sizeDisplay;
  const normalizedValueDisplay = valueDisplay.length > 20 ? sizeDisplay : valueDisplay;
  const normalizedVin = item.vin.replace(ACRefVinPrefix.enum, "");

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(normalizedVin);
  const [rows, setRows] = useState<{ name: string; type: AttributeType }[]>(
    item.values.map(v => ({ name: v, type: "STRING" }))
  );

  // const handleClick = () => {
  //   console.log(`Enum clicked: ${item.vin}`); 
  // };

  const handleClick = () => {
  setIsEditing(true);
};

  const handleSave = () => {
  const jsonResult = {
    name: title,
    attributes: rows.filter(r => r.name.trim() !== "")
  };

  console.log("Enum JSON:", jsonResult);
  // Sending to container/local storage, or the "endpoint"
  onSave(jsonResult);

  setIsEditing(false);

};

  const updateRow = (
    index: number,
    field: "name" | "type",
    newValue: string
  ) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: field === "type" ? (newValue as AttributeType) : newValue,
            }
          : row
      )
    );
  };

  const addRow = () => {
    setRows(prev => [...prev, { name: "", type: "STRING" }]);
  };

  const removeRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  return (
  <Box
    borderWidth="1px"
    borderColor="brand.surfaceLighter"
    borderRadius="md"
    p={3}
    bg="brand.surface"
    transition="all 0.2s"
    overflow="hidden"
  >
    {isEditing ? (
      <>
        <Input
          size="sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          mb={2}
          placeholder="Title"
        />

        <VStack align="stretch" spacing={2} mb={2}>
          {rows.map((row, i) => (
            <HStack key={i}>
              <Input
                size="sm"
                placeholder="Attribute Name"
                value={row.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
              />

              <select
                  value={row.type}
                  onChange={(e) =>
                    updateRow(i, "type", e.target.value as AttributeType)
                  }
                  style={{ width: "120px", padding: "4px", color: "black", backgroundColor: "white" }}
                >
                  <option value="STRING">STRING</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="FLOAT">FLOAT</option>
                </select>

              <Button
                size="xs"
                variant="ghost"
                onClick={() => removeRow(i)}
              >
                ✕
              </Button>
            </HStack>
          ))}
        </VStack>

        <Button size="xs" variant="outline" mb={2} onClick={addRow}>
          + Add
        </Button>

        <HStack>
          <Button size="xs" onClick={handleSave}>
            Save
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </HStack>
      </>
    ) : (
      <Box
        cursor="pointer"
        onClick={handleClick}
        _hover={{ opacity: 0.9, transform: "translateY(-1px)", shadow: "md" }}
        transition="all 0.15s"
      >
        {/* Header: Title + optional DRAFT badge */}
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={1} maxW="10rem">
            <Hash size={14} />
            <Text
              fontWeight="semibold"
              fontSize="sm"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {title}
            </Text>
          </HStack>

          <Conditional if={drafted}>
            <Text fontSize="xs" color="brand.highlight" fontWeight="bold">
              DRAFT
            </Text>
          </Conditional>
        </Flex>

        {/* Values preview */}
        <VStack align="start" spacing={1}>
          {rows.slice(0, 4).map((r, i) => (
            <HStack
              key={i}
              spacing={1}
              fontSize="xs"
              bg="blackAlpha.200"
              px={2}
              py="2px"
              borderRadius="sm"
            >
              <Text fontWeight="medium">{r.name}</Text>
              <Text opacity={0.6}>:</Text>
              <Text fontWeight="semibold">{r.type}</Text>
            </HStack>
          ))}

          {/* If there are more than 4 rows, show a "+X more" */}
          {rows.length > 4 && (
            <Text fontSize="xs" opacity={0.6}>
              +{rows.length - 4} more
            </Text>
          )}
        </VStack>
      </Box>
    )}
  </Box>
);

}
