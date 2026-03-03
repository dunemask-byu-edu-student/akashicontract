import { useState, useMemo } from "react";
import {
  Box,
  Input,
  IconButton,
  SimpleGrid,
  Flex,
  Text,
  VStack,
  HStack,
  InputGroup,
  Button,
  Separator,
} from "@chakra-ui/react";
import { Search, Grid as GridIcon, List as ListIcon, ChevronLeft, ChevronRight, FileText, Trash2 } from "lucide-react";
import EditorHeader from "@akc/ui/components/EditorHeader";
import EnumEditorDialog from "./EnumEditorDialog";
import EnumCreationDialog from "./EnumCreationDialog";
import { useSearchParams } from "react-router-dom";
import { useEnums } from "@akc/ui/ctx/RecordHooks";
import { ACRefVinPrefix } from "@akc/parser/elements/ElementsCommon";
import Conditional from "@akc/ui/components/commons/Conditional";
import { useCollectionContext } from "@akc/ui/ctx/CollectionContext";

type AttributeType = "STRING" | "BOOLEAN" | "FLOAT";

export interface EnumJSON {
  id?: string;
  name: string;
  attributes: { name: string; type: AttributeType }[];
}

interface EnumDisplayItem {
  id: string;
  vin: string;
  values: string[];
  fullAttributes: { name: string; type: AttributeType }[];
}

export default function EnumEditor() {
  const { contracts, refresh } = useCollectionContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const creationOpen = searchParams.get("new") === "true";
  const { draftedVins } = useEnums();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const pageSize = viewMode === "grid" ? 50 : 10;

  const toggleCreation = () =>
    creationOpen ? setSearchParams((prev) => ({ ...prev })) : setSearchParams((prev) => ({ ...prev, new: "true" }));

  const closeEnumEditor = () => setSearchParams((prev) => ({ ...prev, new: undefined }));

  const filtered = useMemo((): EnumDisplayItem[] => {
    return contracts
      .map((c) => ({
        id: c.id,
        vin: `${ACRefVinPrefix.enum}${c.name}`,
        values: Object.keys(c.attributes),
        fullAttributes: Object.entries(c.attributes).map(([name, type]) => ({
          name,
          type: (type === "NUMBER" ? "FLOAT" : type) as AttributeType,
        })),
      }))
      .filter((e) => {
        const name = e.vin.replace(ACRefVinPrefix.enum, "");
        return name.toLowerCase().includes(search.toLowerCase());
      });
  }, [contracts, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));

  const handleTileDelete = async (id: string) => {
    const res = await fetch(`/api/contracts/objects/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    await refresh();
  };

  const handleTileSave = async (json: EnumJSON) => {
    const attributes = Object.fromEntries(
      json.attributes.filter((a) => a.name.trim() !== "").map((a) => [a.name, a.type === "FLOAT" ? "NUMBER" : a.type]),
    );
    const res = json.id
      ? await fetch(`/api/contracts/objects/${json.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: json.id, name: json.name, userId: "1", attributes }),
        })
      : await fetch("/api/contracts/objects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: json.name, attributes }),
        });
    if (!res.ok) throw new Error(await res.text());
    await refresh();
  };

  return (
    <Box w="100%" h="100%" pos="relative">
      <EditorHeader
        title="API Objects"
        subtitle="Design and manage your API objects"
        button={{ buttonText: "New Object", onButtonClick: toggleCreation }}
      />

      <EnumCreationDialog open={creationOpen} toggle={toggleCreation} />
      <EnumEditorDialog close={closeEnumEditor} />

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

      {/* 🧱 Enums Display */}
      <Conditional if={viewMode === "grid"}>
        <SimpleGrid columns={[1, 2, 3, 4, 5]} gap=".5rem">
          {paginated.map((e) => (
            <EnumTile
              key={e.vin}
              item={e}
              drafted={draftedVins.has(e.vin)}
              viewMode="grid"
              onSave={handleTileSave}
              onDelete={handleTileDelete}
              contracts={filtered}
            />
          ))}
        </SimpleGrid>
      </Conditional>
      <Conditional if={viewMode === "list"}>
        <VStack gap={2} align="stretch">
          {paginated.map((e) => (
            <EnumTile
              key={e.vin}
              item={e}
              drafted={draftedVins.has(e.vin)}
              viewMode="list"
              onSave={handleTileSave}
              onDelete={handleTileDelete}
              contracts={filtered}
            />
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

interface EnumTileProps {
  item: EnumDisplayItem;
  drafted: boolean;
  viewMode: "grid" | "list";
  onSave: (json: EnumJSON) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  contracts: EnumDisplayItem[];
}

const selectStyle: React.CSSProperties = {
  flex: "0 0 100px",
  padding: "4px 6px",
  color: "#EEEEEE",
  backgroundColor: "#2a2a2a",
  border: "1px solid #4a4a4a",
  borderRadius: "4px",
  fontSize: "13px",
};

// 🧩 EnumTile Component
export function EnumTile({ item, drafted, onSave, onDelete, contracts }: EnumTileProps) {
  const normalizedVin = item.vin.replace(ACRefVinPrefix.enum, "");

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(normalizedVin);
  const [rows, setRows] = useState<{ name: string; type: AttributeType }[]>(item.fullAttributes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpen = () => {
    setTitle(normalizedVin);
    setRows(item.fullAttributes);
    setError(null);
    setConfirmDelete(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      setError("Failed to delete");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    const duplicate = contracts.some((c) => c.vin.replace(ACRefVinPrefix.enum, "") === trimmed && c.id !== item.id);
    if (duplicate) {
      setError(`An object named '${trimmed}' already exists`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({ id: item.id, name: trimmed, attributes: rows.filter((r) => r.name.trim() !== "") });
      setIsEditing(false);
    } catch {
      setError("Failed to save — name may already be taken");
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (index: number, field: "name" | "type", value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  return (
    <Box
      borderWidth="1px"
      borderColor={isEditing ? "brand.highlight" : "brand.surfaceLighter"}
      borderRadius="md"
      p={3}
      bg="brand.surface"
      transition="border-color 0.15s"
    >
      {isEditing ? (
        <VStack align="stretch" gap={2}>
          {/* Name row */}
          <Input
            size="sm"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="ObjectName"
            borderColor={error ? "red.400" : undefined}
          />

          {/* Error */}
          {error && (
            <Text fontSize="xs" color="red.400">
              {error}
            </Text>
          )}

          <Separator borderColor="brand.surfaceLighter" />

          {/* Column headers */}
          {rows.length > 0 && (
            <HStack px="2px">
              <Text fontSize="xs" opacity={0.5} flex={1}>
                Name
              </Text>
              <Text fontSize="xs" opacity={0.5} flex="0 0 100px">
                Type
              </Text>
              <Box w="24px" />
            </HStack>
          )}

          {/* Attribute rows */}
          <VStack align="stretch" gap={1}>
            {rows.map((row, i) => (
              <HStack key={i} gap={1}>
                <Input
                  size="sm"
                  placeholder="attribute"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                />
                <select value={row.type} onChange={(e) => updateRow(i, "type", e.target.value)} style={selectStyle}>
                  <option value="STRING">STRING</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="FLOAT">FLOAT</option>
                </select>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  color="brand.color"
                  _hover={{ bg: "brand.surfaceLighter" }}
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  ✕
                </IconButton>
              </HStack>
            ))}
          </VStack>

          {/* Add + actions */}
          <HStack justify="space-between">
            <Button
              size="xs"
              variant="ghost"
              color="brand.color"
              _hover={{ bg: "brand.surfaceLighter" }}
              onClick={() => setRows((prev) => [...prev, { name: "", type: "STRING" }])}
            >
              + Add
            </Button>
            <HStack gap={1}>
              {confirmDelete ? (
                <>
                  <Text fontSize="xs" color="red.400">
                    Delete?
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="brand.color"
                    _hover={{ bg: "brand.surfaceLighter" }}
                    onClick={() => setConfirmDelete(false)}
                  >
                    No
                  </Button>
                  <Button size="xs" colorPalette="red" loading={deleting} onClick={handleDelete}>
                    Yes
                  </Button>
                </>
              ) : (
                <>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Delete object"
                    color="red.400"
                    _hover={{ bg: "red.950" }}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={13} />
                  </IconButton>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="brand.color"
                    _hover={{ bg: "brand.surfaceLighter" }}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    bg="brand.highlight"
                    color="brand.highlightText"
                    _hover={{ bg: "brand.highlight", opacity: 0.85 }}
                    loading={saving}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </>
              )}
            </HStack>
          </HStack>
        </VStack>
      ) : (
        <Box cursor="pointer" onClick={handleOpen} _hover={{ opacity: 0.85 }} transition="opacity 0.15s">
          <Flex justify="space-between" align="center" mb={2}>
            <HStack gap={1} minW={0}>
              <FileText size={14} />
              <Text fontWeight="semibold" fontSize="sm" truncate>
                {title}
              </Text>
            </HStack>
            <Conditional if={drafted}>
              <Text fontSize="xs" color="brand.highlight" fontWeight="bold" flexShrink={0}>
                DRAFT
              </Text>
            </Conditional>
          </Flex>

          <VStack align="start" gap="2px">
            {rows.slice(0, 4).map((r, i) => (
              <HStack key={i} fontSize="xs" bg="blackAlpha.200" px={2} py="2px" borderRadius="sm" gap={1}>
                <Text fontWeight="medium">{r.name}</Text>
                <Text opacity={0.5}>:</Text>
                <Text opacity={0.7}>{r.type}</Text>
              </HStack>
            ))}
            {rows.length > 4 && (
              <Text fontSize="xs" opacity={0.5}>
                +{rows.length - 4} more
              </Text>
            )}
            {rows.length === 0 && (
              <Text fontSize="xs" opacity={0.4} fontStyle="italic">
                no attributes
              </Text>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
