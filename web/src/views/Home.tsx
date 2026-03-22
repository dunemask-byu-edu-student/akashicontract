import { Box, Flex, Image, Text, Heading, SimpleGrid, Badge, List, Carousel, Link, IconButton } from "@chakra-ui/react";
import { Layers, RefreshCcw, GitMerge, Globe, Zap, ArrowLeft, ArrowRight, LucideIcon, Play } from "lucide-react";
import { ReactNode } from "react";

const carouselImages = [
  `${import.meta.env.BASE_URL}marketing/demo/Enums.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Errors.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Exports.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Locales.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Objects.png`,
  `${import.meta.env.BASE_URL}marketing/demo/Roles.png`,
];

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
            AkashiContract keeps your data structures versioned, language-agnostic, and instantly synced across every
            repository.
          </Text>

          <Flex gap="1.5rem" mt="1.5rem">
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

          <Link
            href="https://drive.google.com/file/d/1YUvENH3aL9M9hgdqGw1pmV2ErLH_1PN6/view?usp=sharing"
            display="inline-flex"
            alignItems="center"
            gap="0.5rem"
            mt="1rem"
            fontSize="sm"
            px="1.25rem"
            py="0.6rem"
            borderRadius="md"
            bg="brand.highlight"
            color="white"
            fontWeight="semibold"
            _hover={{ opacity: 0.9 }}
          >
            <Play size={16} />
            Watch the demo
          </Link>
        </Box>
      </Flex>
      {/* FEEDBACK CTA */}
      <Box
        bg="brand.surface"
        borderRadius="xl"
        p={{ base: "1.5rem", md: "2rem" }}
        borderWidth="1px"
        borderColor="brand.surfaceDarker"
        textAlign="center"
      >
        <Heading size="sm" mb="0.5rem">
          We’d love your feedback
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

      {/* PROBLEM */}
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
            Schemas aren’t truly language agnostic, forcing custom tooling per stack.
          </FeatureCard>

          <FeatureCard icon={Layers} title="Versioning chaos">
            Inconsistent versioning leads to broken APIs and slow merges.
          </FeatureCard>
        </SimpleGrid>
      </Box>

      {/* SOLUTION */}
      <Box bg="brand.surface" borderRadius="2xl" p="2.5rem">
        <Heading size="md" mb="1rem">
          The AkashiContract approach
        </Heading>

        <List.Root gap="0.75rem">
          <List.Item>Edit generic data structures once</List.Item>
          <List.Item>Automatically generate language-agnostic contracts</List.Item>
          <List.Item>Subscribers receive updates immediately, versioned and validated</List.Item>
        </List.Root>
      </Box>

      {/* CAROUSEL */}
      <Box>
        <Heading size="md" mb="1.5rem">
          See it in action
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

          <Flex gap="2rem" fontSize="sm">
            <Link
              href="https://forms.gle/RCCcYmy9SRqtV3n46"
              opacity={0.8}
              _hover={{ opacity: 1 }}
              color="brand.highlight"
            >
              How did you hear about us?
            </Link>

            <Text opacity={0.6}>© {new Date().getFullYear()} AkashiContract</Text>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
