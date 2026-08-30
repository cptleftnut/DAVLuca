with open('src/contexts/CaseDataContext.tsx', 'r') as f:
    content = f.read()

replacements = [
    ('DEFAULT_PARTIES_DATA', '[]'),
    ('DEFAULT_DOCUMENT_FINDINGS', '[]'),
    ('DEFAULT_TRANSCRIPT_SNIPPETS', '[]'),
    ('DEFAULT_SERIOUS_CLAIMS', '[]'),
    ('DEFAULT_TIMELINE_EVENTS', '[]'),
    ('DEFAULT_CONTROL_QUEUE_ITEMS', '[]'),
    ('DEFAULT_INFOGRAPHICS_DATA', '[]'),
    ('DEFAULT_CASE_SUMMARY', '{\n      caseNumber: "CAS-" + new Date().getFullYear() + "-NEW",\n      caseName: "Ny Aktiv Efterforskning",\n      status: "Active Investigation",\n      leadInvestigator: "Sagsansvarlig",\n      dateOpened: new Date().toISOString().split(\'T\')[0]\n    }')
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/contexts/CaseDataContext.tsx', 'w') as f:
    f.write(content)
