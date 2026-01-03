// XMTP: Stub editor suggestions
// These are placeholder implementations and not currently used

export interface UISuggestion {
  selectionStart: number;
  selectionEnd: number;
  [key: string]: any;
}

export function projectWithPositions(
  _doc: any,
  suggestions: any[]
): UISuggestion[] {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    selectionStart: 0,
    selectionEnd: 0,
  }));
}

export const suggestionsPluginKey = { key: "suggestions" };

export const suggestionsPlugin = {
  key: suggestionsPluginKey,
};

export function getEditorSuggestions(): UISuggestion[] {
  return [];
}

