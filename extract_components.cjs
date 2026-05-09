const fs = require('fs');
const path = require('path');

function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else {
            if (name.endsWith('.tsx')) {
                allFiles.push(name);
            }
        }
    });
    return allFiles;
}

const pageDirs = [
    path.join('src', 'pages'),
    path.join('src', 'modules', 'doctor', 'pages'),
    path.join('src', 'modules', 'maternity', 'pages'),
    path.join('src', 'modules', 'postpartum', 'pages'),
    path.join('src', 'modules', 'premature', 'pages'),
    path.join('src', 'modules', 'puberty', 'pages')
];

let output = '# Page Component Inventory\n\n';

pageDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = getFiles(dir);
    output += `## ${dir}\n\n`;
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const imports = content.match(/import\s+[\s\S]*?from\s+['"](.+?)['"]/g) || [];
        const components = [];
        
        imports.forEach(imp => {
            // Very basic extraction of component-like names
            const match = imp.match(/import\s+({?[\s\S]*?}?)\s+from/);
            if (match) {
                const names = match[1].replace(/[{}]/g, '').split(',').map(s => s.trim().split(' as ')[0]);
                names.forEach(name => {
                    if (name && /^[A-Z]/.test(name) && !['React', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext'].includes(name)) {
                        components.push(name);
                    }
                });
            }
        });
        
        const relativePath = path.relative('src', file);
        output += `### ${relativePath}\n`;
        if (components.length > 0) {
            output += components.map(c => `- ${c}`).join('\n') + '\n\n';
        } else {
            output += '_No external components imported._\n\n';
        }
    });
});

fs.writeFileSync('COMPONENTS_LIST.md', output);
console.log('Finished extracting components.');
