const { z } = require('zod');

// Note: farmerId is intentionally NOT part of any schema here — it is always
// derived from req.user.userId (the authenticated JWT), never accepted from
// the request body. See cowController for enforcement.

const createCowSchema = z.object({
  cowId: z.string().trim().min(1, 'cowId is required'),
  name: z.string().trim().min(1, 'name is required'),
  breed: z.string().trim().optional(),
  age: z.coerce.number().min(0).optional(),
  lactationNumber: z.coerce.number().min(0).optional(),
  lactationCycle: z.coerce.number().min(0).optional(),
  penNumber: z.string().trim().optional(),
  registrationDate: z.coerce.date().optional(),
});

// All fields optional for PUT — only supplied fields get updated.
// cowId is intentionally excluded: changing a cow's tag after creation is
// disallowed here to avoid silently breaking historical test references
// that a farmer might identify by cowId in exports/reports.
const updateCowSchema = z.object({
  name: z.string().trim().min(1).optional(),
  breed: z.string().trim().optional(),
  age: z.coerce.number().min(0).optional(),
  lactationNumber: z.coerce.number().min(0).optional(),
  lactationCycle: z.coerce.number().min(0).optional(),
  penNumber: z.string().trim().optional(),
  active: z.boolean().optional(),
});

const listCowsQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  search: z.string().trim().optional(),
});

module.exports = { createCowSchema, updateCowSchema, listCowsQuerySchema };
