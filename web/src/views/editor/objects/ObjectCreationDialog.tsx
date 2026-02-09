import { Button, CloseButton } from "@chakra-ui/react/button";
import { Dialog } from "@chakra-ui/react/dialog";
import { Field } from "@chakra-ui/react/field";
import { Portal } from "@chakra-ui/react/portal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as y from "yup";
import { VStack } from "@chakra-ui/react/stack";
import { Input } from "@chakra-ui/react/input";
import { useDraftContext } from "@akc/ui/ctx/DraftContext";
import { vinRegex } from "@akc/parser/ParserCommon";
import { ACRefVinPrefix, ACRObject } from "@akc/parser/elements/ElementsCommon";
import { ACRecordKind } from "@akc/parser/collection/CollectionCommon";
import { ACDeltaOperation } from "@akc/parser/deltas/DeltaCommon";
import { ElementCodecs } from "@akc/parser/elements/ElementCodecs";

interface ObjectCreationDialogProps {
  open: boolean;
  toggle: () => void;
}

const yupSchema = y.object({
  vin: y.string().required("Variable Name required!").matches(vinRegex),
});

type FormData = y.InferType<typeof yupSchema>;
const elementCodecs = new ElementCodecs();

export default function ObjectCreationDialog(props: ObjectCreationDialogProps) {
  const { upsertDelta } = useDraftContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: yupResolver(yupSchema), defaultValues: { vin: "MyObject" } });
  async function onSubmit(values: FormData) {
    // Attach details
    const data: ACRObject = {
      vin: `${ACRefVinPrefix.object}${values.vin}`,
      children: [],
    };
    await upsertDelta({
      target: data.vin,
      kind: ACRecordKind.OBJ,
      op: ACDeltaOperation.SET,
      payload: elementCodecs.encodeObject(data),
    });
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
                <Dialog.Title w="100%"> Create New Object </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap="1rem">
                  <Field.Root invalid={!!errors.vin}>
                    <Field.Label> Object VIN</Field.Label>
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
                <Button bg="brand.highlight" type="submit">
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
