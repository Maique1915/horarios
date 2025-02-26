import re
import json
import pandas as pd
from datetime import datetime

arquivo_excel = "engcom.xlsx"
caminho_json = "db.json"
separador_h = " às "
dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX']
materias = []  # Lista de matérias
horarios = {
    "07:00"+separador_h+"07:50": 0,
    "07:50"+separador_h+"08:40": 1,
    "08:40"+separador_h+"09:30": 2,
    "10:00"+separador_h+"10:50": 3,
    "10:50"+separador_h+"11:40": 4,
    "11:40"+separador_h+"12:30": 5,
    "14:00"+separador_h+"14:50": 6,
    "14:50"+separador_h+"15:40": 7,
    "15:40"+separador_h+"16:30": 8,
    "16:30"+separador_h+"17:20": 9,
    "17:20"+separador_h+"18:10": 10,
    "18:10"+separador_h+"19:00": 11
}

def print_materias(materias=materias):
  for materia in materias:
    print_materia(materia)

def print_materia(materia):
  a = f"curso: {materia['_cu']}, \nsemestre: {materia['_se']}, \ndisciplina: {materia['_di']}, \nsigla: {materia['_re']}, \npráticas: {materia['_ap']}, \nteoricas: {materia['_at']}, \neletiva: {materia['_el']}, \nativa: {materia['_ag']}, \nrequisitos: {materia['_pr']},"
  d = ""
  lista_chaves_horarios = list(horarios.keys())

  for hs in materia['_ho']:
    # Convert horarios.keys() to a list to enable indexing
    i, j = hs
    # Check if i and j are within the valid range before accessing elements
    if j < len(lista_chaves_horarios) and i < len(dias):
        d += f"\n{dias[i]} das {lista_chaves_horarios[j]}"
    else:
        # Handle the case where i or j is out of range (e.g., print an error message or skip)
        print(f"Warning: Index out of range. i={i}, j={j}")

  a += f"\nhorarios: {d}"

  print(a)
  print()

# prompt: ainda na função limpar_arquivo_excel remova as linhas que tem os dias da semana escritos, como os dias da semana começam com "SEG" ou apenas 3 letras do alfabeto remova caso a coluna "Unnamed: 2" tenha alguns destes padrões

try:
    # Carrega o arquivo Excel
    df = pd.read_excel(arquivo_excel)

    # Remove linhas onde todas as colunas são NaN
    df.dropna(how='all', inplace=True)

    # Remove linhas onde a coluna "Unnamed: 1" está vazia ou com NaN
    df.dropna(subset=["Unnamed: 1"], inplace=True)


except FileNotFoundError:
    print(f"Erro: Arquivo '{arquivo_excel}' não encontrado.")
except Exception as e:
    print(f"Erro: Ocorreu um erro durante o processamento: {e}")

def formatar_horario(horario):
    """
    Recebe uma string de horário e retorna no formato HH:MM, garantindo dois dígitos para horas e minutos.
    """
    try:
        horas, minutos = map(int, horario.split(":"))
        return f"{horas:02}:{minutos:02}"
    except ValueError:
        return "Horário inválido"

def calcular_diferenca_horario(horario1, horario2):
    """Calcula a diferença entre dois horários no formato HH:MM"""
    try:
        h1 = datetime.strptime(horario1, "%H:%M")
        h2 = datetime.strptime(horario2, "%H:%M")
        return abs((h1 - h2).total_seconds())
    except ValueError:
        return float('inf')  # Retorna um valor alto se a conversão falhar

def encontrar_horario_mais_proximo(grade_atual, horario_formatado):
    """
    Encontra o horário mais próximo na grade com base nos horários de início e fim.
    Se não houver horário compatível, retorna None.
    """
    horarios_existentes = list(grade_atual.keys())

    if not horarios_existentes:
        return None  # Não há horários na grade

    inicio_desejado, fim_desejado = horario_formatado.split(separador_h)

    horario_mais_proximo = None
    menor_diferenca = float('inf')

    for horario in horarios_existentes:
        try:
            inicio_existente, fim_existente = horario.split(separador_h)
            diferenca_inicio = calcular_diferenca_horario(inicio_existente, inicio_desejado)
            diferenca_fim = calcular_diferenca_horario(fim_existente, fim_desejado)
            diferenca_total = diferenca_inicio + diferenca_fim

            if diferenca_total < menor_diferenca:
                menor_diferenca = diferenca_total
                horario_mais_proximo = horario

        except ValueError:
            continue  # Ignora horários mal formatados

    return horario_mais_proximo

def limpar_materia(col):
    """
    Aplica padronização ao nome da matéria, removendo sufixos desnecessários,
    ajustando formatação e corrigindo espaçamentos.
    """
    col = col.strip()

    if ' - A' in col:
        col = col.split(' - A')[0]
    if col.endswith(' A'):
        col = col[:-2]  # Remove os últimos dois caracteres (" A")
    if ' -A' in col:
        col = col.split(' -A')[0]

    if ' -B' in col:
        col = col[:-2] + "- B"

    if '\n' in col:
        col = col.split('\n')[0]

    # Ajusta a formatação do nome
    col = col.title()

    # Substituições comuns para melhorar a legibilidade
    substituicoes = {
        " De ": " de ", " Da ": " da ", " Do ": " do ",
        " Das ": " das ", " Dos ": " dos ", " A ": " a ",
        " À ": " à ", " Ao ": " ao ", " Para ": " para ",
        " Com ": " com ", "Sem": "sem", " Em ": " em ", "Ia": "IA",
        " O ": " o ", " E ": " e ", " E, ": " e, ", " Um ": " um ",
        " Uma ": " uma ", " Ii": " II", " Iii": " III",
        " IIi": " III", " Iv": " IV", " Vi": " VI", "o B": "o - B",
        " Iot": " IoT", "Tcc": "TCC", "Usando": "usando"
    }

    for original, substituto in substituicoes.items():
        col = col.replace(original, substituto)

    # Remove espaços extras
    col = re.sub(r' {2,}', ' ', col).strip()

    return col

def processar_materia(grade_atual, indice, celula, prox):
    """
    Processa os dados da célula, separando o nome real da matéria do dado adicional.
    Se houver um dado adicional ('Horário ...'), ele será tratado corretamente e inserido na grade.
    """

    celula = limpar_materia(celula)

    if isinstance(celula, str) and "Início" in celula:
        partes = celula.split("Início")  # Divide a string onde aparece 'Horário'
        return [partes[0].strip()]  # Retorna

    if isinstance(prox, str) and "Horário" in prox:
        partes = prox.split("Horário")  # Divide a string onde aparece 'Horário'

        if len(partes) < 2:
            return [celula]  # Retorna como está se não houver "Horário" corretamente formatado

        horario_str = partes[1].strip()
        horario = horario_str.split(" - ")

        if len(horario) < 2:
            return [celula]  # Retorna como está se o formato do horário estiver errado

        try:
            horario_formatado = separador_h.join([formatar_horario(horario[0]), formatar_horario(horario[1])])
        except Exception:
            return [celula]  # Retorna se houver erro na formatação do horário

        if horario_formatado not in grade_atual:
            horario_proximo = encontrar_horario_mais_proximo(grade_atual, horario_formatado)

            if horario_proximo:
                horario_formatado = horario_proximo  # Usa o horário mais próximo encontrado
            else:
                grade_atual[horario_formatado] = [[] for _ in range(5)]  # Cria novo horário

        grade_atual[horario_formatado][indice].append(celula)

        return []  # Retorna vazio pois já adicionamos a matéria na grade

    return [celula]  # Retorna apenas a matéria formatada

def materia_ja_adicionada(materias, nome_materia):
    """Verifica se a matéria já está na lista e retorna seu índice, ou -1 se não existir."""
    for i, materia in enumerate(materias):
        if materia["_di"] == nome_materia:
            return i  # Retorna o índice da matéria encontrada
    return -1  # Retorna -1 se a matéria não estiver na lista

def gerar_identificador_unico(materias):
    """Gera um identificador único para a matéria no formato '1O', '2O', etc."""
    ids_existentes = {materia["_re"] for materia in materias}
    i = 1
    while f"{i}O" in ids_existentes:
        i += 1
    return f"{i}O"

def adicionar_materias(periodo, indice, horario, materias_lista):
    # Se houver mais de um nome na lista, remover " - OPT" de todos
    if len(materias_lista) == 0:
      return

    m = materias_lista.split(" - Opt")[0]

    # Verifica se alguma das matérias já está na lista
    indice_materia = materia_ja_adicionada(materias, m)


    if indice_materia < 0:
        novo_identificador = gerar_identificador_unico(materias)

        nova_materia = {
            "_cu": "engcomp",
            "_se": int(periodo),
            "_di": m,  # Assume o primeiro nome como principal
            "_re": novo_identificador,  # Identificador único
            "_ap": 0,  # Créditos práticos (inicialmente 0)
            "_at": 0,  # Créditos teóricos (inicialmente 0)
            "_el": " - Opt" not in materias_lista,  # Definir como optativa se qualquer nome for optativo
            "_ag": True,  # Definir como disponível no período atual
            "_pr": [],  # Pré-requisitos vazios por padrão
            "_ho": [[False]*12 for _ in range(5) ]  # Grade horária vazia
        }

        materias.append(nova_materia)  # Adiciona à lista de matérias
        indice_materia = len(materias) - 1  # Atualiza o índice para a nova matéria

    if indice < 5 and horarios[horario] < 12:
        materias[indice_materia]["_ho"][indice][horarios[horario]] = True  # Define o horário específico como True

    # para a atualização
    #if (indice, horarios[horario]) not in materias[indice_materia]["_ho"]:
    #    materias[indice_materia]["_ho"].append((indice, horarios[horario]))  # Define o horário e dia que há a matéria

def converter_horarios_para_indices(materia):
    """
    Converte a matriz de horários (_ho) para uma lista de tuplas (x, y),
    onde x representa o dia e y o horário.
    """
    if isinstance(materia.get("_ho"), list):  # Garante que _ho é uma lista
        nova_ho = []
        for x, dia in enumerate(materia["_ho"]):
            for y, ocupado in enumerate(dia):
                if ocupado:  # Se for True, adiciona a posição
                    nova_ho.append((x, y))
        materia["_ho"] = nova_ho  # Substitui o formato antigo pelo novo

def separar_grades_por_horario(df):
    """
    Separa as matérias por período e horário, garantindo que cada período tenha horários não repetidos.
    Se um horário já apareceu no período atual, ele é movido para o próximo período.
    Remove períodos que tenham apenas valores vazios, None ou NaN.
    """
    grade = {}  # Dicionário principal { "período": {horário: matérias} }
    periodo_atual = 1  # Índice para os períodos

    # Renomeia as colunas para facilitar o acesso
    df = df.rename(columns={
        'Unnamed: 2': 'SEG',
        'Unnamed: 3': 'TER',
        'Unnamed: 4': 'QUA',
        'Unnamed: 5': 'QUI',
        'Unnamed: 6': 'SEX'
    })

    # Inicializa o primeiro período
    grade[f"{periodo_atual}"] = {}

    for index, row in df.iterrows():
        horario = row['Unnamed: 1']
        # Verifica se o valor em 'Unnamed: 1' é um horário válido
        if isinstance(horario, str) and separador_h in horario:

            # Se o horário já apareceu no período atual, avançamos para o próximo período
            if horario in grade[f"{periodo_atual}"]:
                # Verifica se o período atual está completamente vazio
                periodo_vazio = all(
                    all(c in [[""], []] for c in celula)
                    for celula in grade[f"{periodo_atual}"].values()
                )

                if periodo_vazio:
                    # Remove o período atual antes de criar um novo
                    del grade[f"{periodo_atual}"]
                    periodo_atual -= 1

                # Se já removemos, o novo período assume o mesmo índice
                periodo_atual += 1
                grade[f"{periodo_atual}"] = {}

            # Adiciona a matéria ao horário dentro do período correspondente
            if horario not in grade[f"{periodo_atual}"]:
                grade[f"{periodo_atual}"][horario] = []

            # Processa cada célula separadamente e transforma em array de arrays
            materias_processadas = []

            for i, col in enumerate(dias):
                # Garantindo que todas as células são strings completas

                valor_atual = str(row[col]).replace("\n", " ").strip() if pd.notna(row[col]) else ""

                # Acessa a célula abaixo corretamente, garantindo que não ocorra erro ao acessar além do índice permitido
                if index + 1 < len(df):
                    valor_abaixo = str(df.iloc[index + 1, df.columns.get_loc(col)]).replace("\n", " ").strip() if pd.notna(df.iloc[index + 1, df.columns.get_loc(col)]) else ""
                else:
                    valor_abaixo = ""

                materias_processadas.append(processar_materia(grade[f"{periodo_atual}"], i, valor_atual, valor_abaixo))

            grade[f"{periodo_atual}"][horario] = materias_processadas  # Salva na grade

    """for periodo, horarios in grade.items():
        for horario, materias_periodo in horarios.items():
            print(materias_periodo)"""

    return grade  # Retorna o dicionário filtrado

def atualizar_materias_no_json(grade):
    """
    Atualiza as matérias no JSON com base na grade atual.
    """
    materias = []
    for periodo, horarios in grade.items():
        for horario, materias_periodo in horarios.items():
            #print(materias_periodo)
            for indice, materia in enumerate(materias_periodo):
                for x in materia:
                    adicionar_materias(periodo, indice, horario, x)

def atualizar_json(dados_json, materias):

    # Transformar a lista de materias em um dicionário para fácil acesso
    materias_dict = {materia['_di']: materia for materia in materias}

    # Processar as matérias existentes no JSON
    for materia in dados_json:
        if limpar_materia(materia['_di']) in materias_dict:
            # Atualiza os campos mantendo alguns inalterados
            materia.update({k: v for k, v in materias_dict[limpar_materia(materia['_di'])].items() if k not in ['_re', '_ap', '_at', '_pr']})

            # Converter _ho para o novo formato
            #converter_horarios_para_indices(materia)

            if len(materia['_re']) == 0:
                materia['_re'] = gerar_identificador_unico(dados_json)
        else:
            #print(repr(materia['_di']), repr(limpar_materia(materia['_di'])))
            # Se não existe no array de matérias, marca como não ativa
            materia['_ag'] = False
            # Converter _ho para garantir consistência
            materia['_ho'] = [[False] * 12 for _ in range(5)]

    # Adicionar novas matérias que estão em `materias` mas não no JSON
    for materia in materias:
        if materia['_di'] not in {limpar_materia(m['_di']) for m in dados_json}:
            if len(materia['_re']) == 0:
                materia['_re'] = gerar_identificador_unico(dados_json)
            dados_json.append(materia)

    # Atualizar o JSON salvo
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados_json, f, ensure_ascii=False, indent=4)

df = pd.read_excel(arquivo_excel)
grade = separar_grades_por_horario(df)
atualizar_materias_no_json(grade)

# Carregar o arquivo JSON existente
with open(caminho_json, 'r', encoding='utf-8') as f:
    dados_json = json.load(f)

atualizar_json(dados_json, materias)

# para a atualização
"""for materia in dados_json:
    if materia['_cu'] == "engcomp":
        materia['_ho'] = list(set(materia['_ho']))  # Remove duplicatas mantendo a chave


for materia in dados_json:
    if materia['_ag'] and materia['_cu'] == "engcomp" :
      if materia['_ap'] + materia['_at'] != len(materia['_ho']):
          print_materia(materia)
"""
