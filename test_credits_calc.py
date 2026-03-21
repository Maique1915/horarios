#!/usr/bin/env python3
"""
Script para testar o cálculo de créditos até diferentes semestres.

Baseado na estrutura esperada:
- 146 créditos completados
- ~18 créditos em 2026.1 (currentEnrollments)
- Sistema prediz cursos para 2026.2, 2026.3, etc.
"""

def calculate_credits_until_semester(
    completed_credits,
    current_enrollments_credits,
    fixed_semesters_credits,  # [2026.2, 2026.3, ...]
    simulation_semesters_credits,  # [2026.2, 2026.3, ...] - predições do sistema
    target_semester_index
):
    """
    Calcula total de créditos até um semestre específico.
    
    target_semester_index:
        0 = 2026.1 (período atual)
        1 = 2026.2
        2 = 2026.3
        etc.
    """
    total = 0
    breakdown = []
    
    # 1. Completadas
    breakdown.append(f"✓ Completadas: {completed_credits} créditos")
    total += completed_credits
    
    # 2-N. Semestres fixed
    # fixedSemesters[0] = 2026.1, [1] = 2026.2, etc.
    for i in range(min(target_semester_index, len(fixed_semesters_credits))):
        cr = fixed_semesters_credits[i]
        sem_name = f"2026.{i + 1}"
        breakdown.append(f"✓ {sem_name}: {cr} créditos")
        total += cr
    
    # Semestres previstos após os fixed
    start_pred = len(fixed_semesters_credits)
    for i in range(start_pred, target_semester_index):
        if i < len(simulation_semesters_credits):
            cr = simulation_semesters_credits[i]
            sem_name = f"2026.{i + 2}"  # simulation[0] = 2026.2
            breakdown.append(f"✓ {sem_name}: {cr} créditos")
            total += cr
    
    return total, breakdown


# Dados do usuário baseado na conversa
print("=" * 60)
print("TESTE DE CÁLCULO DE CRÉDITOS - SISTEMA HORÁRIOS")
print("=" * 60)

completed = 146
current_enrollment = 18
fixed = [0, 18, 0, 0]  # [2026.1, 2026.2, 2026.3, 2026.4]
simulation = [0, 0, 10, 0]  # Predições [2026.2, 2026.3, 2026.4, 2026.5]

print(f"\n📊 DADOS:")
print(f"  Completadas: {completed}")
print(f"  Current 2026.1: {current_enrollment}")
print(f"  Fixed: {fixed}")
print(f"  Simulation: {simulation}")

# Teste 1: Tentar colocar em 2026.2
print("\n" + "=" * 60)
print("TESTE 1: Tentar colocar matéria com 18 créditos em 2026.2")
print("  (Simulando: Metodologia = 18 créditos)")
print("=" * 60)

target = 1  # 2026.2
total, breakdown = calculate_credits_until_semester(
    completed, current_enrollment, fixed, simulation, target
)

print(f"\nCréditos até 2026.2:")
for line in breakdown:
    print(f"  {line}")
print(f"\n  TOTAL: {total} créditos")

# Simular soma com a matéria
fixed_with_metodologia = [current_enrollment, 18, 0, 0]
total2, breakdown2 = calculate_credits_until_semester(
    completed, 0, fixed_with_metodologia, simulation, target + 1
)
print(f"\nCom Metodologia (18 cr) colocada em 2026.2:")
print(f"  TOTAL até 2026.3: {total2} créditos")
print(f"  (Esperado: 146 + 18 + 18 = 182)")

# Teste 2: Cenário real esperado
print("\n" + "=" * 60)
print("TESTE 2: Cálculo esperado para 2026.2")
print("=" * 60)
print(f"  146 (completadas) + 18 (2026.1) = 164 créditos")
total_expected = 146 + 18
print(f"  Esperado para 2026.2: {total_expected} créditos")

# Simular com os dados
total_actual, _ = calculate_credits_until_semester(
    146, 18, [18, 0, 0, 0], [0, 0, 0, 0], 1
)
print(f"  Calculado: {total_actual} créditos")
print(f"  Match: {'✅ SIM' if total_actual == total_expected else '❌ NÃO'}")

print("\n" + "=" * 60)
