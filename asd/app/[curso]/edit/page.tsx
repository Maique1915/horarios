"use client";

import { useEffect, useState, useMemo } from "react";
import type { Curso, Disciplina } from "@/types";
import { getCourse, getDisciplines } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Wrench } from "lucide-react";
import { DisciplineForm } from "../_components/discipline-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPage({ params }: { params: { curso: string } }) {
  const [course, setCourse] = useState<Curso | null>(null);
  const [disciplines, setDisciplines] = useState<Disciplina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Disciplina | null>(null);

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

  const semesters = useMemo(() => {
    return [...new Set(disciplines.map(d => d._se))].sort((a, b) => a - b);
  }, [disciplines]);

  const handleEdit = (discipline: Disciplina) => {
    setSelectedDiscipline(discipline);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedDiscipline(null);
    setIsFormOpen(true);
  };
  
  const handleFormSave = (data: Disciplina) => {
    if(selectedDiscipline) {
        setDisciplines(disciplines.map(d => d._id === data._id ? data : d));
    } else {
        setDisciplines([...disciplines, { ...data, _id: (disciplines.length + 1).toString() }]);
    }
    setIsFormOpen(false);
  }

  const handleFormDelete = (id: string) => {
    setDisciplines(disciplines.filter(d => d._id !== id));
    setIsFormOpen(false);
  }

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(disciplines, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${params.curso}_disciplinas.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return <div>Curso não encontrado.</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><Wrench className="w-7 h-7" />Editor de Grade</h1>
            <p className="text-muted-foreground">
            Gerencie as disciplinas do curso.
            </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4"/> Adicionar Nova</Button>
            <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Salvar JSON</Button>
        </div>
      </div>

      <Tabs defaultValue={semesters[0]?.toString() || "0"} className="w-full">
        <TabsList>
          {semesters.map(s => (
            <TabsTrigger key={s} value={s.toString()}>{s === 0 ? "Eletivas" : `${s}° Período`}</TabsTrigger>
          ))}
        </TabsList>
        {semesters.map(s => (
          <TabsContent key={s} value={s.toString()}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplines.filter(d => d._se === s).map(d => (
                  <TableRow key={d._id}>
                    <TableCell className="font-medium">{d._di}</TableCell>
                    <TableCell>{d._re}</TableCell>
                    <TableCell>{d._at + d._ap}</TableCell>
                    <TableCell>{d._ag ? "Sim" : "Não"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}>Editar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
      
      {isFormOpen && (
        <DisciplineForm 
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            discipline={selectedDiscipline}
            allDisciplines={disciplines}
            course={course}
            onSave={handleFormSave}
            onDelete={handleFormDelete}
        />
      )}
    </div>
  );
}
