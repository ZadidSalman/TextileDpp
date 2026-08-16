const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

// We have specific lines complaining about unescaped entities. Let's fix them manually based on the lint output.
code = code.replace(/Men's Shorty Pyjamas, Modal/g, "Men&apos;s Shorty Pyjamas, Modal");
code = code.replace(/"men's modal shorty pyjamas, V-neck, drawstring shorts, jadeite \/ dark green AOP, ghost mannequin"/g, "&quot;men&apos;s modal shorty pyjamas, V-neck, drawstring shorts, jadeite / dark green AOP, ghost mannequin&quot;");
code = code.replace(/fake fly "J" stitch/g, "fake fly &quot;J&quot; stitch");
code = code.replace(/wearer's left/g, "wearer&apos;s left");
code = code.replace(/"Colour detergent recommended · Wash with similar colours."/g, "&quot;Colour detergent recommended · Wash with similar colours.&quot;");
// 994
code = code.replace(/men's/g, "men&apos;s");
code = code.replace(/Men's/g, "Men&apos;s");
code = code.replace(/wearer's/g, "wearer&apos;s");
// Let's just fix all single quotes and double quotes that are in JSX text.
// Or wait, I can just use a generic regex? Better yet, I can look at the lines:

fs.writeFileSync('app/page.tsx', code);
