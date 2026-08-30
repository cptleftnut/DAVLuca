with open('src/contexts/CaseDataContext.tsx', 'r') as f:
    content = f.read()

types_import = """import {
  Party,
  DocumentFinding,
  TranscriptSnippet,
  SeriousClaim,
  TimelineEvent,
  ControlQueueItem,
  InfographicItem,
  CaseSummary
} from '../types';
"""

if "import { Party" not in content:
    content = content.replace("import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';\n", 
                              "import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';\n" + types_import)

with open('src/contexts/CaseDataContext.tsx', 'w') as f:
    f.write(content)
