import json
import csv

# Ler o arquivo JSON
with open('db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Definir os nomes das colunas
fieldnames = ['_cu', '_se', '_di', '_re', '_ap', '_at', '_el', '_ag', '_pr', '_ho', '_au', '_ha', '_da']

# Criar o arquivo CSV
with open('db.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
    
    # Escrever cabeçalho
    writer.writeheader()
    
    # Escrever cada registro
    for row in data:
        # Converter listas para strings para facilitar visualização no Excel
        if '_pr' in row and isinstance(row['_pr'], list):
            row['_pr'] = ', '.join(str(x) for x in row['_pr'])
        if '_ho' in row and isinstance(row['_ho'], list):
            row['_ho'] = str(row['_ho'])
        if '_ha' in row and isinstance(row['_ha'], list):
            row['_ha'] = str(row['_ha'])
        
        writer.writerow(row)

print("Arquivo db.csv criado com sucesso!")
