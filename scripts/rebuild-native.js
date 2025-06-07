const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Rebuilding native modules for target platform...');

const backendPath = path.join(__dirname, '..', 'backend-sqlite');

try {
    // Change to backend directory
    process.chdir(backendPath);

    console.log('📍 Working directory:', process.cwd());

    // Remove existing node_modules to ensure clean rebuild
    const nodeModulesPath = path.join(backendPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        console.log('🗑️  Removing existing node_modules...');
        fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }

    // Install dependencies fresh
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Rebuild native modules for Electron
    console.log('🔨 Rebuilding native modules for Electron...');
    execSync('npx @electron/rebuild', { stdio: 'inherit' });

    console.log('✅ Native modules rebuilt successfully!');

} catch (error) {
    console.error('❌ Error rebuilding native modules:', error.message);

    // Fallback: try to install sqlite3 with specific options
    try {
        console.log('🔄 Trying fallback: reinstalling sqlite3...');
        execSync('npm install sqlite3 --build-from-source', { stdio: 'inherit' });
        console.log('✅ SQLite3 installed from source!');
    } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError.message);
        process.exit(1);
    }
}
