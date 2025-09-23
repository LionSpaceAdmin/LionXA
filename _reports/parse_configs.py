import json
import yaml
import toml
import re
import os

config_files = [
    "/Users/danielions/LionXA/_reports/inventory.json",
    "/Users/danielions/LionXA/fix_and_enhance_report.json",
    "/Users/danielions/LionXA/architecture_analysis_report.json",
    "/Users/danielions/LionXA/project_map.json",
    "/Users/danielions/LionXA/p3_rebuild_report.json",
    "/Users/danielions/LionXA/p1_investigation_report.json",
    "/Users/danielions/LionXA/package.json",
    "/Users/danielions/LionXA/.claude/settings.local.json",
    "/Users/danielions/LionXA/tsconfig.node.json",
    "/Users/danielions/LionXA/tsconfig.json",
    "/Users/danielions/LionXA/pnpm-lock.yaml",
    "/Users/danielions/LionXA/pnpm-workspace.yaml",
    "/Users/danielions/LionXA/config/policy_allow_all.yaml",
    "/Users/danielions/LionXA/config/policy.yaml",
    "/Users/danielions/LionXA/docker-compose.yml",
    "/Users/danielions/LionXA/.github/workflows/terraform.yml",
    "/Users/danielions/LionXA/.github/workflows/gemini-dispatch.yml",
    "/Users/danielions/LionXA/.github/workflows/gemini-scheduled-triage.yml",
    "/Users/danielions/LionXA/.github/workflows/e2e.yml",
    "/Users/danielions/LionXA/.github/workflows/ci.yml",
    "/Users/danielions/LionXA/.github/workflows/gemini-triage.yml",
    "/Users/danielions/LionXA/.github/workflows/gemini-review.yml",
    "/Users/danielions/LionXA/.github/workflows/gemini-invoke.yml",
    "/Users/danielions/LionXA/services/backend/pyproject.toml",
    "/Users/danielions/LionXA/.env.backup",
    "/Users/danielions/LionXA/.env.example",
    "/Users/danielions/LionXA/infra/guacamole/guacamole.properties",
    "/Users/danielions/LionXA/infra/terraform/.terraform.lock.hcl",
    "/Users/danielions/LionXA/infra/terraform/variables.tf",
    "/Users/danielions/LionXA/infra/terraform/outputs.tf",
    "/Users/danielions/LionXA/infra/terraform/main.tf",
    "/Users/danielions/LionXA/infra/terraform/providers.tf",
    "/Users/danielions/LionXA/infra/terraform/backend.tf",
    "/Users/danielions/LionXA/infra/terraform/prod.auto.tfvars",
    "/Users/danielions/LionXA/infra/terraform/input.tfvars"
]

config_report = {}

def parse_env(content):
    config = {}
    for line in content.splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            config[key.strip()] = value.strip()
    return config

def parse_properties(content):
    config = {}
    for line in content.splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            config[key.strip()] = value.strip()
    return config

def parse_tf(content):
    config = {}
    # This is a very basic regex and might not cover all cases
    variable_regex = re.compile(r'variable\s+"([^"]+)"\s+\{([^}]+)''', re.DOTALL)
    for match in variable_regex.finditer(content):
        var_name = match.group(1)
        var_body = match.group(2)
        default_match = re.search(r'default\s*=\s*(.*)', var_body)
        if default_match:
            config[var_name] = default_match.group(1).strip()
    return config
    
def parse_tfvars(content):
    config = {}
    for line in content.splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            config[key.strip()] = value.strip().strip('"')
    return config

for file_path in config_files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            _, extension = os.path.splitext(file_path)
            
            if extension == '.json':
                config_report[file_path] = json.loads(content)
            elif extension in ['.yaml', '.yml']:
                config_report[file_path] = yaml.safe_load(content)
            elif extension == '.toml':
                config_report[file_path] = toml.loads(content)
            elif '.env' in os.path.basename(file_path):
                config_report[file_path] = parse_env(content)
            elif extension == '.properties':
                config_report[file_path] = parse_properties(content)
            elif extension == '.tf':
                config_report[file_path] = parse_tf(content)
            elif extension == '.tfvars':
                config_report[file_path] = parse_tfvars(content)
            elif extension == '.hcl':
                # Basic parsing for .hcl, similar to .tfvars for now
                config_report[file_path] = parse_tfvars(content)

    except Exception as e:
        config_report[file_path] = {'error': str(e)}

with open('/Users/danielions/LionXA/_reports/config-report.json', 'w') as f:
    json.dump(config_report, f, indent=2)
