import { Box } from "@chakra-ui/react/box";
import { Flex } from "@chakra-ui/react/flex";
import { Stack } from "@chakra-ui/react/stack";
import { Text } from "@chakra-ui/react/text";

export default function MaintenanceView() {
  return (
    <Flex w="100vw" h="100vh" justifyContent="center" alignContent="center">
      <Box width="100%" height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box p="2rem" width="100%" maxWidth="350px" boxShadow="md" borderRadius="md" bg="background.surface">
          <Stack align="center" w="100%">
            <Stack textAlign="center" w="100%">
              <Text fontSize="xl">Site is under maintenance</Text>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
}
