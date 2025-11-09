import { type MindMapNode } from "@/types";

const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 120;
export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 72;

function layout(node: MindMapNode) {
    node.width = NODE_WIDTH;
    node.height = NODE_HEIGHT;
    node.x = node.depth * HORIZONTAL_SPACING;
    
    if (node.children && !node.isCollapsed) {
        const totalHeight = node.children.length * VERTICAL_SPACING;
        let startY = node.y - totalHeight / 2 + VERTICAL_SPACING / 2;

        node.children.forEach(child => {
            child.y = startY;
            startY += VERTICAL_SPACING;
            layout(child);
        });
    }
}

export function calculateTreeLayout(root: MindMapNode): MindMapNode {
    const layoutRoot = JSON.parse(JSON.stringify(root)) as MindMapNode;

    function traverse(node: MindMapNode, depth = 0) {
        node.depth = depth;
        node.children.forEach(child => traverse(child, depth + 1));
    }
    
    traverse(layoutRoot);
    layoutRoot.y = 0;
    layout(layoutRoot);

    return layoutRoot;
}

export function flattenTree(root: MindMapNode): { nodes: MindMapNode[], links: { source: MindMapNode, target: MindMapNode }[] } {
    const nodes: MindMapNode[] = [];
    const links: { source: MindMapNode, target: MindMapNode }[] = [];

    function recurse(node: MindMapNode, parent?: MindMapNode) {
        nodes.push(node);
        if (parent) {
            links.push({ source: parent, target: node });
        }
        if (node.children && !node.isCollapsed) {
            node.children.forEach(child => recurse(child, node));
        }
    }

    recurse(root);
    return { nodes, links };
}
