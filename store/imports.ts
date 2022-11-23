import { defineStore } from "pinia";

export const useImportStore = defineStore("imports", () => {
  const imported = shallowReactive({
    monaco: null as typeof import("monaco-editor") | null,
  });

  const useMonaco = async () => {
    if (!imported.monaco) {
      const { default: loader } = await import("@monaco-editor/loader");
      const monaco = await loader.init();
      imported["monaco"] = monaco;

      const colorMode = useColorMode();

      const setEditorColorMode = () => {
        if (colorMode.value == "light") {
          monaco.editor.setTheme("vs");
        } else if (colorMode.value == "dark") {
          monaco.editor.setTheme("vs-dark");
        }
      };

      setEditorColorMode();
      watch(colorMode, setEditorColorMode);
    }
    return imported["monaco"];
  };

  return {
    imported,
    useMonaco,
  };
});
