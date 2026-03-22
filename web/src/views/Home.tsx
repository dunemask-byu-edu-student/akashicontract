import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  SimpleGrid,
  Badge,
  List,
  Carousel,
  Link,
  IconButton,
  Table,
} from "@chakra-ui/react";
import {
  Layers,
  RefreshCcw,
  GitMerge,
  Globe,
  Zap,
  ArrowLeft,
  ArrowRight,
  LucideIcon,
  Check,
  X,
  Minus,
  Sparkles,
  GitBranch,
  Database,
  Terminal,
  Puzzle,
  FolderGit2,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

// ── Fade-in on scroll ──

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Comparison matrix data ──

function CellIcon({ value }: { value: "yes" | "no" | "partial" }) {
  if (value === "yes") return <Check size={16} color="#22c55e" strokeWidth={2.5} />;
  if (value === "no") return <X size={16} color="#ef4444" strokeWidth={2.5} />;
  return <Minus size={16} color="#737373" strokeWidth={2.5} />;
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
    name: "Multi-language codegen",
    akc: "yes",
    protobuf: "yes",
    openapi: "yes",
    graphql: "yes",
    jsonschema: "partial",
  },
  { name: "Language-agnostic IDL", akc: "yes", protobuf: "yes", openapi: "yes", graphql: "yes", jsonschema: "yes" },
  { name: "Validation & linting", akc: "yes", protobuf: "yes", openapi: "yes", graphql: "yes", jsonschema: "yes" },
  {
    name: "API spec generation",
    akc: "yes",
    protobuf: "partial",
    openapi: "yes",
    graphql: "yes",
    jsonschema: "partial",
  },
  {
    name: "Breaking change detection",
    akc: "yes",
    protobuf: "partial",
    openapi: "partial",
    graphql: "partial",
    jsonschema: "no",
  },
  {
    name: "Realtime collaboration & code sync",
    akc: "yes",
    protobuf: "no",
    openapi: "no",
    graphql: "partial",
    jsonschema: "no",
  },
  { name: "Visual editor", akc: "yes", protobuf: "no", openapi: "partial", graphql: "no", jsonschema: "no" },
  { name: "Version history", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
  { name: "Draft branches", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
  { name: "Installable SDK", akc: "yes", protobuf: "no", openapi: "no", graphql: "no", jsonschema: "no" },
];

const tools = [
  { key: "akc" as const, label: "AKC" },
  { key: "protobuf" as const, label: "Protobuf" },
  { key: "openapi" as const, label: "OpenAPI" },
  { key: "graphql" as const, label: "GraphQL" },
  { key: "jsonschema" as const, label: "JSON Schema" },
];

// ── Carousel ──

const carouselImages = [
  `${import.meta.env.BASE_URL}marketing/demo/Enums.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Errors.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Exports.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Locales.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Objects.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Roles.png`,
];

// ── Components ──

function FeatureCard(props: { icon: LucideIcon; title: string; children: ReactNode[] | ReactNode }) {
  return (
    <Box bg="brand.surface" borderRadius="xl" p="1.5rem" borderWidth="1px" borderColor="brand.surfaceDarker">
      <Flex align="center" gap="0.75rem" mb="0.75rem">
        <Box color="brand.highlight">
          <props.icon size="22px" />
        </Box>
        <Text fontWeight="semibold">{props.title}</Text>
      </Flex>
      <Text fontSize="sm" opacity={0.85}>
        {props.children}
      </Text>
    </Box>
  );
}

function WhyCard(props: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <Box
      bg="brand.surface"
      borderRadius="xl"
      p="1.5rem"
      borderWidth="1px"
      borderColor="brand.surfaceDarker"
      _hover={{ borderColor: "brand.highlight" }}
      transition="border-color 0.25s"
    >
      <Flex align="center" gap="0.6rem" mb="0.6rem">
        <Box color="brand.highlight">
          <props.icon size={18} />
        </Box>
        <Text fontWeight="semibold" fontSize="sm">
          {props.title}
        </Text>
      </Flex>
      <Text fontSize="xs" opacity={0.8} lineHeight="1.65">
        {props.children}
      </Text>
    </Box>
  );
}

// ── Page ──

export default function Home() {
  return (
    <Flex
      w="full"
      px={{ base: "1.5rem", md: "3rem" }}
      py="4rem"
      direction="column"
      gap="5rem"
      maxW="1200px"
      mx="auto"
      minH="100vh"
    >
      {/* HERO */}
      <FadeIn>
        <Flex direction={{ base: "column", md: "row" }} align="center" gap="3rem">
          <Image
            src={`${import.meta.env.BASE_URL}favicons/web-app-manifest-512x512.png`}
            w="220px"
            h="220px"
            borderRadius="2xl"
            border="2px solid"
            borderColor="brand.highlight"
            p="1rem"
            bg="brand.surfaceDarker"
          />

          <Box flex="1">
            <Badge mb="0.75rem" colorScheme="purple">
              Structures · Schemas · Realtime
            </Badge>

            <Heading size="lg" mb="1rem">
              Realtime contracts for multi-repo SaaS teams
            </Heading>

            <Text fontSize="lg" opacity={0.9}>
              AkashiContracts keeps your data structures versioned, language-agnostic, and instantly synced across every
              repository.
            </Text>

            <Flex gap="1.5rem" mt="1.5rem" wrap="wrap">
              <Flex align="center" gap="0.5rem">
                <Zap size={16} />
                <Text fontSize="sm">Realtime updates</Text>
              </Flex>
              <Flex align="center" gap="0.5rem">
                <Globe size={16} />
                <Text fontSize="sm">Language agnostic</Text>
              </Flex>
              <Flex align="center" gap="0.5rem">
                <Layers size={16} />
                <Text fontSize="sm">Versioned schemas</Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </FadeIn>

      {/* FEEDBACK CTA */}
      <FadeIn>
        <Box
          bg="brand.surface"
          borderRadius="xl"
          p={{ base: "1.5rem", md: "2rem" }}
          borderWidth="1px"
          borderColor="brand.surfaceDarker"
          textAlign="center"
        >
          <Heading size="sm" mb="0.5rem">
            We'd love your feedback
          </Heading>
          <Text fontSize="sm" mb="1rem" opacity={0.85}>
            Help us solve <strong>your</strong> data structure problem.
          </Text>
          <Link
            href="https://forms.gle/CM2qu9gtrmsJYr216"
            fontSize="sm"
            px="1.25rem"
            py="0.6rem"
            borderRadius="md"
            bg="brand.highlight"
            color="white"
            fontWeight="semibold"
            _hover={{ opacity: 0.9 }}
          >
            Share feedback
          </Link>
          <br />
          <Link
            href="https://forms.gle/RCCcYmy9SRqtV3n46"
            opacity={0.8}
            _hover={{ opacity: 1 }}
            color="brand.highlight"
            mt=".5rem"
          >
            How did you hear about us?
          </Link>
        </Box>
      </FadeIn>

      {/* PROBLEM */}
      <FadeIn>
        <Box>
          <Heading size="md" mb="2rem">
            The problem SaaS teams keep fighting
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="1.5rem">
            <FeatureCard icon={GitMerge} title="Painful cross-repo updates">
              Updating schemas means touching multiple repos, coordinating releases, and hoping nothing breaks.
            </FeatureCard>
            <FeatureCard icon={RefreshCcw} title="Manual validation & drift">
              Data structures fall out of sync and require constant validation and testing.
            </FeatureCard>
            <FeatureCard icon={Globe} title="Language lock-in">
              Schemas aren't truly language agnostic, forcing custom tooling per stack.
            </FeatureCard>
            <FeatureCard icon={Layers} title="Versioning chaos">
              Inconsistent versioning leads to broken APIs and slow merges.
            </FeatureCard>
          </SimpleGrid>
        </Box>
      </FadeIn>

      {/* SOLUTION */}
      <FadeIn>
        <Box bg="brand.surface" borderRadius="2xl" p="2.5rem">
          <Heading size="md" mb="1rem">
            The AkashiContracts approach
          </Heading>
          <List.Root gap="0.75rem">
            <List.Item>Edit generic data structures once</List.Item>
            <List.Item>Automatically generate language-agnostic contracts</List.Item>
            <List.Item>Subscribers receive updates immediately, versioned and validated</List.Item>
          </List.Root>
        </Box>
      </FadeIn>

      {/* WHY AKASHICONTRACTS */}
      <FadeIn>
        <Box>
          <Heading size="md" mb="0.5rem">
            Why AkashiContracts
          </Heading>
          <Text fontSize="sm" opacity={0.6} mb="2rem">
            What makes it structurally different from existing schema tools.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="1.25rem">
            <FadeIn delay={0.05}>
              <WhyCard icon={Sparkles} title="Realtime-first architecture">
                Schema updates push over WebSocket the instant a version is published. Every subscriber gets the change
                simultaneously — no "did you pull the latest protos?" coordination tax.
              </WhyCard>
            </FadeIn>
            <FadeIn delay={0.1}>
              <WhyCard icon={GitBranch} title="Draft / branch workflow">
                Edit schemas in isolated branches, preview changes, detect breaking conflicts against the main timeline,
                and merge when ready. No other schema tool has this built in.
              </WhyCard>
            </FadeIn>
            <FadeIn delay={0.15}>
              <WhyCard icon={Database} title="Binary registry + git deltas">
                A custom append-only binary KV store with cursor pagination. Git delta-compresses pages naturally,
                keeping repo size small even at 100k+ schemas.
              </WhyCard>
            </FadeIn>
            <FadeIn delay={0.2}>
              <WhyCard icon={Terminal} title="Prisma-like SDK">
                Install the SDK, point at your project, and generated types appear in your imports automatically. The
                CLI watches for live updates and regenerates on the fly.
              </WhyCard>
            </FadeIn>
            <FadeIn delay={0.25}>
              <WhyCard icon={Puzzle} title="Plugin-based generators">
                11 built-in generators. Need a custom target? Register a plugin with lifecycle hooks and the full
                CodeGenerator API. No forking the tool.
              </WhyCard>
            </FadeIn>
            <FadeIn delay={0.3}>
              <WhyCard icon={FolderGit2} title="Git as source of truth">
                Published versions are committed to a real git repo via ephemeral K8s worker pods. The commit hash
                becomes the immutable identifier. Audit by reading git log.
              </WhyCard>
            </FadeIn>
          </SimpleGrid>
        </Box>
      </FadeIn>

      {/* COMPARISON MATRIX */}
      <FadeIn>
        <Box>
          <Heading size="md" mb="0.5rem">
            How it compares
          </Heading>
          <Text fontSize="sm" opacity={0.6} mb="2rem">
            AkashiContracts vs. common schema and contract tools.
          </Text>

          <Box
            borderRadius="xl"
            borderWidth="1px"
            borderColor="brand.surfaceDarker"
            overflow="hidden"
            boxShadow="0 0 40px rgba(77, 166, 239, 0.06)"
          >
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row bg="brand.surfaceDarker">
                  <Table.ColumnHeader
                    py="0.8rem"
                    px="1rem"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="brand.color"
                    opacity={0.6}
                    minW="180px"
                  >
                    Feature
                  </Table.ColumnHeader>
                  {tools.map((t) => (
                    <Table.ColumnHeader
                      key={t.key}
                      py="0.8rem"
                      px="0.6rem"
                      fontSize="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      textAlign="center"
                      color={t.key === "akc" ? "brand.highlight" : "brand.color"}
                      opacity={t.key === "akc" ? 1 : 0.6}
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
                    <Table.Cell py="0.65rem" px="1rem" fontSize="sm">
                      {f.name}
                    </Table.Cell>
                    {tools.map((t) => (
                      <Table.Cell
                        key={t.key}
                        py="0.65rem"
                        px="0.6rem"
                        textAlign="center"
                        bg={t.key === "akc" ? "rgba(77, 166, 239, 0.04)" : undefined}
                      >
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

          <Flex gap="1.5rem" mt="1rem" fontSize="xs" opacity={0.5} justify="center">
            <Flex align="center" gap="0.3rem">
              <Check size={12} color="#22c55e" strokeWidth={2.5} /> Full support
            </Flex>
            <Flex align="center" gap="0.3rem">
              <Minus size={12} color="#737373" strokeWidth={2.5} /> Partial
            </Flex>
            <Flex align="center" gap="0.3rem">
              <X size={12} color="#ef4444" strokeWidth={2.5} /> Not supported
            </Flex>
          </Flex>
        </Box>
      </FadeIn>

      {/* DEMO VIDEO */}
      <FadeIn>
        <Box id="demo">
          <Heading size="md" mb="1.5rem">
            See it in action
          </Heading>
          <Box
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="brand.surfaceDarker"
            boxShadow="0 4px 40px rgba(77, 166, 239, 0.08)"
            bg="black"
          >
            <video
              src={`${import.meta.env.BASE_URL}marketing/demo.mp4`}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", display: "block" }}
            />
          </Box>
        </Box>
      </FadeIn>

      {/* SCREENSHOTS */}
      <FadeIn>
        <Box>
          <Heading size="md" mb="1.5rem">
            Editor views
          </Heading>
          <Carousel.Root slideCount={carouselImages.length} mx="auto" gap="4" position="relative" colorPalette="white">
            <Carousel.Control gap="4" width="full" position="relative">
              <Carousel.PrevTrigger asChild>
                <IconButton bgColor="brand.surface">
                  <ArrowLeft />
                </IconButton>
              </Carousel.PrevTrigger>
              <Carousel.ItemGroup width="full">
                {carouselImages.map((src, index) => (
                  <Carousel.Item key={index} index={index}>
                    <Image src={src} alt={`Product ${index + 1}`} bgColor="brand.surface" />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>
              <Carousel.NextTrigger asChild>
                <IconButton bgColor="brand.surface">
                  <ArrowRight />
                </IconButton>
              </Carousel.NextTrigger>
              <Box position="absolute" bottom="-1rem" width="full">
                <Carousel.Indicators
                  transition="width 0.2s ease-in-out"
                  transformOrigin="center"
                  opacity="0.5"
                  boxSize="2"
                  _current={{ width: "10", bg: "colorPalette.subtle", opacity: 1 }}
                />
              </Box>
            </Carousel.Control>
          </Carousel.Root>
        </Box>
      </FadeIn>

      {/* FOOTER */}
      <Box as="footer" pt="3rem" mt="auto" borderColor="brand.surfaceDarker">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap="1.5rem"
        >
          <Box>
            <Text fontWeight="semibold" mb="0.25rem">
              Contact
            </Text>
            <Text fontSize="sm" opacity={0.8}>
              do-not-reply@akashicontract.dev
            </Text>
          </Box>
          <Flex gap="2rem" fontSize="sm" align="center">
            <Link
              href="https://forms.gle/RCCcYmy9SRqtV3n46"
              opacity={0.8}
              _hover={{ opacity: 1 }}
              color="brand.highlight"
            >
              How did you hear about us?
            </Link>
            <Text opacity={0.6}>© {new Date().getFullYear()} AkashiContracts</Text>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
