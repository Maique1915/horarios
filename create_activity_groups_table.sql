-- Create table for Complementary Activity Groups
CREATE TABLE IF NOT EXISTS complementary_activity_groups (
    id CHAR(1) PRIMARY KEY, -- A, B, C, etc.
    description TEXT NOT NULL,
    min_hours INTEGER DEFAULT 0,
    max_hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Populate Group Data from Regulation PDF
INSERT INTO complementary_activity_groups (id, description, min_hours, max_hours) VALUES
('A', 'Atividades de Iniciação à Docência, à Pesquisa ou à Extensão', 20, 80),
('B', 'Participação em eventos', 0, 100),
('C', 'Atividades de Extensão', 0, 80),
('D', 'Produção Técnica ou Científica', 0, 90),
('E', 'Vivência profissional complementar', 0, 100),
('F', 'Atividades de complementação da formação social, humana e cultural', 0, 60),
('G', 'Participação na Semana Acadêmica e de Extensão', 50, 85),
('H', 'Atividades Complementares Especiais (MIC): Monitoria ou Iniciação Científica como Crédito em Disciplinas Optativas', 0, 60),
('I', 'Atividades Complementares não enquadradas em outros grupos', 0, 50)
ON CONFLICT (id) DO UPDATE SET 
    description = EXCLUDED.description,
    min_hours = EXCLUDED.min_hours,
    max_hours = EXCLUDED.max_hours;

-- Add Foreign Key to complementary_activities table
-- Note: We assume the 'group' column already exists in complementary_activities
ALTER TABLE complementary_activities 
ADD CONSTRAINT fk_activities_group 
FOREIGN KEY ("group") REFERENCES complementary_activity_groups(id);
