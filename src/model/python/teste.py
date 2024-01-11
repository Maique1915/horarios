from Horarios import Horarios, Cursos
import pandas as pd

h = Horarios(Cursos.FISICA)
h.getGrade()
h.atualiza()

'''
print("periodos:", h.periodos)
print("dias:", h.dias)
print("horarios:", h.horarios)
print()
print("materias:", len(h.materias))

for x in h.materias:
	print(x)

for x in h.bd_json:
	print(x)
	print()
print()
print("profs:", h.profs)
print()
print("grade", h.grade)

h.bdjson()
'''
