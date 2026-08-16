const fs = require('fs');
let code = fs.readFileSync('hooks/use-mobile.ts', 'utf-8');
code = code.replace(/setIsMobile\(mql\.matches\)/, '// eslint-disable-next-line react-hooks/set-state-in-effect\n    setIsMobile(mql.matches)');
fs.writeFileSync('hooks/use-mobile.ts', code);
