import MindMapGenerator from "@/components/mind-map-generator";
import { BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-screen-2xl">
          <div className="mr-4 flex items-center">
            <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold">MindMapperAI</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <MindMapGenerator />
      </main>
    </div>
  );
}
