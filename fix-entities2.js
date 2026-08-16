const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

// 994
code = code.replace(/elastane's/g, "elastane&apos;s");
// 1003
code = code.replace(/don't/g, "don&apos;t");
// 1035
code = code.replace(/modal's/g, "modal&apos;s");
// 1046
code = code.replace(/"stretch-blend"/g, "&quot;stretch-blend&quot;");
// 1067
code = code.replace(/can't/g, "can&apos;t");

fs.writeFileSync('app/page.tsx', code);
