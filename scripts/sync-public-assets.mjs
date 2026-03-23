/**
 * Copy asset folders into public/ so production builds work without symlinks
 * (Vite + Linux CI often break on symlinked public dirs).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** [source under assets/, dest under public/assets/] */
const mappings = [
  ['Cards', 'Cards'],
  ['Hover', 'Hover'],
  ['Misc', 'Misc'],
  ['TNF', 'TNF'],
  ['Meraki', 'meraki'],
];

mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });

for (const [srcName, destName] of mappings) {
  const src = path.join(root, 'assets', srcName);
  const dest = path.join(root, 'public', 'assets', destName);
  if (!existsSync(src)) {
    throw new Error(`sync-public-assets: missing ${path.join('assets', srcName)}`);
  }
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}
