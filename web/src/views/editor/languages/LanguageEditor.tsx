import EditorHeader from "@akc/ui/components/EditorHeader";

export default function LanguageEditor() {
  return (
    <EditorHeader
      title="API Localization"
      subtitle="Design and manage your API localization"
      button={{ buttonText: "New Language", onButtonClick: () => {} }}
    />
  );
}
