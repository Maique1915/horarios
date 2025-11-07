import type { Curso, Disciplina } from "@/types";

export const cursos: Curso[] = [
  {
    _cu: "engcomp",
    _da: [12, 5],
    _ds: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    _hd: [
      ["07:00", "07:50"], ["07:50", "08:40"], ["09:00", "09:50"], ["09:50", "10:40"],
      ["10:50", "11:40"], ["11:40", "12:30"], ["13:00", "13:50"], ["13:50", "14:40"],
      ["15:00", "15:50"], ["15:50", "16:40"], ["17:00", "17:50"], ["17:50", "18:40"],
    ],
  },
  {
    _cu: "matematica",
    _da: [6, 5],
    _ds: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    _hd: [
      ["08:00", "09:00"], ["09:00", "10:00"], ["10:00", "11:00"],
      ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"],
    ],
  },
];

export const disciplinas: Disciplina[] = [
  // --- Engenharia de Computação ---
  // Semestre 1
  { _id: "1", _se: 1, _di: "Cálculo I", _re: "MAT101", _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: "engcomp", _ho: [[0, 0], [0, 1], [2, 0], [2, 1]], _da: null },
  { _id: "2", _se: 1, _di: "Algoritmos e Programação", _re: "INF101", _at: 4, _ap: 2, _pr: [], _el: false, _ag: true, _cu: "engcomp", _ho: [[1, 2], [1, 3], [3, 2], [3, 3]], _da: null },
  { _id: "3", _se: 1, _di: "Introdução à Eng. de Computação", _re: "ENG101", _at: 2, _ap: 0, _pr: [], _el: false, _ag: true, _cu: "engcomp", _ho: [[4, 0], [4, 1]], _da: null },
  
  // Semestre 2
  { _id: "4", _se: 2, _di: "Cálculo II", _re: "MAT102", _at: 4, _ap: 0, _pr: ["MAT101"], _el: false, _ag: true, _cu: "engcomp", _ho: [[0, 2], [0, 3], [2, 2], [2, 3]], _da: null },
  { _id: "5", _se: 2, _di: "Estrutura de Dados", _re: "INF102", _at: 4, _ap: 2, _pr: ["INF101"], _el: false, _ag: true, _cu: "engcomp", _ho: [[1, 0], [1, 1], [3, 0], [3, 1]], _da: null },
  { _id: "6", _se: 2, _di: "Física I", _re: "FIS101", _at: 4, _ap: 0, _pr: ["MAT101"], _el: false, _ag: true, _cu: "engcomp", _ho: [[0, 4], [2, 4], [4, 2], [4, 3]], _da: null },

  // Semestre 3
  { _id: "7", _se: 3, _di: "Banco de Dados", _re: "INF201", _at: 2, _ap: 2, _pr: ["INF102"], _el: false, _ag: true, _cu: "engcomp", _ho: [[1, 4], [1, 5]], _da: null },
  { _id: "8", _se: 3, _di: "Circuitos Elétricos", _re: "ELE101", _at: 4, _ap: 0, _pr: ["FIS101"], _el: false, _ag: true, _cu: "engcomp", _ho: [[0, 6], [0, 7], [2, 6], [2, 7]], _da: null },
  
  // Eletivas
  { _id: "9", _se: 0, _di: "Inteligência Artificial", _re: "INF301", _at: 4, _ap: 0, _pr: ["INF102"], _el: true, _ag: true, _cu: "engcomp", _ho: [[3, 6], [3, 7]], _da: null },
  { _id: "10", _se: 0, _di: "Desenvolvimento Web", _re: "INF302", _at: 2, _ap: 2, _pr: ["INF102"], _el: true, _ag: true, _cu: "engcomp", _ho: [[4, 6], [4, 7]], _da: null },
  { _id: "11", _se: 0, _di: "Gestão de Projetos", _re: "ADM101", _at: 4, _ap: 0, _pr: [], _el: true, _ag: true, _cu: "engcomp", _ho: [[1, 8], [1, 9]], _da: null },
  { _id: "12", _se: 1, _di: "Disciplina Inativa", _re: "XXX000", _at: 2, _ap: 0, _pr: [], _el: false, _ag: false, _cu: "engcomp", _ho: [[4, 4]], _da: null },


  // --- Matemática ---
  // Semestre 1
  { _id: "13", _se: 1, _di: "Cálculo Diferencial e Integral I", _re: "MAT-M101", _at: 6, _ap: 0, _pr: [], _el: false, _ag: true, _cu: "matematica", _ho: [[0,0], [0,1], [2,0], [2,1], [4,0], [4,1]], _da: null },
  { _id: "14", _se: 1, _di: "Geometria Analítica", _re: "MAT-M102", _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: "matematica", _ho: [[1,0], [1,1], [3,0], [3,1]], _da: null },

  // Semestre 2
  { _id: "15", _se: 2, _di: "Cálculo Diferencial e Integral II", _re: "MAT-M201", _at: 6, _ap: 0, _pr: ["MAT-M101"], _el: false, _ag: true, _cu: "matematica", _ho: [[0,2], [0,3], [2,2], [2,3], [4,2], [4,3]], _da: null },
  { _id: "16", _se: 2, _di: "Álgebra Linear I", _re: "MAT-M202", _at: 4, _ap: 0, _pr: ["MAT-M102"], _el: false, _ag: true, _cu: "matematica", _ho: [[1,2], [1,3], [3,2], [3,3]], _da: null },
];
