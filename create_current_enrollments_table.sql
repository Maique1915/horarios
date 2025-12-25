-- =====================================================
-- TABELA DE DISCIPLINAS QUE O USUÁRIO ESTÁ CURSANDO ATUALMENTE
-- =====================================================
CREATE TABLE current_enrollments (
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  class_name VARCHAR(20), -- Ex: '13A', 'U' (Armazena a turma específica)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, subject_id),

  CONSTRAINT fk_enrollment_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_enrollment_subject
    FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE
);
