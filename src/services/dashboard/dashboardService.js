const Cow = require('../../models/Cow');
const Test = require('../../models/Test');
const Alert = require('../../models/Alert');
const { RISK_LEVELS } = require('../../constants/riskLevels');

/**
 * Aggregates all high-level stats needed for the main Farmer Dashboard.
 */
async function getDashboardSummary(farmerId) {
  // We use Promise.all to run these independent queries in parallel for speed
  const [
    totalCows,
    cowsByRisk,
    recentTests,
    activeAlertsCount,
    testsThisWeekCount
  ] = await Promise.all([
    // 1. Total Active Cows
    Cow.countDocuments({ farmerId, active: true }),

    // 2. Risk Distribution (Aggregation Pipeline)
    Cow.aggregate([
      { $match: { farmerId, active: true } },
      { $group: { _id: '$currentRiskLevel', count: { $sum: 1 } } }
    ]),

    // 3. Recent Tests (Last 5)
    Test.find({ farmerId, status: 'COMPLETED' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('cowId', 'name cowId')
      .select('testId completedAt riskResult.level riskResult.score cowId'),

    // 4. Unread Alerts
    Alert.countDocuments({ userId: farmerId, read: false }),

    // 5. Tests done in the last 7 days
    Test.countDocuments({
      farmerId,
      status: 'COMPLETED',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
  ]);

  // Format the aggregation result into a clean object with 0 defaults
  const riskDistribution = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    VERY_HIGH: 0,
    UNKNOWN: 0
  };

  cowsByRisk.forEach(group => {
    const level = group._id || 'UNKNOWN';
    if (riskDistribution[level] !== undefined) {
      riskDistribution[level] = group.count;
    }
  });

  const healthyCows = riskDistribution.LOW;
  const cowsRequiringAttention = riskDistribution.HIGH + riskDistribution.VERY_HIGH;

  return {
    totalCows,
    healthyCows,
    cowsRequiringAttention,
    riskDistribution,
    testsThisWeek: testsThisWeekCount,
    activeAlerts: activeAlertsCount,
    recentTests: recentTests.map(t => ({
      testId: t.testId,
      date: t.completedAt,
      cowName: t.cowId?.name || 'Unknown',
      cowTag: t.cowId?.cowId || 'N/A',
      riskLevel: t.riskResult?.level || 'UNKNOWN',
      riskScore: t.riskResult?.score || 0
    }))
  };
}

module.exports = { getDashboardSummary };