-- =====================================================
-- TABELA DE DISCIPLINAS CONCLUÍDAS PELO USUÁRIO
-- =====================================================
CREATE TABLE completed_subjects (
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, subject_id),

  CONSTRAINT fk_completed_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_completed_subject
    FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE
);
