with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("import * as express from 'express';", "import express from 'express';")
content = content.replace("import * as path from 'path';", "import path from 'path';")
content = content.replace("import * as dotenv from 'dotenv';", "import dotenv from 'dotenv';")

with open('server.ts', 'w') as f:
    f.write(content)
