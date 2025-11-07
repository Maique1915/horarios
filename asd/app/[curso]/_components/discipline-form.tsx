"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import type { Curso, Disciplina } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScheduleEditor } from "./schedule-editor";

const formSchema = z.object({
  _id: z.string(),
  _di: z.string().min(3, "Nome muito curto"),
  _re: z.string().min(3, "Código muito curto"),
  _se: z.coerce.number(),
  _at: z.coerce.number().min(0),
  _ap: z.coerce.number().min(0),
  _pr: z.array(z.string()),
  _el: z.boolean(),
  _ag: z.boolean(),
  _cu: z.string(),
  _ho: z.array(z.tuple([z.number(), z.number()])),
  _da: z.array(z.union([z.tuple([z.string(), z.string()]), z.null()])).nullable(),
});

interface DisciplineFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  discipline: Disciplina | null;
  allDisciplines: Disciplina[];
  course: Curso;
  onSave: (data: Disciplina) => void;
  onDelete: (id: string) => void;
}

export function DisciplineForm({ isOpen, setIsOpen, discipline, allDisciplines, course, onSave, onDelete }: DisciplineFormProps) {
  const form = useForm<Disciplina>({
    resolver: zodResolver(formSchema),
    defaultValues: discipline || {
      _id: "", _di: "", _re: "", _se: 1, _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: course._cu, _ho: [], _da: [],
    },
  });

  const onSubmit = (data: Disciplina) => {
    onSave(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{discipline ? "Editar Disciplina" : "Adicionar Nova Disciplina"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da disciplina abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ScrollArea className="h-[60vh] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="_di">Nome da Disciplina</Label>
                        <Input id="_di" {...form.register("_di")} />
                        {form.formState.errors._di && <p className="text-red-500 text-xs mt-1">{form.formState.errors._di.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="_re">Código de Referência</Label>
                        <Input id="_re" {...form.register("_re")} />
                        {form.formState.errors._re && <p className="text-red-500 text-xs mt-1">{form.formState.errors._re.message}</p>}
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="_se">Período</Label>
                            <Input id="_se" type="number" {...form.register("_se")} />
                        </div>
                        <div>
                            <Label htmlFor="_at">Aulas Teóricas</Label>
                            <Input id="_at" type="number" {...form.register("_at")} />
                        </div>
                         <div>
                            <Label htmlFor="_ap">Aulas Práticas</Label>
                            <Input id="_ap" type="number" {...form.register("_ap")} />
                        </div>
                    </div>
                     <div>
                        <Label>Pré-requisitos</Label>
                        <Controller
                            control={form.control}
                            name="_pr"
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange([...field.value, val])}>
                                    <SelectTrigger><SelectValue placeholder="Adicionar pré-requisito..." /></SelectTrigger>
                                    <SelectContent>
                                        {allDisciplines.filter(d => d._id !== discipline?._id && !field.value.includes(d._re)).map(d => (
                                            <SelectItem key={d._id} value={d._re}>{d._di}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch('_pr').map(pr => (
                                <div key={pr} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                                    {pr}
                                    <button type="button" onClick={() => form.setValue('_pr', form.getValues('_pr').filter(p => p !== pr))}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                           <Controller name="_el" control={form.control} render={({ field }) => <Switch id="_el" checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label htmlFor="_el">Eletiva</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                           <Controller name="_ag" control={form.control} render={({ field }) => <Switch id="_ag" checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label htmlFor="_ag">Ativa</Label>
                        </div>
                    </div>
                </div>

                <div>
                    <Label>Horários</Label>
                    <Controller
                        name="_ho"
                        control={form.control}
                        render={({ field }) => (
                            <ScheduleEditor
                                course={course}
                                selectedSlots={field.value}
                                onSlotsChange={(slots) => {
                                    field.onChange(slots);
                                    const newDa = slots.map(() => null);
                                    form.setValue("_da", newDa);
                                }}
                            />
                        )}
                    />
                    {form.watch('_ho').length > 0 && (
                         <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2">Horários Customizados</h4>
                            {form.watch('_ho').map((slot, index) => {
                                const day = course._ds[slot[0]];
                                const time = course._hd[slot[1]].join(' - ');
                                return (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <span className="text-sm flex-1">{day}, {time}</span>
                                    <Input type="time" className="w-24 h-8"
                                        onChange={(e) => {
                                            const da = form.getValues('_da') || [];
                                            if (!da[index]) da[index] = ["", ""];
                                            da[index]![0] = e.target.value;
                                            form.setValue('_da', da);
                                        }}
                                    />
                                    <Input type="time" className="w-24 h-8"
                                         onChange={(e) => {
                                            const da = form.getValues('_da') || [];
                                            if (!da[index]) da[index] = ["", ""];
                                            da[index]![1] = e.target.value;
                                            form.setValue('_da', da);
                                        }}
                                    />
                                </div>
                            )})}
                         </div>
                    )}
                </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <div className="flex justify-between w-full">
                <div>
                {discipline && <Button type="button" variant="destructive" onClick={() => onDelete(discipline._id)}><Trash2 className="mr-2 h-4 w-4"/>Remover</Button>}
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => form.reset()}><RotateCcw className="mr-2 h-4 w-4"/>Resetar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
