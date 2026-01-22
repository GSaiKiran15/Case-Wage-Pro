
import csv
import json
import os

csv_file_path = r"data\OFLC_Wages_2025-26_Updated\geography.csv"
json_file_path = r"frontend\data\geography.json"

geography = {}

try:
    with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['State'] in geography:
                geography[row['State']].append(row['CountyTownName'])
            else:
                geography[row['State']] = []
                geography[row['State']].append(row['CountyTownName'])

    # write to json file
    with open(json_file_path, mode='w', encoding='utf-8') as jsonfile:
        json.dump(geography, jsonfile, indent=2)

    print(f"Successfully converted {len(geography)} occupations to {json_file_path}")

except FileNotFoundError:
    print(f"Error: File not found at {csv_file_path}")
except Exception as e:
    print(f"An error occurred: {e}")
