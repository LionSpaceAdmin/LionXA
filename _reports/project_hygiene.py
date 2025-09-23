import os
import re
import json

project_root = "/Users/danielions/LionXA"
report = {
    "mixed_js_ts": [],
    "orphaned_files": []
}

# Find mixed JS/TS files
for root, dirs, files in os.walk(project_root):
    # Exclude node_modules and other build artifacts
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
    if '.git' in dirs:
        dirs.remove('.git')

    ts_files = [f for f in files if f.endswith(('.ts', '.tsx'))]
    js_files = [f for f in files if f.endswith(('.js', '.jsx'))]

    if ts_files and js_files:
        report["mixed_js_ts"].append(root)

# Find orphaned files (best effort)
all_ts_files = set()
imported_files = set()

for root, dirs, files in os.walk(os.path.join(project_root, 'src')):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            all_ts_files.add(os.path.join(root, file))

import_regex = re.compile(r"import .* from [\'\"](.*)[\'\"]")

for file_path in all_ts_files:
    with open(file_path, 'r', errors='ignore') as f:
        content = f.read()
        matches = import_regex.findall(content)
        for match in matches:
            # This is a simplification. It doesn't handle relative paths perfectly
            # or aliases without more complex logic.
            imported_file_path = os.path.abspath(os.path.join(os.path.dirname(file_path), match))
            
            # Check for extensions
            for ext in ['.ts', '.tsx', '/index.ts', '/index.tsx']:
                if os.path.exists(imported_file_path + ext):
                    imported_files.add(imported_file_path + ext)
                    break
            else: # if no break
                 if os.path.exists(imported_file_path):
                    imported_files.add(imported_file_path)


report["orphaned_files"] = list(all_ts_files - imported_files)

with open(os.path.join(project_root, '_reports', 'project-hygiene-report.json'), 'w') as f:
    json.dump(report, f, indent=2)