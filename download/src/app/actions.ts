"use server";

import { generateMindMapStructure } from "@/ai/flows/generate-mind-map-structure";
import { suggestRelatedSubtopics } from "@/ai/flows/suggest-related-subtopics";
import { parseMindMapText } from "@/lib/mindmap-parser";
import { type MindMapNode } from "@/types";

const fallbackMindMap = `
MindMapperAI
  Core Features
    List Input
    AI-Powered Structuring
    Mind Map Visualization
    Dynamic Layout
    Mind Map Expansion
  Styling
    Colors
      Primary: Dark Slate Blue
      Background: Light Gray
      Accent: Soft Lavender
    Typography
      Font: Inter
`;

export async function generateMindMapAction(
  text: string
): Promise<MindMapNode | null> {
  try {
    if (!text.trim()) {
      return parseMindMapText(fallbackMindMap);
    }
    const result = await generateMindMapStructure({ text });
    if (!result.mindMapStructure) {
      throw new Error("AI did not return a mind map structure.");
    }
    return parseMindMapText(result.mindMapStructure);
  } catch (error) {
    console.error("Error generating mind map:", error);
    return parseMindMapText(fallbackMindMap);
  }
}

export async function suggestSubtopicsAction(
  topic: string
): Promise<string[]> {
  try {
    const result = await suggestRelatedSubtopics({ topics: [topic] });
    return result.suggestions[topic] || [];
  } catch (error) {
    console.error("Error suggesting subtopics:", error);
    return [];
  }
}
