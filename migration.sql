-- =====================================
-- MIGRAÇÃO GERADA AUTOMATICAMENTE
-- DATA: 2025-12-20 12:51:35.245354
-- =====================================

-- COURSES
INSERT INTO courses (code, name) VALUES ('engcomp', 'Eng. da Computação');
INSERT INTO courses (code, name) VALUES ('matematica', 'Matemática');

-- SUBJECTS
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Administração e Org. Empresarial',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Geometria Analítica',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Introdução a Ciência da Computação',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Introdução à Engenharia',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Projeto de Interação',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Pré-Cálculo',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Lógica para Computação',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Introdução a Ciência da Computação - B',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Leitura e Produção de Textos',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  1,
  'Pré-Cálculo - B',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Introdução a Programação',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Cálculo a uma Variável',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Álgebra Linear',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Estruturas Discretas',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Introdução a Economia',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Mecânica Clássica',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Ética Profissional',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  2,
  'Introdução a Programação - B',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Algoritmos e Estruturas de Dados I',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Termodinâmica',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Software Básico',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Modelagem de Dados',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Cálculo a Várias Variáveis',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Introdução a Eng. Ambiental',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  3,
  'Humanidades e Ciências Sociais',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Banco de Dados',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Equações Diferenciais Ordinárias I',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Equações Diferenciais Ordinárias I - B',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Algoritmos e Estruturas de Dados II',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Arquitetura de Computadores',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Eletromagnetismo',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Redes de Computadores I',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Cálculo Numérico',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Circuitos Lineares',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Redes de Computadores II',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Programação Orientada a Objetos',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Probabilidade e Estatística',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Sistemas Operacionais',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Engenharia de Software',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Sinais e Sistemas',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Eletrônica Analógica',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Lab. de Circuitos Elétricos e Eletrônicos - B',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Linguagens Formais e Autômatos',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Lab. de Circuitos Elétricos e Eletrônicos - B',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Ondulatória e Física Moderna',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Análise de Algoritmos',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'História e Filosofia da Ciência',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Nanociência e Nanotecnologia',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Servidores de Redes',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Programação Linear',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Processamento Digital de Sinais',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Metodologia Científica',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Técnicas Digitais',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Libras I',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  '5G - Comunicação de Dados Móveis',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Infraestrutura de Redes para IoT',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Segurança de Redes II',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Sistemas Distribuídos',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Computação Gráfica',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Sistemas Inteligentes',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Sistemas de Controle',
  1,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Microcontroladores e Sistemas Embarcados',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Aprendizado Não Supervisionado',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  9,
  'TCC I',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  9,
  'Computação de Alto Desempenho',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  9,
  'Estágio Supervisionado',
  0,
  0,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  10,
  'TCC II',
  0,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Animação Digital',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Ciência e Tecnologia dos Materiais',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Competições de Programação',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Desenho Técnico',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Fenômenos de Transporte',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Introdução à Mecânica dos Sólidos',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Introdução à Prog. para Dispositivos Móveis',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Mineração de Dados',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Organização do Trabalho e Normas',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Programação em Python',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Programação Orientada a Objetos usando C++',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Química Geral',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Redes de Transmissão',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Redes sem Fio',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  5,
  'Segurança de Redes de Computadores I',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  6,
  'Segurança de Redes de Computadores II',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos Complementares em Pré-Cálculo',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos em Algoritmos',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Tópicos Especiais em Computação Móvel',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos Especiais em Inteligência Artificial',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos Especiais em Otimização',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos Especiais em Programação',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Tópicos Especiais em Sistemas Digitais',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Virtualização de Servidores',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Visualização de Dados',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  '5G – Comunicação de Dados Móveis',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Monitoria I',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Monitoria II',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Monitoria III',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Monitoria IV',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Iniciação Científica I',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Iniciação Científica II',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Iniciação Científica III',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  0,
  'Iniciação Científica IV',
  0,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Algoritmos e Estruturas de Dados II - B',
  1,
  1,
  true
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  4,
  'Devops',
  1,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Tópicos Especiais em IA',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  7,
  'Internet VIa Satélite',
  1,
  1,
  0
FROM courses c
WHERE c.code = 'engcomp';
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  8,
  'Intro. Criptografia',
  0,
  0,
  0
FROM courses c
WHERE c.code = 'engcomp';

-- SUBJECT REQUIREMENTS
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Administração e Org. Empresarial'
  AND p.name = '1B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Geometria Analítica'
  AND p.name = '1C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Ciência da Computação'
  AND p.name = '1E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução à Engenharia'
  AND p.name = '1A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Projeto de Interação'
  AND p.name = '1G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Pré-Cálculo'
  AND p.name = '1D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Lógica para Computação'
  AND p.name = '1F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Ciência da Computação - B'
  AND p.name = '1E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Leitura e Produção de Textos'
  AND p.name = '1H';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Pré-Cálculo - B'
  AND p.name = '1D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Programação'
  AND p.name = '2F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo a uma Variável'
  AND p.name = '2B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Álgebra Linear'
  AND p.name = '2C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Estruturas Discretas'
  AND p.name = '2E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Economia'
  AND p.name = '2G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Mecânica Clássica'
  AND p.name = '2D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Ética Profissional'
  AND p.name = '2A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Programação - B'
  AND p.name = '2F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Algoritmos e Estruturas de Dados I'
  AND p.name = '3E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Termodinâmica'
  AND p.name = '3C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Software Básico'
  AND p.name = '3D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Modelagem de Dados'
  AND p.name = '3F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo a Várias Variáveis'
  AND p.name = '3B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução a Eng. Ambiental'
  AND p.name = '3A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Humanidades e Ciências Sociais'
  AND p.name = '3G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Banco de Dados'
  AND p.name = '4F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Equações Diferenciais Ordinárias I'
  AND p.name = '4A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Equações Diferenciais Ordinárias I - B'
  AND p.name = '4A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Algoritmos e Estruturas de Dados II'
  AND p.name = '4E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Arquitetura de Computadores'
  AND p.name = '4D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Eletromagnetismo'
  AND p.name = '4B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Redes de Computadores I'
  AND p.name = '4C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo Numérico'
  AND p.name = '5E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Circuitos Lineares'
  AND p.name = '5D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Redes de Computadores II'
  AND p.name = '5C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Programação Orientada a Objetos'
  AND p.name = '5G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Probabilidade e Estatística'
  AND p.name = '5A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sistemas Operacionais'
  AND p.name = '5B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Engenharia de Software'
  AND p.name = '5F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sinais e Sistemas'
  AND p.name = '6A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Eletrônica Analógica'
  AND p.name = '6E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Lab. de Circuitos Elétricos e Eletrônicos - B'
  AND p.name = '6D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Linguagens Formais e Autômatos'
  AND p.name = '6F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Lab. de Circuitos Elétricos e Eletrônicos - B'
  AND p.name = '6D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Ondulatória e Física Moderna'
  AND p.name = '6B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Análise de Algoritmos'
  AND p.name = '6G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'História e Filosofia da Ciência'
  AND p.name = '32O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Nanociência e Nanotecnologia'
  AND p.name = '12O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Servidores de Redes'
  AND p.name = '6C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Programação Linear'
  AND p.name = '7B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Processamento Digital de Sinais'
  AND p.name = '7C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Metodologia Científica'
  AND p.name = '7D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Técnicas Digitais'
  AND p.name = '7A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Libras I'
  AND p.name = '10O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = '5G - Comunicação de Dados Móveis'
  AND p.name = '13O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Infraestrutura de Redes para IoT'
  AND p.name = '7O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Segurança de Redes II'
  AND p.name = '5O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sistemas Distribuídos'
  AND p.name = '8A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Computação Gráfica'
  AND p.name = '8D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sistemas Inteligentes'
  AND p.name = '8C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sistemas de Controle'
  AND p.name = '8E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Microcontroladores e Sistemas Embarcados'
  AND p.name = '8B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Aprendizado Não Supervisionado'
  AND p.name = '31O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'TCC I'
  AND p.name = '9B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Computação de Alto Desempenho'
  AND p.name = '9A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Estágio Supervisionado'
  AND p.name = '9C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'TCC II'
  AND p.name = '10A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Animação Digital'
  AND p.name = '1O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Ciência e Tecnologia dos Materiais'
  AND p.name = '2O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Competições de Programação'
  AND p.name = '3O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Desenho Técnico'
  AND p.name = '5O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Fenômenos de Transporte'
  AND p.name = '6O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução à Mecânica dos Sólidos'
  AND p.name = '8O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução à Prog. para Dispositivos Móveis'
  AND p.name = '9O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Mineração de Dados'
  AND p.name = '11O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Organização do Trabalho e Normas'
  AND p.name = '13O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Programação em Python'
  AND p.name = '14O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Programação Orientada a Objetos usando C++'
  AND p.name = '15O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Química Geral'
  AND p.name = '16O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Redes de Transmissão'
  AND p.name = '17O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Redes sem Fio'
  AND p.name = '18O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Segurança de Redes de Computadores I'
  AND p.name = '2O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Segurança de Redes de Computadores II'
  AND p.name = '20O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Complementares em Pré-Cálculo'
  AND p.name = '21O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos em Algoritmos'
  AND p.name = '22O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em Computação Móvel'
  AND p.name = '23O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em Inteligência Artificial'
  AND p.name = '24O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em Otimização'
  AND p.name = '25O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em Programação'
  AND p.name = '26O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em Sistemas Digitais'
  AND p.name = '27O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Virtualização de Servidores'
  AND p.name = '28O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Visualização de Dados'
  AND p.name = '29O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = '5G – Comunicação de Dados Móveis'
  AND p.name = '30O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Monitoria I'
  AND p.name = '33O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Monitoria II'
  AND p.name = '34O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Monitoria III'
  AND p.name = '35O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Monitoria IV'
  AND p.name = '36O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Iniciação Científica I'
  AND p.name = '37O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Iniciação Científica II'
  AND p.name = '38O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Iniciação Científica III'
  AND p.name = '39O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Iniciação Científica IV'
  AND p.name = '40O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Algoritmos e Estruturas de Dados II - B'
  AND p.name = '4E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Devops'
  AND p.name = '90O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tópicos Especiais em IA'
  AND p.name = '41O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Intro. Criptografia'
  AND p.name = '4O';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Educação e Sociedade'
  AND p.name = '1A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Educação Financeira'
  AND p.name = '1B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Geometria Euclidiana Plana'
  AND p.name = '1C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução à Lógica'
  AND p.name = '1D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução à Matemática'
  AND p.name = '1E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Computação Algébrica'
  AND p.name = '2A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Construções Geométricas e Geometria Métrica'
  AND p.name = '2B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Funções'
  AND p.name = '2C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Fundamentos Histórico-Filosóficos da Educação'
  AND p.name = '2D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Matemática Financeira'
  AND p.name = '2F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Oficina de Projetos de Ensino de Geometria'
  AND p.name = '3D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo Diferencial e Integral I'
  AND p.name = '3B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Introdução Às Ciências Experimentais'
  AND p.name = '3C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Políticas Públicas e Formação de Professores'
  AND p.name = '3A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Práticas Extensionistas'
  AND p.name = '3F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Trigonometria e, Números Complexos'
  AND p.name = '3G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Didática'
  AND p.name = '4B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Mecânica Básica I'
  AND p.name = '4D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo Diferencial e Integral II'
  AND p.name = '4A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Oficina de Projetos de Ensino de Álgebra'
  AND p.name = '4E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Língua Brasileira de Sinais'
  AND p.name = '4C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'História da Matemática'
  AND p.name = '5B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Prática Docente I'
  AND p.name = '5E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Psicologia Aplicada à Educação'
  AND p.name = '5F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo Diferencial e Integral III'
  AND p.name = '5A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Mecânica Básica II'
  AND p.name = '5D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Tendências em Educação Matemática'
  AND p.name = '6G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Epistemologia'
  AND p.name = '6B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Prática Docente II'
  AND p.name = '6F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Oficina de Análise Combinatória, Probalidade e Estatística'
  AND p.name = '6E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Estruturas Algébricas'
  AND p.name = '6C';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Metodologia da Pesquisa'
  AND p.name = '6D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Cálculo Diferencial e Integral IV'
  AND p.name = '6A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Novas Tecnologias Aplicadas Ao Ensino'
  AND p.name = '7D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Projeto Final I'
  AND p.name = '7F';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Prática Docente III'
  AND p.name = '7E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'História do Ensino da Matemática Escolar No Brasil'
  AND p.name = '7B';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Ciência e Meio Ambiente'
  AND p.name = '7A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Sujeito, sociedade e, cultura'
  AND p.name = '7G';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Projeto Final II'
  AND p.name = '8E';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Prática Docente IV'
  AND p.name = '8D';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Ensino de Matemática em Modalidades Especiais'
  AND p.name = '8A';
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = 'Oficina de Projetos de Ensino de Resolução de Problemas'
  AND p.name = '8B';

-- DAYS
INSERT INTO days (name) VALUES ('Segunda') ON CONFLICT (name) DO NOTHING;
INSERT INTO days (name) VALUES ('Terça') ON CONFLICT (name) DO NOTHING;
INSERT INTO days (name) VALUES ('Quarta') ON CONFLICT (name) DO NOTHING;
INSERT INTO days (name) VALUES ('Quinta') ON CONFLICT (name) DO NOTHING;
INSERT INTO days (name) VALUES ('Sexta') ON CONFLICT (name) DO NOTHING;
INSERT INTO days (name) VALUES ('Sábado') ON CONFLICT (name) DO NOTHING;

-- TIME SLOTS

-- SUBJECT SCHEDULES

-- USERS
INSERT INTO users (username, password_hash, name, role, active, created_at) VALUES ('engcomp', 'e0a1cd4483454c71cf8c54c9b2686c8bc71420c2daf389a1bdce5916ad8284d4', 'Maique Pereira', 'admin', 1, 'nan') ON CONFLICT (username) DO NOTHING;