// Leonida Trophy Guide — a make.fun gta6-trophy-guide-01 entry (Node 22, stdlib only).
//
// The entry is the app/ folder beside this file: plain static files a browser opens
// at app/index.html (an ES module, a stylesheet and two JSON data files, no build
// step, nothing fetched over the network). This program hands it in: it copies
// app/ and screenshots/ to $MAKEFUN_OUTPUT_DIR (default /output) and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. vendor/makefun-frontend.ts must stay exactly as it is — the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// One rule matters more than the rest: never remove the output directory itself.
// In the grader /output is a mounted volume whose mount point cannot be removed,
// so deleting it fails the run. This program only creates the directory and copies
// fresh files over what is already there.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Clear only the CONTENTS of a directory, never the directory itself: in the
// grader /output is a mounted volume and its mount point cannot be unlinked,
// so deleting the directory fails the run. Removing the entries inside it is
// safe, and it keeps a re-run from leaving stale files behind.
function clearContents(dir: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

// Create the output directory if it is missing, but never remove it: in the
// grader it is a mounted volume and its mount point cannot be unlinked.
mkdirSync(out, { recursive: true });
clearContents(join(out, 'app'));
clearContents(join(out, 'screenshots'));
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, none over 256 KiB; app/ holds at
// most 993 files and directories and 48 MiB. Only text_max_bytes shapes the
// dossier's bytes; the other caps refuse an entry the scorer would refuse.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
