import Design from '../models/Design.js';
import { calculateSimilarityScore, computeFileFingerprint, computePerceptualHash, getDuplicateStatus } from './imageHashService.js';
import { env } from '../config/env.js';

const duplicateConfig = {
  duplicateThreshold: env.duplicateThreshold,
  possibleDuplicateThreshold: env.possibleDuplicateThreshold
};

export async function checkDuplicateDesign(fileBuffer, excludeId = null) {
  const fingerprint = await computeFileFingerprint(fileBuffer);
  const perceptualHash = await computePerceptualHash(fileBuffer);

  const existingDesigns = await Design.find({}).lean();
  let bestMatch = null;

  for (const design of existingDesigns) {
    if (excludeId && String(design._id) === String(excludeId)) continue;

    if (design.imageFingerprint && design.imageFingerprint === fingerprint) {
      return {
        isDuplicate: true,
        similarity: 100,
        status: 'DUPLICATE',
        design: design,
        fingerprint,
        perceptualHash
      };
    }

    const currentHash = design.imageHash || '';
    if (!currentHash) continue;

    const similarity = calculateSimilarityScore(perceptualHash, currentHash);
    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = {
        similarity,
        status: getDuplicateStatus(similarity, duplicateConfig),
        design
      };
    }
  }

  if (!bestMatch) {
    return {
      isDuplicate: false,
      similarity: 0,
      status: 'NEW',
      design: null,
      fingerprint,
      perceptualHash
    };
  }

  return {
    isDuplicate: bestMatch.similarity >= duplicateConfig.duplicateThreshold,
    similarity: bestMatch.similarity,
    status: bestMatch.status,
    design: bestMatch.design,
    fingerprint,
    perceptualHash
  };
}

export async function bulkCheckDuplicates(fileBuffers) {
  const results = [];
  for (const fileBuffer of fileBuffers) {
    const match = await checkDuplicateDesign(fileBuffer);
    results.push({
      ...match,
      fileName: fileBuffer.originalname || 'upload'
    });
  }
  return results;
}
