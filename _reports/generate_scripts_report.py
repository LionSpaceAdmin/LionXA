import json
import os

# Load package.json
with open('/Users/danielions/LionXA/package.json', 'r') as f:
    package_json = json.load(f)

scripts = package_json.get('scripts', {})
scripts_report = {
    'scripts': [],
    'hooks': {}
}

for name, command in scripts.items():
    script_info = {
        'name': name,
        'command': command,
        'validation': []
    }
    
    # Simple validation: check if files mentioned in the script exist
    parts = command.split()
    for part in parts:
        if os.path.exists(part):
            script_info['validation'].append({'part': part, 'status': 'found'})
        # A more sophisticated parser would be needed for more complex commands
        # For now, this is a simple check

    scripts_report['scripts'].append(script_info)

# Check for hooks
if 'husky' in package_json:
    scripts_report['hooks']['husky'] = package_json['husky']
if 'lint-staged' in package_json:
    scripts_report['hooks']['lint-staged'] = package_json['lint-staged']

with open('/Users/danielions/LionXA/_reports/scripts-report.json', 'w') as f:
    json.dump(scripts_report, f, indent=2)
