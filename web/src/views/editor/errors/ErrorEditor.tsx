import EditorHeader from "@akc/ui/components/EditorHeader";

export default function ErrorEditor() {
  return (
    <EditorHeader
      title="API Errors"
      subtitle="Design and manage your API errors"
      button={{ buttonText: "New Error", onButtonClick: () => {} }}
    />
  );
}
