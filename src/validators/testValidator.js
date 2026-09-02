const { z } = require('zod');

const startTestSchema = z.object({
  cowId: z.string().trim().min(1, 'Cow ID is required to start a test'),
});

const submitObservationsSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().trim().min(1),
      answer: z.enum(['YES', 'NO']),
    })
  ).min(1, 'At least one answer must be provided'),
});

module.exports = { startTestSchema, submitObservationsSchema };