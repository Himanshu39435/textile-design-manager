import mongoose from 'mongoose';
import Design from '../models/Design.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { checkDuplicateDesign } from '../services/duplicateDetectionService.js';
import { calculateSimilarityScore, computeFileFingerprint, computePerceptualHash } from '../services/imageHashService.js';
import { env } from '../config/env.js';

function normalizeDesignInput(data) {
  const description = String(data.description ?? data.notes ?? '').trim();
  return {
    designNumber: String(data.designNumber || '').trim(),
    size: String(data.size || '').trim(),
    rate: Number(data.rate),
    description,
    notes: description,
  };
}

export async function createDesign(req, res, next) {
  try {
    const { designNumber, size, rate, description, notes } = normalizeDesignInput(req.body);
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'Photo is required.' });
    }

    if (!designNumber) {
      return res.status(400).json({ success: false, message: 'Design Number is required.' });
    }

    if (!size) {
      return res.status(400).json({ success: false, message: 'Size is required.' });
    }

    if (Number.isNaN(rate) || rate < 0) {
      return res.status(400).json({ success: false, message: 'Rate must be numeric and >= 0.' });
    }

    const duplicate = await checkDuplicateDesign(imageFile.buffer, null);
    if (duplicate.isDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Possible Duplicate Design Found',
        duplicate: {
          ...duplicate,
          design: duplicate.design ? {
            _id: duplicate.design._id,
            designNumber: duplicate.design.designNumber,
            rate: duplicate.design.rate,
            imageUrl: duplicate.design.imageUrl,
            createdAt: duplicate.design.createdAt
          } : null
        }
      });
    }

    const uploadResult = await uploadToCloudinary(imageFile.buffer, imageFile.originalname);
    const fingerprint = await computeFileFingerprint(imageFile.buffer);
    const perceptualHash = await computePerceptualHash(imageFile.buffer);

    const design = await Design.create({
      designNumber,
      size,
      rate,
      description,
      notes,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      imageHash: perceptualHash,
      imageFingerprint: fingerprint,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json({ success: true, data: design });
  } catch (error) {
    next(error);
  }
}

export async function listDesigns(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'rate-low': { rate: 1, createdAt: -1 },
      'rate-high': { rate: -1, createdAt: -1 }
    };
    const sortKey = String(req.query.sort || 'newest');
    const sort = sortOptions[sortKey];

    if (!sort) {
      return res.status(400).json({ success: false, message: 'Invalid sort option.' });
    }

    const minRate = req.query.minRate === undefined || req.query.minRate === '' ? null : Number(req.query.minRate);
    const maxRate = req.query.maxRate === undefined || req.query.maxRate === '' ? null : Number(req.query.maxRate);

    if ((minRate !== null && (!Number.isFinite(minRate) || minRate < 0)) ||
        (maxRate !== null && (!Number.isFinite(maxRate) || maxRate < 0))) {
      return res.status(400).json({ success: false, message: 'Rate filters must be valid non-negative numbers.' });
    }

    if (minRate !== null && maxRate !== null && minRate > maxRate) {
      return res.status(400).json({ success: false, message: 'Minimum rate cannot exceed maximum rate.' });
    }

    const query = {};
    const designNumber = String(req.query.designNumber || '').trim();
    const size = String(req.query.size || '').trim();

    if (designNumber) {
      const escapedDesignNumber = designNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.designNumber = { $regex: escapedDesignNumber, $options: 'i' };
    }

    if (size) {
      const escapedSize = size.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.size = { $regex: `^${escapedSize}$`, $options: 'i' };
    }

    if (minRate !== null || maxRate !== null) {
      query.rate = {};
      if (minRate !== null) query.rate.$gte = minRate;
      if (maxRate !== null) query.rate.$lte = maxRate;
    }

    const [designs, total] = await Promise.all([
      Design.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Design.countDocuments(query)
    ]);

    return res.json({ success: true, data: designs, total, page, limit });
  } catch (error) {
    next(error);
  }
}

export async function searchByDesignNumber(req, res, next) {
  try {
    const { designNumber } = req.query;
    if (!designNumber) {
      return res.status(400).json({ success: false, message: 'Design Number is required.' });
    }

    const designs = await Design.find({ designNumber: { $regex: designNumber, $options: 'i' } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({ success: true, data: designs });
  } catch (error) {
    next(error);
  }
}

export async function getDesignById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid design id.' });
    }

    const design = await Design.findById(id).lean();
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found.' });
    }

    return res.json({ success: true, data: design });
  } catch (error) {
    next(error);
  }
}

export async function updateDesign(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await Design.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Design not found.' });
    }

    const payload = normalizeDesignInput(req.body);
    const imageFile = req.file;

    if (payload.designNumber && existing.designNumber !== payload.designNumber) {
      const duplicateDesign = await Design.findOne({ designNumber: payload.designNumber });
      if (duplicateDesign && String(duplicateDesign._id) !== String(id)) {
        return res.status(409).json({ success: false, message: 'Design Number already exists.' });
      }
    }

    if (imageFile) {
      const duplicateCheck = await checkDuplicateDesign(imageFile.buffer, id);
      if (duplicateCheck.isDuplicate && duplicateCheck.design && String(duplicateCheck.design._id) !== String(id)) {
        return res.status(409).json({
          success: false,
          message: 'Possible Duplicate Design Found',
          duplicate: duplicateCheck
        });
      }

      const uploadResult = await uploadToCloudinary(imageFile.buffer, imageFile.originalname);
      await deleteFromCloudinary(existing.imagePublicId);
      existing.imageUrl = uploadResult.secure_url;
      existing.imagePublicId = uploadResult.public_id;
      existing.imageHash = await computePerceptualHash(imageFile.buffer);
      existing.imageFingerprint = await computeFileFingerprint(imageFile.buffer);
    }

    existing.designNumber = payload.designNumber || existing.designNumber;
    if (req.body.size !== undefined) existing.size = payload.size || existing.size;
    existing.rate = Number.isFinite(payload.rate) ? payload.rate : existing.rate;
    if (req.body.description !== undefined || req.body.notes !== undefined) {
      existing.description = payload.description;
      existing.notes = payload.notes;
    }
    existing.updatedAt = new Date();

    const saved = await existing.save();
    return res.json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
}

export async function deleteDesign(req, res, next) {
  try {
    const { id } = req.params;
    const design = await Design.findById(id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found.' });
    }

    await deleteFromCloudinary(design.imagePublicId);
    await design.deleteOne();
    return res.json({ success: true, message: 'Design deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function checkDuplicate(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Photo is required.' });
    }

    const duplicate = await checkDuplicateDesign(file.buffer, req.body.excludeId || null);
    return res.json({ success: true, data: duplicate });
  } catch (error) {
    next(error);
  }
}

export async function searchByImage(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Photo is required.' });
    }

    const result = await checkDuplicateDesign(file.buffer);
    const matches = await Design.find({}).lean();
    const ranked = matches
      .filter((item) => item.imageHash)
      .map((item) => {
        const similarity = calculateSimilarityScore(result.perceptualHash, item.imageHash);
        return { ...item, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .filter((item) => item.similarity >= env.possibleDuplicateThreshold)
      .slice(0, 10);

    return res.json({
      success: true,
      data: ranked,
      bestMatch: result,
      threshold: env.possibleDuplicateThreshold
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req, res, next) {
  try {
    const total = await Design.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const designsToday = await Design.countDocuments({ createdAt: { $gte: today } });
    const designsThisMonth = await Design.countDocuments({ createdAt: { $gte: monthStart } });
    const recent = await Design.find({}).sort({ createdAt: -1 }).limit(5).lean();

    return res.json({
      success: true,
      data: {
        total,
        designsAddedToday: designsToday,
        designsAddedThisMonth: designsThisMonth,
        possibleDuplicateAttempts: 0,
        recentDesigns: recent
      }
    });
  } catch (error) {
    next(error);
  }
}
