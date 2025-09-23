import json
import random
import os

with open('/Users/danielions/LionXA/_reports/inventory.json', 'r') as f:
    inventory = json.load(f)

all_files = []
for file_type, files in inventory['files_by_type'].items():
    all_files.extend(files)

random_files = random.sample(all_files, 5)

print("Spot-checking 5 random files from inventory.json:")
for file_path in random_files:
    # The paths in inventory.json are relative to the project root, 
    # but start with './'. I need to construct the full path.
    full_path = os.path.join("/Users/danielions/LionXA", file_path.lstrip('./'))
    if os.path.exists(full_path):
        print(f"- {full_path}: OK")
    else:
        print(f"- {full_path}: NOT FOUND")
