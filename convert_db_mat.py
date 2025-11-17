#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter db_mat.json para o formato do db.json e exportar como CSV

Transformações:
1. _ho: [[false, false...], [...]] → [[dia, hora], [dia, hora]]
2. Adicionar campos faltantes: _au, _ha, _da
3. Exportar como CSV para importar no Google Sheets
"""

import json
import csv

def transform_ho(ho_matrix):
    """
    Transforma matriz de horários em lista de coordenadas
    
    De: [[false, true, false...], [true, false...], ...]
    Para: [[0, 1], [1, 0], ...]
    """
    new_ho = []
    if not isinstance(ho_matrix, list):
        return []
    
    for dia_idx, dia in enumerate(ho_matrix):
        if not isinstance(dia, list):
            continue
        for hora_idx, val in enumerate(dia):
            if val:  # Se True ou truthy
                new_ho.append([dia_idx, hora_idx])
    
    return new_ho

def transform_db_mat():
    """Transforma db_mat.json para o formato padrão"""
    
    print("📖 Lendo db_mat.json...")
    with open('src/model/db_mat.json', 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    print(f"✅ {len(db)} disciplinas carregadas")
    
    transformed = []
    
    for idx, item in enumerate(db):
        # Transformar _ho
        if '_ho' in item:
            item['_ho'] = transform_ho(item['_ho'])
        else:
            item['_ho'] = []
        
        # Adicionar campos faltantes se não existirem
        if '_au' not in item:
            item['_au'] = ''
        
        if '_ha' not in item:
            item['_ha'] = []
        
        if '_da' not in item:
            item['_da'] = ''
        
        # Garantir ordem dos campos (igual ao db.json)
        ordered_item = {
            '_cu': item.get('_cu', 'matematica'),
            '_se': item.get('_se', 0),
            '_di': item.get('_di', ''),
            '_re': item.get('_re', ''),
            '_ap': item.get('_ap', 0),
            '_at': item.get('_at', 0),
            '_el': item.get('_el', False),
            '_ag': item.get('_ag', False),
            '_pr': item.get('_pr', []),
            '_ho': item['_ho'],
            '_au': item['_au'],
            '_ha': item['_ha'],
            '_da': item['_da']
        }
        
        transformed.append(ordered_item)
    
    print(f"✅ {len(transformed)} disciplinas transformadas")
    
    return transformed

def save_json(data, filename):
    """Salva dados em JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON salvo: {filename}")

def save_csv(data, filename):
    """Salva dados em CSV para Google Sheets"""
    
    if not data:
        print("⚠️ Nenhum dado para salvar")
        return
    
    # Campos do CSV
    fieldnames = ['_cu', '_se', '_di', '_re', '_ap', '_at', '_el', '_ag', '_pr', '_ho', '_au', '_ha', '_da']
    
    with open(filename, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        # Escrever cabeçalho
        writer.writeheader()
        
        # Escrever linhas
        for item in data:
            # Converter listas e booleanos para strings
            row = item.copy()
            row['_pr'] = json.dumps(row['_pr'], ensure_ascii=False) if row['_pr'] else '[]'
            row['_ho'] = json.dumps(row['_ho'], ensure_ascii=False) if row['_ho'] else '[]'
            row['_ha'] = json.dumps(row['_ha'], ensure_ascii=False) if row['_ha'] else '[]'
            row['_el'] = str(row['_el']).lower()
            row['_ag'] = str(row['_ag']).lower()
            
            writer.writerow(row)
    
    print(f"💾 CSV salvo: {filename}")
    print(f"📊 {len(data)} linhas + 1 cabeçalho")

def main():
    print("=" * 60)
    print("🔧 Conversor db_mat.json → db.json + CSV")
    print("=" * 60)
    print()
    
    try:
        # Transformar dados
        transformed_data = transform_db_mat()
        
        print()
        print("-" * 60)
        print("💾 Salvando arquivos...")
        print("-" * 60)
        
        # Salvar JSON transformado
        save_json(transformed_data, 'src/model/db_mat_transformed.json')
        
        # Salvar CSV
        save_csv(transformed_data, 'db_mat_matematica.csv')
        
        print()
        print("=" * 60)
        print("✅ CONVERSÃO COMPLETA!")
        print("=" * 60)
        print()
        print("📁 Arquivos gerados:")
        print("  1. src/model/db_mat_transformed.json - JSON no formato padrão")
        print("  2. db_mat_matematica.csv - CSV para importar no Google Sheets")
        print()
        print("📋 Próximos passos:")
        print("  1. Abra o Google Sheets")
        print("  2. Vá para a aba 'matematica'")
        print("  3. Arquivo > Importar > Fazer upload")
        print("  4. Selecione 'db_mat_matematica.csv'")
        print("  5. Escolha 'Substituir planilha atual'")
        print("  6. Clique em 'Importar dados'")
        print()
        
        # Mostrar amostra
        print("🔍 Amostra dos primeiros registros:")
        print("-" * 60)
        for i, item in enumerate(transformed_data[:3]):
            print(f"\n{i+1}. {item['_re']} - {item['_di']}")
            print(f"   Período: {item['_se']} | AP: {item['_ap']} | AT: {item['_at']}")
            print(f"   Horários: {item['_ho']}")
            if item['_pr']:
                print(f"   Pré-requisitos: {item['_pr']}")
        
        if len(transformed_data) > 3:
            print(f"\n   ... e mais {len(transformed_data) - 3} disciplinas")
        
    except FileNotFoundError:
        print("❌ Erro: Arquivo 'src/model/db_mat.json' não encontrado!")
        print("   Verifique se o arquivo existe no caminho correto.")
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao ler JSON: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
