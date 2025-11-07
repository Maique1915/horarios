"use client";

import { useState, useMemo, useEffect } from "react";
import { useFlow } from "@genkit-ai/next/client";
import type { GenerateScheduleSuggestionsInput, GenerateScheduleSuggestionsOutput } from "@/ai/flows/generate-schedule-suggestions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Loader2, Wand2 } from "lucide-react";
import { getCourse, getDisciplines } from "@/lib/api";
import type { Curso, Disciplina } from "@/types";
import { ScheduleTable } from "./_components/schedule-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type StepProps = {
  disciplines: Disciplina[];
  course: Curso;
  completedCourses: string[];
  setCompletedCourses: (value: string[]) => void;
  coursesToAvoid: string[];
  setCoursesToAvoid: (value: string[]) => void;
  setStep: (step: number) => void;
  triggerGeneration: () => void;
  suggestedSchedules: GenerateScheduleSuggestionsOutput | undefined;
  generationError: any;
  generationInProgress: boolean;
};

const getCredits = (discipline: { _at: number; _ap: number; }) => discipline._at + discipline._ap;

function Step1({ disciplines, setStep, completedCourses, setCompletedCourses }: StepProps) {
  const activeDisciplines = disciplines.filter(d => d._ag);
  const semesters = [...new Set(activeDisciplines.map((d) => d._se))].sort((a, b) => a - b);
  const totalCredits = completedCourses.reduce((acc, code) => {
    const disc = disciplines.find(d => d._re === code);
    return acc + (disc ? getCredits(disc) : 0);
  }, 0);

  const handleToggle = (code: string) => {
    setCompletedCourses(
      completedCourses.includes(code)
        ? completedCourses.filter((c) => c !== code)
        : [...completedCourses, code]
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passo 1: Matérias Cursadas</CardTitle>
        <CardDescription>Marque todas as matérias que você já concluiu. Isso nos ajuda a entender seu progresso.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((semester) => (
            <div key={semester}>
              <h3 className="font-semibold mb-3">{semester === 0 ? "Eletivas" : `${semester}° Período`}</h3>
              <div className="space-y-2">
                {activeDisciplines.filter(d => d._se === semester).map(d => (
                  <div key={d._id} className="flex items-center space-x-2">
                    <Checkbox id={d._re} checked={completedCourses.includes(d._re)} onCheckedChange={() => handleToggle(d._re)} />
                    <Label htmlFor={d._re} className="cursor-pointer">{d._di} ({d._re})</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p><strong>{completedCourses.length}</strong> matérias selecionadas</p>
            <p><strong>{totalCredits}</strong> créditos totais</p>
          </div>
          <Button onClick={() => setStep(2)}>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step2({ disciplines, setStep, completedCourses, coursesToAvoid, setCoursesToAvoid, triggerGeneration }: StepProps) {
  const availableDisciplines = disciplines.filter(d => d._ag && !completedCourses.includes(d._re));
  
  const handleToggle = (code: string) => {
    setCoursesToAvoid(
      coursesToAvoid.includes(code)
        ? coursesToAvoid.filter((c) => c !== code)
        : [...coursesToAvoid, code]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passo 2: Matérias a Evitar</CardTitle>
        <CardDescription>Marque as matérias que você **não** quer cursar neste semestre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDisciplines.map(d => (
              <div key={d._id} className="flex items-center space-x-2">
                <Checkbox id={`avoid-${d._re}`} checked={coursesToAvoid.includes(d._re)} onCheckedChange={() => handleToggle(d._re)} />
                <Label htmlFor={`avoid-${d._re}`} className="cursor-pointer">{d._di} ({d._re})</Label>
              </div>
            ))}
         </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button onClick={triggerGeneration}>
            <Wand2 className="mr-2 h-4 w-4" /> Gerar Grades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step3({ setStep, suggestedSchedules, generationError, generationInProgress, disciplines, course }: StepProps) {
  const schedulesWithDetails = useMemo(() => {
    if (!suggestedSchedules) return [];
    return suggestedSchedules.map(schedule => 
      schedule.courseCodes
        .map(code => disciplines.find(d => d._re === code))
        .filter((d): d is Disciplina => d !== undefined)
    );
  }, [suggestedSchedules, disciplines]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passo 3: Grades Sugeridas</CardTitle>
        <CardDescription>Encontramos algumas opções para você. Analise e veja qual se encaixa melhor!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {generationInProgress && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-xl font-semibold">Gerando suas grades...</h3>
              <p className="text-muted-foreground">Nossa IA está montando as melhores combinações. Isso pode levar um momento.</p>
            </div>
        )}
        {generationError && (
          <Alert variant="destructive">
            <AlertTitle>Ocorreu um Erro</AlertTitle>
            <AlertDescription>Não foi possível gerar as grades. Por favor, tente novamente. Detalhe: {generationError.message}</AlertDescription>
          </Alert>
        )}
        {!generationInProgress && !generationError && suggestedSchedules && (
           <>
             {schedulesWithDetails.length === 0 ? (
                <Alert>
                  <AlertTitle>Nenhuma grade encontrada</AlertTitle>
                  <AlertDescription>Não foi possível encontrar uma combinação de horários com os critérios selecionados. Tente evitar menos matérias.</AlertDescription>
                </Alert>
             ) : (
                <div className="space-y-8">
                  {schedulesWithDetails.map((schedule, index) => (
                    <div key={index}>
                      <h3 className="font-bold text-xl mb-4">Sugestão de Grade #{index + 1}</h3>
                      <ScheduleTable course={course} schedule={schedule} />
                    </div>
                  ))}
                </div>
             )}
           </>
        )}
        <div className="flex justify-start items-center pt-4 border-t">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GeneratorPage({ params }: { params: { curso: string } }) {
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<Curso | null>(null);
  const [disciplines, setDisciplines] = useState<Disciplina[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [coursesToAvoid, setCoursesToAvoid] = useState<string[]>([]);

  const [generateSuggestions, suggestedSchedules, generationError, generationInProgress] = useFlow<
    typeof GenerateScheduleSuggestionsInput,
    typeof GenerateScheduleSuggestionsOutput
  >("/generateScheduleSuggestions");


  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const courseData = await getCourse(params.curso);
      const disciplinesData = await getDisciplines(params.curso);
      setCourse(courseData || null);
      setDisciplines(disciplinesData);
      setIsLoading(false);
    }
    loadData();
  }, [params.curso]);

  const triggerGeneration = () => {
    if (!course) return;
    setStep(3);

    const allCoursesForAI = disciplines.map(d => ({
        _re: d._re,
        _di: d._di,
        _se: d._se,
        _pr: d._pr,
        _ho: d._ho,
        _da: d._da,
        _cu: d._cu,
    }));

    generateSuggestions({
      completedCourses,
      coursesToAvoid,
      allCourses: allCoursesForAI,
      targetNumberOfSchedules: 10, // Requesting fewer to speed up
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!course) {
    return <div>Curso não encontrado.</div>;
  }
  
  const props: StepProps = {
    disciplines,
    course,
    completedCourses,
    setCompletedCourses,
    coursesToAvoid,
    setCoursesToAvoid,
    setStep,
    triggerGeneration,
    suggestedSchedules,
    generationError,
    generationInProgress,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gerador de Grade</h1>
        <p className="text-muted-foreground">
          Siga os passos para criar sugestões de grade para seu próximo semestre.
        </p>
      </div>
      {step === 1 && <Step1 {...props} />}
      {step === 2 && <Step2 {...props} />}
      {step === 3 && <Step3 {...props} />}
    </div>
  );
}
