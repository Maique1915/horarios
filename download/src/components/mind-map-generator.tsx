"use client";

import { useState, useTransition } from "react";
import {
  generateMindMapAction,
  suggestSubtopicsAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { MindMapNode } from "@/types";
import { BrainCircuit, Loader, Wand2 } from "lucide-react";
import MindMapVisualization from "./mind-map-visualization";

const exampleText = `Fundamentos da Álgebra Relacional
  Introdução e Fundamentos
    O que é Álgebra Relacional
    Modelo Relacional
    Relações, Tuplas, Atributos
  Operações Fundamentais (6 Básicas)
    Seleção (σ)
    Projeção (π)
    União (∪)
    Diferença (-)
    Produto Cartesiano (×)
    Renomeação (ρ)
  Outras Operações/Conceitos
    Junção (⨝)
      Junção Natural
      Theta-Junção
    Divisão (÷)
    Agregação
`;

export default function MindMapGenerator() {
  const [text, setText] = useState(exampleText);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isSuggesting, startSuggesting] = useTransition();
  const { toast } = useToast();

  const handleGenerateMap = () => {
    startGenerating(async () => {
      setMindMap(null); 
      try {
        const result = await generateMindMapAction(text);
        if (result) {
          setMindMap(result);
        } else {
          toast({
            variant: "destructive",
            title: "Failed to generate mind map",
            description: "The AI could not process your text. Please try again.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Something went wrong. Please check the console for details.",
        });
        console.error(error);
      }
    });
  };
  
  const findNodeById = (node: MindMapNode, id: string): MindMapNode | null => {
      if (node.id === id) return node;
      for (const child of node.children) {
          const found = findNodeById(child, id);
          if (found) return found;
      }
      return null;
  };
  
  const handleToggleCollapse = (nodeId: string) => {
    setMindMap((currentMap) => {
      if (!currentMap) return null;
      const newMap = JSON.parse(JSON.stringify(currentMap));
      const node = findNodeById(newMap, nodeId);
      if (node) {
        node.isCollapsed = !node.isCollapsed;
      }
      return newMap;
    });
  };

  const handleAddSubtopics = (nodeId: string) => {
    startSuggesting(async () => {
      try {
        const nodeToUpdate = findNodeById(mindMap!, nodeId);
        if (!nodeToUpdate) return;
        
        const suggestions = await suggestSubtopicsAction(nodeToUpdate.name);
        
        if (suggestions.length === 0) {
            toast({ title: "No new suggestions", description: `AI couldn't find new subtopics for "${nodeToUpdate.name}".`});
            return;
        }

        setMindMap(currentMap => {
            if (!currentMap) return null;
            const newMap = JSON.parse(JSON.stringify(currentMap));
            const node = findNodeById(newMap, nodeId);
            
            if (node) {
                const existingChildrenNames = new Set(node.children.map(c => c.name));
                const newChildren: MindMapNode[] = suggestions
                    .filter(suggestion => !existingChildrenNames.has(suggestion))
                    .map((suggestion, index) => ({
                        id: `suggestion-${nodeId}-${Date.now()}-${index}`,
                        name: suggestion,
                        children: [],
                        depth: node.depth + 1,
                        x: 0, y: 0, width: 0, height: 0,
                    }));
                
                if (newChildren.length === 0) {
                    toast({ title: "No new suggestions", description: "All AI suggestions are already in the map."});
                    return currentMap;
                }

                node.children.push(...newChildren);
                if (node.isCollapsed) {
                    node.isCollapsed = false;
                }
            }
            return newMap;
        });

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to get suggestions",
          description: "Could not fetch AI suggestions. Please try again.",
        });
        console.error(error);
      }
    });
  };


  return (
    <div className="grid md:grid-cols-[380px_1fr] h-[calc(100vh-3.5rem)]">
      <div className="p-4 border-r bg-background overflow-y-auto">
        <Card className="shadow-none border-0 md:border md:shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BrainCircuit className="mr-2" />
              Your Topics
            </CardTitle>
            <CardDescription>
              Enter topics below, using indentation for sub-topics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={15}
              placeholder="e.g.&#10;Main Topic&#10;  Sub Topic 1&#10;  Sub Topic 2"
              className="font-mono text-sm"
              disabled={isGenerating}
            />
            <Button onClick={handleGenerateMap} disabled={isGenerating}>
              {isGenerating ? (
                <Loader className="animate-spin mr-2" />
              ) : (
                <Wand2 className="mr-2" />
              )}
              Generate Mind Map
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="bg-muted/20 relative h-full">
        {(isGenerating || isSuggesting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader className="w-12 h-12 animate-spin text-primary" />
          </div>
        )}
        {mindMap ? (
            <MindMapVisualization 
              mindMapData={mindMap}
              onToggleCollapse={handleToggleCollapse}
              onAddSubtopics={handleAddSubtopics}
            />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Wand2 size={48} className="text-muted-foreground mb-4"/>
            <h2 className="text-2xl font-semibold">Visualize Your Ideas</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Enter your list of topics on the left and click 'Generate Mind Map' to see your ideas come to life as an interactive diagram.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
