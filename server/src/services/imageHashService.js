import crypto from 'crypto';
import sharp from 'sharp';

const DEFAULT_SIZE = 32;

function createHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function normalizeImageBuffer(imageBuffer) {
  return sharp(imageBuffer)
    .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .removeAlpha()
    .toFormat('jpeg', { quality: 90 })
    .toBuffer();
}

export async function computeFileFingerprint(fileBuffer) {
  const normalized = await normalizeImageBuffer(fileBuffer);
  const hash = createHash(normalized);
  return hash;
}

export async function computePerceptualHash(fileBuffer) {
  const normalized = await normalizeImageBuffer(fileBuffer);
  const image = sharp(normalized).grayscale().resize(DEFAULT_SIZE, DEFAULT_SIZE, { fit: 'fill' });
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    sum += data[i];
  }
  const avg = sum / data.length;

  let hashBits = '';
  for (let x = 0; x < DEFAULT_SIZE; x += 1) {
    for (let y = 0; y < DEFAULT_SIZE; y += 1) {
      const idx = (y * DEFAULT_SIZE + x) * 1;
      const value = data[idx];
      hashBits += value >= avg ? '1' : '0';
    }
  }

  let hash = '';
  for (let i = 0; i < hashBits.length; i += 4) {
    const chunk = hashBits.slice(i, i + 4);
    hash += chunk ? parseInt(chunk, 2).toString(16) : '0';
  }

  return hash.slice(0, 32);
}

export function calculateSimilarityScore(hashA, hashB) {
  if (!hashA || !hashB || hashA === hashB) {
    return 100;
  }

  const maxLength = Math.max(hashA.length, hashB.length);
  let differences = 0;
  for (let i = 0; i < maxLength; i += 1) {
    const a = hashA[i] || '0';
    const b = hashB[i] || '0';
    if (a !== b) differences += 1;
  }

  const similarity = (1 - differences / maxLength) * 100;
  return Math.max(0, Math.min(100, Number(similarity.toFixed(2))));
}

export function getDuplicateStatus(similarity, config) {
  if (similarity >= config.duplicateThreshold) return 'DUPLICATE';
  if (similarity >= config.possibleDuplicateThreshold) return 'POSSIBLE DUPLICATE';
  return 'NEW';
}
