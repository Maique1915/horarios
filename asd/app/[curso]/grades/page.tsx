import { getDisciplines } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star } from "lucide-react";

export default async function GradesPage({
  params,
}: {
  params: { curso: string };
}) {
  const disciplines = await getDisciplines(params.curso);
  const activeDisciplines = disciplines.filter(d => d._ag);

  const semesters = [...new Set(activeDisciplines.filter(d => !d._el).map((d) => d._se))].sort(
    (a, b) => a - b
  );
  
  const electives = activeDisciplines.filter(d => d._el);

  const getCredits = (discipline: { _at: number; _ap: number; }) => discipline._at + discipline._ap;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Grade Curricular</h1>
        <p className="text-muted-foreground">
          Visualize a grade curricular completa do curso.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {semesters.map((semester) => (
          <Card key={semester} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>{semester}° Período</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {activeDisciplines
                .filter((d) => d._se === semester && !d._el)
                .map((d) => (
                  <div key={d._id} className="p-3 bg-muted/50 rounded-md">
                    <p className="font-semibold">{d._di}</p>
                    <p className="text-sm text-muted-foreground">{d._re}</p>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                       <span>{getCredits(d)} créditos</span>
                       {d._pr.length > 0 && <span>{d._pr.length} pré-req.</span>}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}

        {electives.length > 0 && (
          <Card className="flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-1 border-dashed border-accent">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2"><Star className="w-5 h-5"/>Eletivas</CardTitle>
              <CardDescription>Disciplinas opcionais para complementar sua formação.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {electives.map((d) => (
                <div key={d._id} className="p-3 bg-muted/50 rounded-md">
                  <p className="font-semibold">{d._di}</p>
                  <p className="text-sm text-muted-foreground">{d._re}</p>
                   <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                       <span>{getCredits(d)} créditos</span>
                       {d._pr.length > 0 && <span>{d._pr.length} pré-req.</span>}
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
