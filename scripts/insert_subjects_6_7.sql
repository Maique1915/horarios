-- Subjects for Courses 6 (FAETERJ - CST TIC) and 7 (Copy of Course 6 or similar)
-- Data extracted from images provided for periods 2, 3, 4, and 5.
-- All subjects are MANDATORY, ACTIVE, and NOT OPTIONAL.
-- 1º PERÍODO
INSERT INTO subjects (
        course_id,
        semester,
        acronym,
        name,
        active,
        category,
        optional,
        workload,
        credits
    )
VALUES (
        7,
        1,
        'OC1',
        'Organização de Computadores 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        7,
        1,
        'PRC',
        'Programação em C',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        7,
        1,
        'MAD',
        'Matemática Discreta',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        1,
        'LFT',
        'Laboratórios de Fundamentos em TIC',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        1,
        'IT1',
        'Inglês Técnico 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    );
-- 2º PERÍODO
INSERT INTO subjects (
        course_id,
        semester,
        acronym,
        name,
        active,
        category,
        optional,
        workload,
        credits
    )
VALUES (
        6,
        2,
        'BD1',
        'Banco de Dados 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [3]
    ),
    (
        6,
        2,
        'OC2',
        'Organização de Computadores 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        6,
        2,
        'POO',
        'Prog Orient. a Obj e Alg em C++',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        6,
        2,
        'MAT',
        'Matemática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        6,
        2,
        'IT2',
        'Inglês Técnico 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [3]
    ),
    (
        6,
        2,
        'POI',
        'Português Instrumental',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        2,
        'BD1',
        'Banco de Dados 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [3]
    ),
    (
        7,
        2,
        'OC2',
        'Organização de Computadores 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        7,
        2,
        'POO',
        'Prog Orient. a Obj e Alg em C++',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        7,
        2,
        'MAT',
        'Matemática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        7,
        2,
        'IT2',
        'Inglês Técnico 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [3]
    ),
    (
        7,
        2,
        'POI',
        'Português Instrumental',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    );
-- 3º PERÍODO
INSERT INTO subjects (
        course_id,
        semester,
        acronym,
        name,
        active,
        category,
        optional,
        workload,
        credits
    )
VALUES (
        6,
        3,
        'BD2',
        'Banco de Dados 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        3,
        'RD1',
        'Rede de Computadores 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        6,
        3,
        'SO1',
        'Sistemas Operacionais 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        6,
        3,
        'PCD',
        'Princípio de Comunicação de Dados',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        6,
        3,
        'PRJ',
        'Programação em Java',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    ),
    (
        7,
        3,
        'BD2',
        'Banco de Dados 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        3,
        'RD1',
        'Rede de Computadores 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        7,
        3,
        'SO1',
        'Sistemas Operacionais 1',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        7,
        3,
        'PCD',
        'Princípio de Comunicação de Dados',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        7,
        3,
        'PRJ',
        'Programação em Java',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [6]
    );
-- 4º PERÍODO
INSERT INTO subjects (
        course_id,
        semester,
        acronym,
        name,
        active,
        category,
        optional,
        workload,
        credits
    )
VALUES (
        6,
        4,
        'SIN',
        'Segurança da Informação',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        4,
        'ICG',
        'Introdução à Computação Gráfica',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        6,
        4,
        'RD2',
        'Rede de Computadores 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        4,
        'PAV',
        'Programação de Ambiente Visual',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        4,
        'TCD',
        'Tecnologia de Comunicação de Dados',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        4,
        'SO2',
        'Sistemas Operacionais 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        4,
        'SIN',
        'Segurança da Informação',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        4,
        'ICG',
        'Introdução à Computação Gráfica',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [5]
    ),
    (
        7,
        4,
        'RD2',
        'Rede de Computadores 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        4,
        'PAV',
        'Programação de Ambiente Visual',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        4,
        'TCD',
        'Tecnologia de Comunicação de Dados',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        4,
        'SO2',
        'Sistemas Operacionais 2',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    );
-- 5º PERÍODO
INSERT INTO subjects (
        course_id,
        semester,
        acronym,
        name,
        active,
        category,
        optional,
        workload,
        credits
    )
VALUES (
        6,
        5,
        'CEL',
        'Comércio Eletrônico',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'LEI',
        'Legislação em Informática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'MQA',
        'Métodos Quantitativos Aplicados a TIC',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        5,
        'EMP',
        'Empreendedorismo',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'PAI',
        'Psicologia Aplicada a Informática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'PEA',
        'Planejamento Estratégico Aplicado a TIC',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'SMH',
        'Sistemas Multimídia e Hipermidia',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        6,
        5,
        'SAS',
        'Segurança e Auditoria de Sistemas',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        6,
        5,
        'SAD',
        'Sistemas de Apoio à Decisão',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'CEL',
        'Comércio Eletrônico',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'LEI',
        'Legislação em Informática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'MQA',
        'Métodos Quantitativos Aplicados a TIC',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        5,
        'EMP',
        'Empreendedorismo',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'PAI',
        'Psicologia Aplicada a Informática',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'PEA',
        'Planejamento Estratégico Aplicado a TIC',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'SMH',
        'Sistemas Multimídia e Hipermidia',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    ),
    (
        7,
        5,
        'SAS',
        'Segurança e Auditoria de Sistemas',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [4]
    ),
    (
        7,
        5,
        'SAD',
        'Sistemas de Apoio à Decisão',
        TRUE,
        'MANDATORY',
        FALSE,
        0,
        ARRAY [2]
    );