import re

with open('src/contexts/CaseDataContext.tsx', 'r') as f:
    content = f.read()

content = content.replace('"Ny Aktiv Efterforskning"', '"Lyngby-Taarbæk Sagen & DAVLuca Forensic Audit"')
content = content.replace("'Ny Aktiv Efterforskning'", "'Lyngby-Taarbæk Sagen & DAVLuca Forensic Audit'")

with open('src/contexts/CaseDataContext.tsx', 'w') as f:
    f.write(content)
