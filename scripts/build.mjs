import { readdir, mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'productos');
const output = path.join(root, 'public');
const target = path.join(output, 'productos');
const imagePattern = /\.(avif|webp|png|jpe?g)$/i;
const sortNames = (a, b) => a.name.localeCompare(b.name, 'es', { numeric: true });

async function build() {
  await readFile(path.join(output, 'index.html'), 'utf8');
  await mkdir(source, { recursive: true });
  await mkdir(target, { recursive: true });
  const products = Object.create(null);
  let total = 0;
  const folders = (await readdir(source, { withFileTypes: true })).filter(e => e.isDirectory()).sort(sortNames);
  for (const folder of folders) {
    if (folder.name.startsWith('.')) continue;
    const inputFolder = path.join(source, folder.name);
    const files = (await readdir(inputFolder, { withFileTypes: true })).filter(e => e.isFile() && !e.name.startsWith('.') && imagePattern.test(e.name)).sort(sortNames);
    const images = [];
    for (const file of files) {
      await mkdir(path.join(target, folder.name), { recursive: true });
      await copyFile(path.join(inputFolder, file.name), path.join(target, folder.name, file.name));
      images.push(`/productos/${encodeURIComponent(folder.name)}/${encodeURIComponent(file.name)}`);
      total++;
    }
    products[folder.name] = images;
    console.log(`${folder.name}: ${images.length} imágenes`);
  }
  await writeFile(path.join(target, 'manifest.json'), JSON.stringify({ version: 1, products }, null, 2) + '\n');

  await readFile(path.join(output, 'Favicon Sobreestimulados.png'));
  const favicon = '<link rel="icon" type="image/png" href="/Favicon%20Sobreestimulados.png?v=1">';
  async function addFavicons(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await addFavicons(file);
      else if (entry.isFile() && /\.html$/i.test(entry.name)) {
        const html = await readFile(file, 'utf8');
        const hasIcon = /<link\b[^>]*\brel\s*=\s*["'][^"']*\bicon\b[^"']*["']/i.test(html);
        if (!hasIcon && /<\/head\s*>/i.test(html)) {
          await writeFile(file, html.replace(/<\/head\s*>/i, favicon + '\n</head>'));
          console.log(`Favicon añadido: ${path.relative(output, file)}`);
        }
      }
    }
  }
  await addFavicons(output);
  console.log(`Build listo: ${total} imágenes. Manifest: public/productos/manifest.json`);
}
build().catch(error => { console.error('Error de build:', error); process.exitCode = 1; });
