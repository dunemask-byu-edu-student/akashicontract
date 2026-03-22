import { Box, Flex, Text, Heading, Badge, Link, Table, Image } from "@chakra-ui/react";
import { Check, X, Minus, ArrowLeft } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { ReactNode } from "react";

function SectionDivider() {
  return <Box h="1px" bg="brand.surfaceDarker" my="1rem" />;
}

function AdvantageCard(props: { title: string; children: ReactNode }) {
  return (
    <Box
      bg="brand.surface"
      borderRadius="xl"
      p="1.75rem"
      borderWidth="1px"
      borderColor="brand.surfaceDarker"
      _hover={{ borderColor: "brand.highlight", transition: "border-color 0.2s" }}
    >
      <Heading size="sm" mb="0.75rem" color="brand.highlight">
        {props.title}
      </Heading>
      <Text fontSize="sm" opacity={0.9} lineHeight="1.7">
        {props.children}
      </Text>
    </Box>
  );
}

function CellIcon({ value }: { value: "yes" | "no" | "partial" }) {
  if (value === "yes") return <Check size={18} color="#22c55e" />;
  if (value === "no") return <X size={18} color="#ef4444" />;
  return <Minus size={18} color="#a3a3a3" />;
}

type Feature = {
  name: string;
  akc: "yes" | "no" | "partial";
  protobuf: "yes" | "no" | "partial";
  openapi: "yes" | "no" | "partial";
  graphql: "yes" | "no" | "partial";
  jsonschema: "yes" | "no" | "partial";
};

const features: Feature[] = [
  {
    name: "Realtime sync (WebSocket)",
    akc: "yes",
    protobuf: "no",
    openapi: "no",
    graphql: "partial",
    jsonschema: "no",
  },
  { name: "Visual schema editor", akc: "yes", protobuf: "no", openapi: "partial", graphql: "no", jsonschema: "no" },
  {
    name: "Multi-language codegen",
    akc: "yes",
    protobuf: "yes",
    openapi: "yes",
    graphql: "yes",
    jsonschema: "partial",
  },
  { name: "Versioned schema history", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
  {
    name: "Breaking change detection",
    akc: "yes",
    protobuf: "partial",
    openapi: "partial",
    graphql: "partial",
    jsonschema: "no",
  },
  { name: "Draft / branch workflow", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
  { name: "Git-backed persistence", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
  { name: "Language-agnostic DSL", akc: "yes", protobuf: "yes", openapi: "partial", graphql: "yes", jsonschema: "yes" },
  {
    name: "Schema linting rules",
    akc: "yes",
    protobuf: "partial",
    openapi: "yes",
    graphql: "partial",
    jsonschema: "partial",
  },
  { name: "Self-hosted / on-prem", akc: "yes", protobuf: "yes", openapi: "yes", graphql: "yes", jsonschema: "yes" },
  {
    name: "Enum + error + l10n support",
    akc: "yes",
    protobuf: "partial",
    openapi: "partial",
    graphql: "no",
    jsonschema: "partial",
  },
  { name: "SDK with Prisma-like DX", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
];

const tools = [
  { key: "akc", label: "AkashiContracts" },
  { key: "protobuf", label: "Protobuf" },
  { key: "openapi", label: "OpenAPI" },
  { key: "graphql", label: "GraphQL" },
  { key: "jsonschema", label: "JSON Schema" },
] as const;

export default function About() {
  return (
    <Flex
      w="full"
      px={{ base: "1.5rem", md: "3rem" }}
      py="3rem"
      direction="column"
      gap="3.5rem"
      maxW="1100px"
      mx="auto"
      minH="100vh"
    >
      {/* Back link */}
      <Link asChild color="brand.highlight" fontSize="sm" display="inline-flex" alignItems="center" gap="0.4rem">
        <RouterLink to="/home">
          <ArrowLeft size={14} /> Back to home
        </RouterLink>
      </Link>

      {/* HEADER */}
      <Box>
        <Badge mb="1rem" colorScheme="blue" fontSize="xs" px="0.6rem" py="0.15rem" borderRadius="md">
          About the Project
        </Badge>
        <Heading size="xl" mb="1rem">
          AkashiContracts
        </Heading>
        <Text fontSize="lg" opacity={0.9} lineHeight="1.8" maxW="800px">
          AkashiContracts is a realtime, language-agnostic schema and contract management platform. Define your data
          structures once in a visual editor or compact DSL, then automatically generate type-safe code for TypeScript,
          Flutter/Dart, Java, Go, Python, JavaScript, and more. Schemas are versioned, git-backed, and synced to every
          subscriber via WebSocket the moment they change.
        </Text>
      </Box>

      <SectionDivider />

      {/* UNFAIR ADVANTAGES */}
      <Box>
        <Heading size="lg" mb="0.5rem">
          Unfair Advantages
        </Heading>
        <Text fontSize="sm" opacity={0.7} mb="2rem">
          What makes AkashiContracts structurally different from existing schema tools.
        </Text>

        <Flex direction="column" gap="1.25rem">
          <AdvantageCard title="Realtime-first architecture">
            Other tools generate code at build time. AkashiContracts pushes schema updates over WebSocket the instant a
            version is published. Every subscriber in every repo gets the change simultaneously, eliminating the "did
            you pull the latest protos?" coordination tax entirely.
          </AdvantageCard>

          <AdvantageCard title="Draft / branch workflow with rebase">
            Edit schemas in isolated draft branches, preview changes, detect breaking conflicts against the main
            timeline, and merge when ready. No other schema tool offers a branch-and-merge workflow with conflict
            detection built in.
          </AdvantageCard>

          <AdvantageCard title="Compact binary registry with git delta compression">
            Schemas are stored in a custom binary key-value registry optimized for append-only writes. Git naturally
            delta-compresses the pages, so the repository size stays small even at 100k+ schemas. Reads use
            cursor-paginated binary index scans, making large-scale schema queries fast.
          </AdvantageCard>

          <AdvantageCard title="Prisma-like SDK with zero-config codegen">
            Install the SDK, point it at your project, and generated types appear in your import path automatically. The
            CLI watches for live updates and regenerates on the fly. No protoc, no swagger-codegen, no manual
            copy-paste.
          </AdvantageCard>

          <AdvantageCard title="Plugin-based generator architecture">
            11 built-in generators (TS, JS, Java, Dart, Go, Python, Markdown, JSON Schema, OpenAPI, HTML, plain TS).
            Need a custom target? Register a plugin with lifecycle hooks (beforeEmit, afterEmit, beforeEmitEnum) and the
            full CodeGenerator API. No forking the tool.
          </AdvantageCard>

          <AdvantageCard title="Git as the source of truth">
            Published versions are committed to a real git repository via ephemeral Kubernetes worker pods. The commit
            hash becomes the immutable identifier for that schema state. Roll back by checking out a previous commit.
            Audit by reading git log. No proprietary version store.
          </AdvantageCard>
        </Flex>
      </Box>

      <SectionDivider />

      {/* COMPARISON MATRIX */}
      <Box>
        <Heading size="lg" mb="0.5rem">
          Comparison Matrix
        </Heading>
        <Text fontSize="sm" opacity={0.7} mb="2rem">
          How AkashiContracts stacks up against common schema and contract tools.
        </Text>

        <Box borderRadius="xl" borderWidth="1px" borderColor="brand.surfaceDarker" overflow="hidden">
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row bg="brand.surfaceDarker">
                <Table.ColumnHeader
                  py="0.85rem"
                  px="1rem"
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="brand.color"
                  opacity={0.7}
                  minW="200px"
                >
                  Feature
                </Table.ColumnHeader>
                {tools.map((t) => (
                  <Table.ColumnHeader
                    key={t.key}
                    py="0.85rem"
                    px="0.75rem"
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    textAlign="center"
                    color={t.key === "akc" ? "brand.highlight" : "brand.color"}
                    opacity={t.key === "akc" ? 1 : 0.7}
                  >
                    {t.label}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {features.map((f, i) => (
                <Table.Row
                  key={f.name}
                  bg={i % 2 === 0 ? "brand.surface" : "brand.bg"}
                  _hover={{ bg: "brand.surfaceLighter" }}
                  transition="background 0.15s"
                >
                  <Table.Cell py="0.7rem" px="1rem" fontSize="sm">
                    {f.name}
                  </Table.Cell>
                  {tools.map((t) => (
                    <Table.Cell key={t.key} py="0.7rem" px="0.75rem" textAlign="center">
                      <Flex justify="center">
                        <CellIcon value={f[t.key]} />
                      </Flex>
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Flex gap="1.5rem" mt="1.25rem" fontSize="xs" opacity={0.6} justify="center">
          <Flex align="center" gap="0.3rem">
            <Check size={14} color="#22c55e" /> Full support
          </Flex>
          <Flex align="center" gap="0.3rem">
            <Minus size={14} color="#a3a3a3" /> Partial / via plugins
          </Flex>
          <Flex align="center" gap="0.3rem">
            <X size={14} color="#ef4444" /> Not supported
          </Flex>
        </Flex>
      </Box>

      <SectionDivider />

      {/* TECH STACK */}
      <Box>
        <Heading size="lg" mb="0.5rem">
          Architecture
        </Heading>
        <Text fontSize="sm" opacity={0.7} mb="1.5rem">
          Built for production SaaS teams with a Kubernetes-native deployment model.
        </Text>

        <Flex direction="column" gap="1rem" fontSize="sm" lineHeight="1.8">
          <Flex gap="1rem" wrap="wrap">
            {[
              "TypeScript 5.9+",
              "NestJS 11",
              "React 19",
              "PostgreSQL + Prisma 7",
              "Redis + BullMQ",
              "Kubernetes",
              "Helm",
              "Bun",
            ].map((tech) => (
              <Badge key={tech} px="0.6rem" py="0.2rem" borderRadius="md" fontSize="xs" variant="subtle">
                {tech}
              </Badge>
            ))}
          </Flex>

          <Text opacity={0.85}>
            The server runs as a NestJS application with a git-proxy sidecar and ephemeral git-worker Kubernetes Jobs
            for publish operations. PostgreSQL stores project metadata and schema snapshots, while git repositories
            serve as the immutable version history. The frontend is a React single-page application with Chakra UI and
            TanStack Query for optimistic updates.
          </Text>
        </Flex>
      </Box>

      {/* FOOTER */}
      <Box as="footer" pt="2rem" mt="auto" borderTopWidth="1px" borderColor="brand.surfaceDarker">
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" opacity={0.5}>
            © {new Date().getFullYear()} AkashiContracts
          </Text>
          <Link asChild color="brand.highlight" fontSize="sm">
            <RouterLink to="/home">Home</RouterLink>
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
}
