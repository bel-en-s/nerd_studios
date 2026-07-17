#!/usr/bin/env node

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8090';
const GALLERY_DIR = 'public/images/gallery';
const IMAGES_PER_PRODUCT = 3;

async function main() {
  const email = process.env.PB_ADMIN_EMAIL;
  const password = process.env.PB_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Faltan credenciales. Configurá PB_ADMIN_EMAIL y PB_ADMIN_PASSWORD.');
    process.exit(1);
  }

  // 1. Health check
  try {
    await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error(`No se puede conectar a PocketBase en ${API_URL}. ¿Está corriendo?`);
    process.exit(1);
  }

  // 2. Auth
  console.log(`Autenticando en ${API_URL}...`);
  const authRes = await fetch(`${API_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });

  if (!authRes.ok) {
    const err = await authRes.text();
    console.error(`Error de autenticacion (${authRes.status}): ${err}`);
    process.exit(1);
  }

  const { token } = await authRes.json();
  const authHeaders = { Authorization: token };

  // 3. List products
  console.log('Obteniendo productos...');
  const productsRes = await fetch(
    `${API_URL}/api/collections/products/records?perPage=200`,
    { headers: authHeaders },
  );
  if (!productsRes.ok) {
    console.error('Error al obtener productos:', await productsRes.text());
    process.exit(1);
  }
  const { items: products } = await productsRes.json();
  console.log(`  ${products.length} producto(s) encontrado(s)`);

  if (products.length === 0) {
    console.log('No hay productos. Ejecutá primero el seed.');
    process.exit(0);
  }

  // 4. Read gallery images
  const fs = await import('node:fs');
  const path = await import('node:path');

  const galleryFiles = fs.readdirSync(GALLERY_DIR).filter((f) =>
    /\.(webp|png|jpg|jpeg|avif)$/i.test(f),
  );

  if (galleryFiles.length === 0) {
    console.error(`No se encontraron imagenes en ${GALLERY_DIR}`);
    process.exit(1);
  }
  console.log(`  ${galleryFiles.length} imagenes disponibles en gallery`);

  // 5. Assign random images to each product and upload
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let pool = shuffle(galleryFiles);
  let poolIdx = 0;
  let uploaded = 0;
  let errors = 0;

  for (const product of products) {
    const picks = [];
    for (let i = 0; i < IMAGES_PER_PRODUCT; i++) {
      if (poolIdx >= pool.length) {
        pool = shuffle(galleryFiles);
        poolIdx = 0;
      }
      picks.push(pool[poolIdx++]);
    }

    const formData = new FormData();
    for (const fname of picks) {
      const fpath = path.resolve(GALLERY_DIR, fname);
      const buf = fs.readFileSync(fpath);
      const ext = path.extname(fname).toLowerCase();
      const mime =
        ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.avif'
              ? 'image/avif'
              : 'image/webp';
      const blob = new Blob([buf], { type: mime });
      formData.append('images', blob, fname);
    }

    const updateRes = await fetch(
      `${API_URL}/api/collections/products/records/${product.id}`,
      { method: 'PATCH', headers: authHeaders, body: formData },
    );

    if (updateRes.ok) {
      console.log(`${product.slug}: ${picks.join(', ')}`);
      uploaded++;
    } else {
      const errText = await updateRes.text();
      console.error(`${product.slug}: error (${updateRes.status}): ${errText}`);
      errors++;
    }
  }

  console.log(`\nListo. ${uploaded} producto(s) actualizados, ${errors} error(es).`);
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
