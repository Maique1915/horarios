

from hmac import new
from mimetypes import init
import pandas as pd
import re, json
from enum import Enum, auto

# Carregue sua planilha Excel
sigla_c = ('eng','mat','fis', 'tur')
dias = ('SEG', 'TER', 'QUA', 'QUI', 'SEX','S\xc1B', 'DOM')
cursos = ("Engenharia de Computa\xe7\xe3o", "Matem\xe1tica", "F\xedsica", "Turismo")
sep = (" \xe0s ", ' - ', '-', ' - ')

class Cursos(Enum):
    ENGENHARIA_COMPUTACAO = 0
    MATEMATICA = 1
    FISICA = 2
    TURISMO = 3
    
class Horarios:
	def __init__(self, arg):
		self.curso = sigla_c[arg.value]
		xl = pd.ExcelFile(self.curso+".xlsx")
		self.data_matrix = []
		for nome_planilha in xl.sheet_names:
			# Le a planilha em um DataFrame
			df = pd.read_excel(self.curso+".xlsx", sheet_name=nome_planilha)
			self.data_matrix.append(df.values.tolist())
		
		self.bh = False
		self.dias = []
		self.diasb = []
		self.ic = 0
		self.k = 0
		self.curso_id = arg.value+1
		
		self.sep = sep[arg.value]
		self.horarios = []
		self.materias = []
		self.profs = []
		self.grade = {}
		self.grades = []
		self.bd_json = []
		self.periodos = []
		self.limpa_linha()
		
	def limpa_linha(self):
		aux = []
		for y in self.data_matrix:
			for i, x in enumerate(y):
				b = False
				for y in x:
					if str(y) != "nan":
						b = not b
						break
				if b:
					aux.append(x)
		self.data_matrix = aux

	def getDias(self, row):
		for col in row:
			if isinstance(col, str):
				for dia in dias:
					if dia in col.upper():
						self.dias.append(dia)

	def getPeriodo(self, col):
		numbers = re.findall(r'\d+', col)
		numbers = [int(num) for num in numbers]
		if numbers[0] not in self.periodos:
			self.periodos.append(numbers[0])

	def limpaMateria(self, col):
		col = col.strip()
		el = True
		if ' - OPT' in col:
			col = col.split(' - OPT')[0]
			el = False
		if ' - A' in col:
			col = col.split(' - A')[0]
		elif ' -A' in col:
			col = col.split(' -A')[0]
		elif ' -B' in col:
			col = col[:-2] + "- B"
		if '\n' in col:
			self.getProfs(col.split('\n')[1])
			col = col.split('\n')[0]
			
		col = col.title()
		ma = ["", 0, 0, "", False, False, 1]

		col = col.replace('\n', ' ')
		col = col.replace(" De ", " de ")
		col = col.replace(" Da ", " da ")
		col = col.replace(" Do ", " do ")
		col = col.replace(" Das ", " das ")
		col = col.replace(" Dos ", " dos ")
		col = col.replace(" A ", " a ")
		col = col.replace(" \xc0 ", " \xe0 ")
		col = col.replace(" Para ", " para ")
		col = col.replace(" Com ", " com ")
		col = col.replace(" Em ", " em ")
		col = col.replace(" O ", " o ")
		col = col.replace(" E ", " e ")
		col = col.replace(" Um ", " um ")
		col = col.replace(" Uma ", " uma ")
		col = col.replace(" Ii", " II ")
		col = col.replace(" Iii", " III")
		col = col.replace(" Iv", " IV")
		col = col.replace(" Vi", " VI")
		col = col.replace(" Iot", " IoT")
		col = col.replace("Tcc", "TCC")
		col = col.replace("Tcc", "TCC")
		col = re.sub(r' {2,}', ' ', col)
		col = col.strip()
		if len(self.periodos) == 0:
			self.periodos.append(1)
			
		return [self.periodos[-1], col, ma[3], ma[1], ma[2], el, True, self.curso_id]

	def getMaterias(self, col):
		l = self.limpaMateria(col)
		if  l not in self.materias:
			self.materias.append(l)

	def getProfs(self, col):
		col = col.replace('\n', ' ')
		if '/' in col:
			col = col.split('/')[0]
		if col not in self.profs:
			self.profs.append(col)

	def getHorarios(self, col):
		self.horarios.append([x+':00' for x in col.split(self.sep)])

	def getGrade(self):
		bs = False
		for i, row in enumerate(self.data_matrix):
			if len(self.dias) == 0:
				sem = any(dias[0].lower() in str(s).lower() for s in row)
				if not bs and sem:
					aux = []
					self.getDias(row)
					bs = True
					diasb = row
				continue
			
			for j, col in enumerate(row):
				
				if isinstance(col, str) and ("\xba" in col or "\xb0" in col):
					self.getPeriodo(col)
				elif ":" in str(col) and self.sep in str(col):
					if [x+':00' for x in col.split(self.sep)] not in self.horarios:
						self.getHorarios(col)
					if [x+':00' for x in col.split(self.sep)]:
						#print(row)
						for d, r in enumerate(row[j+1:]):
							
							if isinstance(r, str) and any(caractere.isalpha() for caractere in r):
								if col != "optativas:" and col not in self.dias:
									self.getMaterias(r)
									h = self.horarios.index([x+':00' for x in col.split(self.sep)])
									m = self.materias.index(self.limpaMateria(r))
									#print(r,h,",",m)
									if f"{m+1}" in self.grade:
										self.grade[f"{m+1}"].append([f"{h+1}", f"{d+1}"])
									else:
										self.grade[f"{m+1}"] = [[f"{h+1}", f"{d+1}"]]
						break
				elif isinstance(col, str) and 'Hor\xe1rio' not in col and 'Intervalo' not in col and not sem:
					self.getProfs(col)
			#print()
							
	def abrejson(self, b):
		dados_json = []
		# Abrir o arquivo JSON
		with open("db.json", 'r', encoding='utf-8') as arquivo:
			dados_json = json.load(arquivo)

		# Encontrar objetos com chave "_cu" igual a "engcom"
		return [objeto for objeto in dados_json if b and self.curso in objeto["_cu"] or not b and self.curso not in objeto["_cu"] ]
	
	def atualiza(self):
		antigo = self.abrejson(True)
		novo = self.bdjson()
		print(len(novo),len(antigo))
		nome = []
		
		
		for i, x in enumerate(antigo):
			b = False
			for y in novo:
				if(x["_di"] == y["_di"] and x["_di"] not in nome):
					antigo[i]["_ho"] = y["_ho"]
					antigo[i]["_ag"] = True
					nome.append(self.limpaMateria(x["_di"])[1])
					b = True
					break

			if not b:
				antigo[i]["_ag"] = False
		print(nome)
		
		for x in novo:
			t = self.limpaMateria(x["_di"])[1]
			if t not in nome:
				x["_ag"] = True
				antigo.append(x)

		with open(self.curso+'.json', 'w',encoding='utf-8') as arquivo:
			json.dump(antigo, arquivo,indent=4)

	def bdjson(self):
		res = []
		for k, x in enumerate(self.materias):
			g = self.grade[f"{k+1}"]
			table = {
				"_cu": self.curso_id,
				"_se": x[0],
				"_di": x[1],
				"_re": x[2],
				"_ap": x[3],
				"_at": x[4],
				"_el": x[5],
				"_ag": x[6],
				"_pr": [],
				"_ho": [[False if [f"{j+1}", f"{i+1}"] not in g else True for j in range(len(self.horarios))] for i in range(len(self.dias))]
			}
			res.append(table)

		for i, row in enumerate(self.data_matrix):
			h = [x+':00' for x in row[1].split(self.sep)] if isinstance(row[1], str) else []
			if h in self.horarios:
				ind = -1
				for j, col in enumerate(row[2:]):
					n = self.limpaMateria(col)[1] if isinstance(col, str) else ""
					if n != "":
						for k, y in enumerate(self.materias):
							if y[1] == n:
								ind = k
								res[k]['_ho'][j][self.horarios.index(h)] = True
								break
						
		return res			
		#with open(self.curso+'.json', 'w',encoding='utf-8') as arquivo:
		#	json.dump(res, arquivo,indent=4)
	