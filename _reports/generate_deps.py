import json
import yaml

# Load package.json
with open('/Users/danielions/LionXA/package.json', 'r') as f:
    package_json = json.load(f)

dependencies = package_json.get('dependencies', {})
dev_dependencies = package_json.get('devDependencies', {})

# Load pnpm-lock.yaml
with open('/Users/danielions/LionXA/pnpm-lock.yaml', 'r') as f:
    pnpm_lock = yaml.safe_load(f)

# Generate SBOM
sbom = {
    'dependencies': [],
    'dev_dependencies': []
}

for name, version in dependencies.items():
    sbom['dependencies'].append({'name': name, 'version': version})

for name, version in dev_dependencies.items():
    sbom['dev_dependencies'].append({'name': name, 'version': version})

with open('/Users/danielions/LionXA/_reports/sbom.json', 'w') as f:
    json.dump(sbom, f, indent=2)

# Generate dependency graph
deps_graph = {
    'nodes': [],
    'links': []
}

all_deps = {**dependencies, **dev_dependencies}

for dep_name, dep_version in all_deps.items():
    deps_graph['nodes'].append({'id': dep_name, 'version': dep_version})

if 'packages' in pnpm_lock:
    for package_name, package_info in pnpm_lock['packages'].items():
        # package_name is like '/@babel/core@7.28.4'
        # or '/@babel/preset-env@7.28.3(@babel/core@7.28.4)'
        
        # simplified parsing of package_name
        parts = package_name.split('/')
        name_with_version = parts[-1]
        if '@' in name_with_version:
            name = name_with_version.split('@')[0]
            if not name: # handle scoped packages like /@babel/core@7.28.4
                name = '@' + parts[-2]

            if 'dependencies' in package_info:
                for child_dep_name, child_dep_version in package_info['dependencies'].items():
                    deps_graph['links'].append({'source': name, 'target': child_dep_name})

with open('/Users/danielions/LionXA/_reports/deps-graph.json', 'w') as f:
    json.dump(deps_graph, f, indent=2)
