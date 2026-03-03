import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Field } from "@chakra-ui/react/field";
import { Portal } from "@chakra-ui/react/portal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as y from "yup";
import { VStack } from "@chakra-ui/react/stack";
import { Input } from "@chakra-ui/react/input";
import { vinRegex } from "@akc/parser/ParserCommon";
import { useCollectionContext } from "@akc/ui/ctx/CollectionContext";

interface EnumCreationDialogProps {
  open: boolean;
  toggle: () => void;
}

const yupSchema = y.object({
  vin: y.string().required("Variable name required!").matches(vinRegex),
});

type FormData = y.InferType<typeof yupSchema>;

export default function EnumCreationDialog(props: EnumCreationDialogProps) {
  const { refresh } = useCollectionContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(yupSchema), defaultValues: { vin: "MyEnum" } });

  async function onSubmit(values: FormData) {
    try {
      await fetch("/api/contracts/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.vin, attributes: {} }),
      });
      await refresh();
    } catch (err) {
      console.error("Failed to create enum:", err);
    }
    props.toggle();
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={props.toggle} size="md" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="brand.bg" color="brand.color">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.CloseTrigger asChild>
                <CloseButton onClick={props.toggle} _hover={{ bg: "brand.surfaceLighter" }} color="inherit" />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title w="100%">Create New Object</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap="1rem">
                  <Field.Root invalid={!!errors.vin}>
                    <Field.Label>Object Name</Field.Label>
                    <Input
                      {...register("vin")}
                      type="text"
                      variant="subtle"
                      focusRingColor="brand.highlight"
                      placeholder="e.g., UserStatus, OrderType"
                      bg="brand.surfaceDarker"
                      multiple
                    />
                    <Field.ErrorText>{errors.vin?.message}</Field.ErrorText>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  bg="brand.highlight"
                  color="brand.highlightText"
                  _hover={{ bg: "brand.highlight", opacity: 0.85 }}
                  type="submit"
                  loading={isSubmitting}
                >
                  Create
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
