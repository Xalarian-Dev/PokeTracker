const fs = require('fs');
const path = 'c:\\Users\\omega\\Documents\\Xalarian-Dev\\PokeTracker\\data\\games.ts';

try {
    let content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        // Match lines like:     '1': ['r', 'b', ...],
        const match = line.match(/^(\s*)'(\d+)': \[(.*)\],$/);
        if (match) {
            const indent = match[1];
            const id = parseInt(match[2], 10);
            const existing = match[3];

            if (id >= 1 && id <= 718) {
                // Parse existing entries to avoid duplicates
                // The list string is like "'r', 'b', 'ye'"
                // flexible split
                let parts = existing.split(',').map(s => s.trim()).filter(s => s.length > 0);

                let hasX = parts.some(p => p.includes("'x'"));
                let hasY = parts.some(p => p.includes("'y'"));

                if (!hasX) parts.push("'x'");
                if (!hasY) parts.push("'y'");

                return `${indent}'${id}': [${parts.join(', ')}],`;
            }
        }
        return line;
    });

    fs.writeFileSync(path, newLines.join('\n'), 'utf8');
    console.log('Successfully updated games.ts');
} catch (err) {
    console.error('Error updating file:', err);
}
