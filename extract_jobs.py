import csv
import json
import os

csv_path = 'data/OFLC_Wages_2025-26_Updated/oes_soc_occs.csv'
json_path = 'frontend/data/jobs.json'

job_titles = []

try:
    with open(csv_path, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if 'Title' in row:
                job_titles.append(row['Title'])
    
    # Remove duplicates and sort if needed
    job_titles = sorted(list(set(job_titles)))

    with open(json_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(job_titles, jsonfile, indent=2)
        
    print(f"Successfully extracted {len(job_titles)} job titles to {json_path}")

except Exception as e:
    print(f"Error: {e}")
