import { type MindMapNode } from "@/types";

function getIndentation(line: string): number {
  return line.match(/^\s*/)?.[0].length || 0;
}

let idCounter = 0;
const generateId = () => `node-${Date.now()}-${idCounter++}`;

export function parseMindMapText(text: string): MindMapNode | null {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return null;
  }

  const rootNode: MindMapNode = {
    id: generateId(),
    name: lines[0].trim(),
    children: [],
    depth: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  const stack: { node: MindMapNode; indent: number }[] = [
    { node: rootNode, indent: getIndentation(lines[0]) },
  ];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = getIndentation(line);
    const name = line.trim();

    if (!name) continue;

    const newNode: MindMapNode = {
      id: generateId(),
      name,
      children: [],
      depth: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    if (stack.length > 0) {
      const parent = stack[stack.length - 1].node;
      parent.children.push(newNode);
      newNode.depth = parent.depth + 1;
    }

    stack.push({ node: newNode, indent });
  }

  return rootNode;
}
