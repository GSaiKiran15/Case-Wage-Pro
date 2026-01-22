
import csv
import json
import os

csv_file_path = r"data\OFLC_Wages_2025-26_Updated\oes_soc_occs.csv"
json_file_path = r"frontend\data\occupations.json"

occupations = []

try:
    with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Create a label in the format "Title - SOC Code"
            label = f"{row['Title']} - {row['soccode']}"
            occupations.append({
                "value": row['soccode'],
                "label": label,
                "title": row['Title'],
                "description": row['Description'],
                "embedding_text": f"{row['Title']}, {row['Description']}"
            })

    # write to json file
    with open(json_file_path, mode='w', encoding='utf-8') as jsonfile:
        json.dump(occupations, jsonfile, indent=2)

    print(f"Successfully converted {len(occupations)} occupations to {json_file_path}")

except FileNotFoundError:
    print(f"Error: File not found at {csv_file_path}")
except Exception as e:
    print(f"An error occurred: {e}")
