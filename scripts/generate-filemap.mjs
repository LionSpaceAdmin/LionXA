#!/usr/bin/env node
/**
 * Generate a flat JSON array of all project files (relative paths), excluding .git and node_modules by default.
 * Usage: node scripts/generate-filemap.mjs personal/aritcector/xagent_files.json
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = process.cwd();
const outPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolve(root, 'personal/aritcector/xagent_files.json');
const EXCLUDE_DIRS = new Set(['.git','node_modules','.next','.mcp']);

async function walk(dir){
  const out = [];
  const items = await readdir(dir, { withFileTypes: true });
  for (const it of items){
    if (EXCLUDE_DIRS.has(it.name)) continue;
    const full = resolve(dir, it.name);
    try{
      const st = await stat(full);
      if (st.isDirectory()){
        out.push(...await walk(full));
      } else if (st.isFile()){
        out.push(relative(root, full));
      }
    }catch{}
  }
  return out;
}

(async ()=>{
  const files = await walk(root);
  await writeFile(outPath, JSON.stringify(files, null, 2), 'utf8');
  console.log('Wrote', outPath, 'files:', files.length);
})();

