const DEFAULT_FORM_DATA_KEY = "dynamic_form_data";

export function saveFormData(data: Record<string, string>, key?: string): void {
  try {
    const storageKey = key || DEFAULT_FORM_DATA_KEY;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving form data to localStorage:", error);
  }
}

export function getFormData(key?: string): Record<string, string> {
  try {
    const storageKey = key || DEFAULT_FORM_DATA_KEY;
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Record<string, string>) : {};
  } catch (error) {
    console.error("Error reading form data from localStorage:", error);
    return {};
  }
}

export function clearFormData(key?: string): void {
  try {
    const storageKey = key || DEFAULT_FORM_DATA_KEY;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Error clearing form data from localStorage:", error);
  }
}
