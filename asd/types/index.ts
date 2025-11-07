export interface Curso {
  _cu: string;
  _da: [number, number];
  _hd: [string, string][];
  _ds: string[]; // Dias da semana
}

export interface Disciplina {
  _id: string; 
  _se: number;
  _di: string;
  _re: string;
  _at: number;
  _ap: number;
  _pr: string[];
  _el: boolean;
  _ag: boolean;
  _cu: string;
  _ho: [number, number][];
  _da: ([string, string] | null)[] | null;
}
