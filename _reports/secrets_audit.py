import re

with open('/Users/danielions/LionXA/_reports/secrets.txt', 'r') as f:
    search_output = f.read()

secrets_report = "# Secrets Audit Report\n\n"
secrets_report += "This report lists files and line numbers that may contain secrets. Please review them manually.\n\n"

# This regex is not perfect, but it will do for now.
file_line_regex = re.compile(r"File: (.*)\nL(\d+): .*")

# The search_output is the multiline string from the tool output
# I will process it line by line
for line in search_output.strip().split('---\n'):
    if not line.strip():
        continue
    
    parts = line.strip().split('\n')
    file_path = parts[0].replace('File: ', '').strip()
    
    for entry in parts[1:]:
        line_number_match = re.match(r"L(\d+):", entry)
        if line_number_match:
            line_number = line_number_match.group(1)
            secrets_report += f"- File: `{file_path}`, Line: {line_number}\n"

with open('/Users/danielions/LionXA/_reports/secrets-audit.md', 'w') as f:
    f.write(secrets_report)