import pandas as pd
import re
from datetime import datetime

EXCEL = "Horarios.xlsx"
OUTPUT = "migration.sql"

xlsx = pd.ExcelFile(EXCEL)
sql = []

def esc(v):
    return str(v).replace("'", "''")

# =====================================
# HEADER
# =====================================
sql.append("-- =====================================")
sql.append("-- MIGRAÇÃO GERADA AUTOMATICAMENTE")
sql.append(f"-- DATA: {datetime.now()}")
sql.append("-- =====================================\n")

# =====================================
# COURSES
# =====================================
df_courses = pd.read_excel(xlsx, "cursos")

sql.append("-- COURSES")
for _, r in df_courses.iterrows():
    sql.append(
    f"INSERT INTO courses (code, name) "
    f"VALUES ('{esc(r['_cu'])}', '{esc(r['name'])}');"
)


# =====================================
# SUBJECTS
# =====================================
sql.append("\n-- SUBJECTS")
subject_sheets = ["engcomp", "matematica", "fisica"]

for sheet in subject_sheets:
    df = pd.read_excel(xlsx, sheet)
    if df.empty:
        continue

    for _, r in df.iterrows():
        sql.append(f"""
INSERT INTO subjects
(course_id, semester, name, has_practical, has_theory, elective)
SELECT
  c.id,
  {r['_se'] if not pd.isna(r['_se']) else 'NULL'},
  '{esc(r['_di'])}',
  {str(bool(r['_ap'])).lower()},
  {str(bool(r['_at'])).lower()},
  {str(bool(r['_el'])).lower()}
FROM courses c
WHERE c.code = '{esc(r['_cu'])}';
""".strip())

# =====================================
# REQUIREMENTS (_re)
# =====================================
sql.append("\n-- SUBJECT REQUIREMENTS")

def parse_requirements(text):
    reqs = []
    if pd.isna(text):
        return reqs

    for part in str(text).split(";"):
        part = part.strip()
        if part.startswith("CREDITS>="):
            reqs.append(("CREDITS", int(part.split(">=")[1])))
        else:
            reqs.append(("SUBJECT", part))
    return reqs

for sheet in subject_sheets:
    df = pd.read_excel(xlsx, sheet)
    if df.empty:
        continue

    for _, r in df.iterrows():
        reqs = parse_requirements(r["_re"])
        for kind, val in reqs:
            if kind == "SUBJECT":
                sql.append(f"""
INSERT INTO subject_requirements
(subject_id, type, prerequisite_subject_id)
SELECT s.id, 'SUBJECT', p.id
FROM subjects s, subjects p
WHERE s.name = '{esc(r['_di'])}'
  AND p.name = '{esc(val)}';
""".strip())
            else:
                sql.append(f"""
INSERT INTO subject_requirements
(subject_id, type, min_credits)
SELECT id, 'CREDITS', {val}
FROM subjects
WHERE name = '{esc(r['_di'])}';
""".strip())

# =====================================
# DAYS & TIME SLOTS
# =====================================
sql.append("\n-- DAYS")
DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

for d in DAYS:
    sql.append(
        f"INSERT INTO days (name) VALUES ('{d}') "
        f"ON CONFLICT (name) DO NOTHING;"
    )

sql.append("\n-- TIME SLOTS")

slots = set()
schedule_map = []

pattern = re.compile(r"(.*?)\((\d{2}:\d{2})-(\d{2}:\d{2})\)")

for sheet in subject_sheets:
    df = pd.read_excel(xlsx, sheet)
    if df.empty:
        continue

    for _, r in df.iterrows():
        if pd.isna(r["_ho"]):
            continue

        turma = 'A'
        if '_cl' in df.columns and not pd.isna(r['_cl']):
            turma = r['_cl']

        for m in pattern.findall(r["_ho"]):
            day, start, end = m
            slots.add((start, end))
            schedule_map.append((r["_di"], turma, day.strip(), start, end))

for s, e in slots:
    sql.append(
        f"INSERT INTO time_slots (start_time, end_time) "
        f"VALUES ('{s}', '{e}') "
        f"ON CONFLICT DO NOTHING;"
    )

# =====================================
# CLASSES
# =====================================
sql.append("\n-- CLASSES")

for sub, turma, day, start, end in schedule_map:
    sql.append(f"""
INSERT INTO classes
(subject_id, class, day_id, time_slot_id)
SELECT s.id, '{esc(turma)}', d.id, t.id
FROM subjects s, days d, time_slots t
WHERE s.name = '{esc(sub)}'
  AND d.name = '{esc(day)}'
  AND t.start_time = '{start}'
  AND t.end_time = '{end}';
""".strip())

# =====================================
# USERS
# =====================================
sql.append("\n-- USERS")
df_users = pd.read_excel(xlsx, "users")

for _, r in df_users.iterrows():
    sql.append(
        f"INSERT INTO users "
        f"(username, password_hash, name, role, active, created_at) "
        f"VALUES "
        f"('{esc(r['username'])}', '{esc(r['passwordHash'])}', "
        f"'{esc(r['name'])}', '{esc(r['role'])}', "
        f"{str(bool(r['active'])).lower()}, "
        f"'{r['createdAt']}') "
        f"ON CONFLICT (username) DO NOTHING;"
    )

# =====================================
# WRITE FILE
# =====================================
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write("\n".join(sql))

print("migration.sql gerado com sucesso!")
