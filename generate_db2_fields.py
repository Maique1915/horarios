#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para adicionar campos de db2.json nas abas do Google Sheets

Adiciona os campos:
- name: Nome completo do curso
- _da: [horários, dias] - dimensões da grade
- _hd: [[inicio, fim], ...] - horários disponíveis
"""

import json

def load_json(filename):
    """Carrega arquivo JSON"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_db2_csv():
    """Cria CSV com campos de db2 para cada curso"""
    
    print("=" * 60)
    print("🔧 Gerador de CSV para Campos de Configuração (db2)")
    print("=" * 60)
    print()
    
    # Carregar db2.json
    print("📖 Lendo db2.json...")
    db2 = load_json('src/model/db2.json')
    print(f"✅ {len(db2)} configurações de cursos carregadas")
    print()
    
    # Para cada curso, gerar um CSV
    for course_config in db2:
        course_code = course_config['_cu']
        
        print(f"📝 Gerando CSV para curso: {course_code}")
        
        # Nome do arquivo
        filename = f"db2_{course_code}.csv"
        
        # Criar CSV
        with open(filename, 'w', encoding='utf-8') as f:
            # Cabeçalho
            f.write('_cu,name,_da,_hd\n')
            
            # Dados
            name = course_config.get('name', course_code.upper())
            _da = json.dumps(course_config.get('_da', [12, 5]))
            _hd = json.dumps(course_config.get('_hd', []))
            
            # Escrever linha (escapar aspas se necessário)
            f.write(f'"{course_code}","{name}","{_da}","{_hd}"\n')
        
        print(f"   ✅ Arquivo salvo: {filename}")
        print(f"   📊 Campos: _cu, name, _da, _hd")
        print()
    
    print("=" * 60)
    print("✅ TODOS OS ARQUIVOS GERADOS!")
    print("=" * 60)
    print()
    print("📋 Próximos passos:")
    print()
    print("Para cada curso (exemplo: engcomp):")
    print()
    print("  1. Abra sua planilha do Google Sheets")
    print("  2. Clique na aba do curso (ex: 'engcomp')")
    print("  3. Adicione 3 novas colunas à DIREITA:")
    print("     - name")
    print("     - _da")
    print("     - _hd")
    print()
    print("  4. Abra o arquivo 'db2_engcomp.csv'")
    print("  5. Copie os valores de name, _da e _hd")
    print("  6. Cole na PRIMEIRA LINHA de dados (mesma linha do curso)")
    print()
    print("  7. Preencha o campo 'name' para cada disciplina")
    print("     (pode deixar vazio ou copiar o nome da disciplina)")
    print()
    print("  8. Os campos _da e _hd devem ser os MESMOS em todas as linhas")
    print("     (copie para baixo)")
    print()
    print("📌 IMPORTANTE:")
    print("  - O campo 'name' pode variar por disciplina")
    print("  - Os campos '_da' e '_hd' são do CURSO (mesmos para todas)")
    print()

def main():
    try:
        create_db2_csv()
        
        print("💡 Dica: Use Ctrl+D ou Cmd+D no Google Sheets para")
        print("   preencher células abaixo com o mesmo valor!")
        print()
        
    except FileNotFoundError as e:
        print(f"❌ Erro: Arquivo não encontrado - {e}")
        print("   Execute este script na pasta raiz do projeto")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
