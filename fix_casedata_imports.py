import re

with open('src/contexts/CaseDataContext.tsx', 'r') as f:
    content = f.read()

# Just remove the import block from '../data/caseData' completely
pattern = r"import \{\n.*?\n\} from '\.\./data/caseData';"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/contexts/CaseDataContext.tsx', 'w') as f:
    f.write(content)
