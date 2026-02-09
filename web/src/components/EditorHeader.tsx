import { PlusIcon } from "lucide-react";
import { Box } from "@chakra-ui/react/box";
import { Flex } from "@chakra-ui/react/flex";
import { Text } from "@chakra-ui/react/text";
import { Button } from "@chakra-ui/react/button";

export default function EditorHeader(props: {
  title: string;
  subtitle: string;
  button?: {
    buttonText: string;
    onButtonClick: () => void;
  };
}) {
  return (
    <Flex w="100%" wrap="wrap">
      <Box>
        <Text fontSize="xl" fontWeight="450">
          {props.title}
        </Text>
        <Text fontWeight="400" opacity=".7">
          {props.subtitle}
        </Text>
      </Box>
      {!!props.button && (
        <Button my="auto" bg="brand.highlight" ml="auto" onClick={props.button.onButtonClick}>
          <PlusIcon />
          {props.button.buttonText}
        </Button>
      )}
    </Flex>
  );
}
