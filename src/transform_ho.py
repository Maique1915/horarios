import json

with open('src/model/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

for item in db:
    if '_ho' in item and isinstance(item['_ho'], list):
        new_ho = []
        for dia_idx, dia in enumerate(item['_ho']):
            for hora_idx, val in enumerate(dia):
                if val:
                    new_ho.append([dia_idx, hora_idx])
        item['_ho'] = new_ho

with open('src/model/db_new.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)