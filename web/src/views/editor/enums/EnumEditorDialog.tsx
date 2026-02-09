import { ACREnum } from "@akc/parser/elements/ElementsCommon";
import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Portal } from "@chakra-ui/react/portal";
import { Text } from "@chakra-ui/react/text";

interface EnumEditorDialogProps {
  close: () => void;
  enum?: ACREnum;
}

export default function EnumEditorDialog(props: EnumEditorDialogProps) {
  if (!props.enum) return;
  function addChanges() {}
  return (
    <Dialog.Root open={!!props.enum} onOpenChange={props.close} size="md" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="brand.bg" color="brand.color">
            <Dialog.CloseTrigger asChild>
              <CloseButton
                onClick={props.close}
                bg="transparent"
                _hover={{ bg: "brand.surfaceLighter" }}
                color="inherit"
              />
            </Dialog.CloseTrigger>
            <Dialog.Header display="flex" flexWrap="wrap">
              <Dialog.Title w="100%"> Edit Schema: Fruit </Dialog.Title>
              <Text>Potato</Text>
            </Dialog.Header>
            <Dialog.Body>My Head</Dialog.Body>
            <Dialog.Footer>
              <Button bg="brand.highlight">Save</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
