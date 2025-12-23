-- =====================================================
-- MODELO ACADÊMICO FINAL
-- =====================================================

-- =====================================================
-- CURSOS
-- code NÃO é único (existem variações/ofertas)
-- =====================================================
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- =====================================================
-- DISCIPLINAS
-- _ap -> aula prática
-- _at -> aula teórica
-- =====================================================
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL,
  semester INT,
  name VARCHAR(150) NOT NULL,

  has_practical BOOLEAN DEFAULT FALSE,
  has_theory BOOLEAN DEFAULT TRUE,
  elective BOOLEAN DEFAULT FALSE,

  CONSTRAINT fk_subject_course
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE
);

-- =====================================================
-- REQUISITOS DE DISCIPLINA (_re)
-- Pode ser:
--  - outra disciplina
--  - créditos mínimos
-- =====================================================
CREATE TABLE subject_requirements (
  id SERIAL PRIMARY KEY,
  subject_id INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  -- 'SUBJECT' | 'CREDITS'

  prerequisite_subject_id INT,
  min_credits INT,

  CONSTRAINT fk_req_subject
    FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_req_prereq_subject
    FOREIGN KEY (prerequisite_subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_req_valid
    CHECK (
      (type = 'SUBJECT'
        AND prerequisite_subject_id IS NOT NULL
        AND min_credits IS NULL)
      OR
      (type = 'CREDITS'
        AND min_credits IS NOT NULL
        AND prerequisite_subject_id IS NULL)
    )
);

-- =====================================================
-- DIAS DA SEMANA
-- =====================================================
CREATE TABLE days (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- =====================================================
-- INTERVALOS DE HORÁRIO
-- =====================================================
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  CONSTRAINT chk_time_valid
    CHECK (start_time < end_time),

  CONSTRAINT uq_time_slot
    UNIQUE (start_time, end_time)
);

-- =====================================================
-- ALOCAÇÃO DE HORÁRIOS (_ho)
-- (disciplina ocupa dia + horário)
-- =====================================================
CREATE TABLE classes (
  subject_id INT NOT NULL,
  class VARCHAR(10) NOT NULL,
  day_id INT NOT NULL,
  time_slot_id INT NOT NULL,

  PRIMARY KEY (subject_id, class, day_id, time_slot_id),

  CONSTRAINT fk_classes_subject
    FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_classes_day
    FOREIGN KEY (day_id)
    REFERENCES days(id),

  CONSTRAINT fk_classes_time
    FOREIGN KEY (time_slot_id)
    REFERENCES time_slots(id)
);

-- =====================================================
-- USUÁRIOS
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) NOT NULL,
  -- ADMIN_GLOBAL | ADMIN_CURSO
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ASSOCIAÇÃO USUÁRIO ↔ CURSO
-- (controle de permissão)
-- =====================================================
CREATE TABLE user_courses (
  user_id INT NOT NULL,
  course_id INT NOT NULL,

  PRIMARY KEY (user_id, course_id),

  CONSTRAINT fk_uc_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_uc_course
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE CASCADE
);

-- =====================================================
-- DADOS BÁSICOS (OPCIONAL)
-- =====================================================
INSERT INTO days (name) VALUES
  ('Segunda'),
  ('Terça'),
  ('Quarta'),
  ('Quinta'),
  ('Sexta'),
  ('Sábado');
