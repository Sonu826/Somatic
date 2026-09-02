const mongoose = require('mongoose');
const env = require('../config/env');
const ObservationQuestion = require('../models/ObservationQuestion');
const { logger } = require('../utils/logger');

const questions = [
  { questionId: 'OBS_001', question: "Does the cow's udder look swollen, red, or abnormal?", order: 1, riskScoreFlag: 25 },
  { questionId: 'OBS_002', question: "Does the udder feel unusually hot or firm?", order: 2, riskScoreFlag: 25 },
  { questionId: 'OBS_003', question: "Is the milk appearance abnormal (clots, flakes, watery, bloody)?", order: 3, riskScoreFlag: 25 },
  { questionId: 'OBS_004', question: "Is there any noticeable reduction in milk production or change in cow behavior?", order: 4, riskScoreFlag: 25 }
];

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to DB for seeding...');

    await ObservationQuestion.deleteMany({});
    await ObservationQuestion.insertMany(questions);
    
    logger.info('✅ Successfully seeded observation questions');
    process.exit(0);
  } catch (err) {
    logger.error('Failed to seed questions', err);
    process.exit(1);
  }
}

seed();