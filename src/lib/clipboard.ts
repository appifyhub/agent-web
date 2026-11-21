export const copyText = async (text: string): Promise<boolean> => {
  try {
    if (
      window.navigator &&
      window.navigator.clipboard &&
      window.navigator.clipboard.writeText
    ) {
      await window.navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-999999px";
    document.body.appendChild(textarea);
    try {
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      if (!document.execCommand("copy")) {
        throw new Error("execCommand('copy') failed");
      }
      return true;
    } finally {
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error("Failed to copy", err);
    return false;
  }
};
