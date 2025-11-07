import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function Home() {
  const courses = [
    { id: 'engcomp', name: 'Engenharia de Computação' },
    { id: 'matematica', name: 'Matemática' },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-grid-slate-100 dark:bg-grid-slate-900">
      <div className="text-center space-y-4 mb-12 max-w-3xl">
        <div className="inline-block bg-primary/20 text-primary-foreground p-3 rounded-lg">
           <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter font-headline bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-200 dark:to-slate-400">
          Bem-vindo ao GradeWise
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          O seu assistente inteligente para planejamento de grade acadêmica. Gere sugestões de horários, visualize sua grade e simplifique sua vida universitária.
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comece a Planejar</CardTitle>
            <CardDescription>Selecione seu curso para começar a montar sua grade ideal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course) => (
              <Button asChild key={course.id} variant="secondary" className="w-full justify-between h-14 text-lg">
                <Link href={`/${course.id}`}>
                  {course.name}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
