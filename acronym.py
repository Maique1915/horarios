import pandas as pd

EXCEL = "Horarios.xlsx"
OUTPUT = "update_acronym.sql"

subject_sheets = ["engcomp", "matematica", "fisica"]

def qwe():
    # -----------------------------
    # Utilitário
    # -----------------------------
    def esc(s):
        return s.replace("'", "''")

    # -----------------------------
    # Mapa: prereq -> [dependentes]
    # -----------------------------
    dependency_map = {}

    for sheet in subject_sheets:
        df = pd.read_excel(EXCEL, sheet_name=sheet)

        for _, row in df.iterrows():
            subject = str(row["_di"]).strip()

            requisites = [r.strip() for r in str(row["_re"]).split(";")]

            for req in requisites:
                if req.upper().startswith("CREDITS"):
                    continue  # ignora requisitos por crédito

                dependency_map.setdefault(req, []).append(subject)

    # -----------------------------
    # Gerar SQL
    # -----------------------------
    sql = []
    sql.append("-- ====================================")
    sql.append("-- POPULAR SUBJECTS.ACRONYM")
    sql.append("-- ====================================\n")

    for prereq, dependents in dependency_map.items():
        acr = ", ".join(sorted(dependents))

        sql.append(
            f"UPDATE subjects "
            f"SET acronym = '{esc(prereq)}' "
            f"WHERE name = '{esc(acr)}';"
        )

    # -----------------------------
    # Gravar arquivo
    # -----------------------------
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))

    print("Arquivo update_acronym.sql gerado com sucesso!")


def asd():
    def to_int(v):
        if pd.isna(v):
            return 0
        return 1 if bool(v) else 0

    def esc(v):
        return str(v).replace("'", "''")

    sql = []
    sql.append("-- Atualização de has_practical e has_theory\n")

    for sheet in sheets:
        df = pd.read_excel(EXCEL, sheet_name=sheet)
        if df.empty:
            continue

        for _, r in df.iterrows():
            if pd.isna(r["_di"]):
                continue

            has_p = to_int(r["_ap"])
            has_t = to_int(r["_at"])

            sql.append(
                f"UPDATE subjects "
                f"SET has_practical = {has_p}, "
                f"    has_theory = {has_t} "
                f"WHERE name = '{esc(r['_di'])}';"
            )

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))

    print("Arquivo update_has.sql gerado.")


if __name__ == "__main__":
    qwe()
