const Cow = require('../../models/Cow');
const Test = require('../../models/Test');
const Alert = require('../../models/Alert');
const { RISK_LEVELS } = require('../../constants/riskLevels');

class FarmService {
    /**
     * Get comprehensive farm health analytics for a specific farmer
     * @param {String} farmerId 
     * @returns {Object} Farm health analytics data
     */
    async getFarmHealthAnalytics(farmerId) {
        // 1. Total and Active Cows
        const totalCows = await Cow.countDocuments({ farmerId });
        const activeCows = await Cow.countDocuments({ farmerId, active: true });

        // 2. Risk Distribution (Current status of active cows)
        const riskDistributionRaw = await Cow.aggregate([
            { $match: { farmerId: farmerId, active: true } },
            { $group: { _id: "$currentRiskLevel", count: { $sum: 1 } } }
        ]);

        const riskDistribution = {
            [RISK_LEVELS.LOW]: 0,
            [RISK_LEVELS.MEDIUM]: 0,
            [RISK_LEVELS.HIGH]: 0,
            [RISK_LEVELS.VERY_HIGH]: 0,
            UNTESTED: 0
        };

        riskDistributionRaw.forEach(item => {
            const level = item._id || 'UNTESTED';
            if (riskDistribution[level] !== undefined) {
                riskDistribution[level] = item.count;
            }
        });

        // 3. Cows Requiring Attention (HIGH or VERY_HIGH risk)
        const cowsRequiringAttention = await Cow.find({
            farmerId,
            active: true,
            currentRiskLevel: { $in: [RISK_LEVELS.HIGH, RISK_LEVELS.VERY_HIGH] }
        })
        .select('name cowId penNumber currentRiskLevel currentRiskScore lastTestDate')
        .sort({ currentRiskScore: -1 })
        .limit(10);

        // 4. Test Statistics (Total and Average Score over last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const testStats = await Test.aggregate([
            { 
                $match: { 
                    farmerId: farmerId, 
                    createdAt: { $gte: thirtyDaysAgo },
                    status: 'COMPLETED'
                } 
            },
            {
                $group: {
                    _id: null,
                    totalTests30Days: { $sum: 1 },
                    averageRiskScore: { $avg: "$riskResult.score" }
                }
            }
        ]);

        const averageRiskScore = testStats.length > 0 ? Math.round(testStats[0].averageRiskScore) : 0;
        const totalTests30Days = testStats.length > 0 ? testStats[0].totalTests30Days : 0;

        // 5. Recent Alerts
        const recentAlerts = await Alert.find({ farmerId, read: false })
            .sort({ createdAt: -1 })
            .limit(5);

        return {
            overview: {
                totalCows,
                activeCows,
                cowsRequiringAttention: cowsRequiringAttention.length,
                averageRiskScore,
                totalTests30Days
            },
            riskDistribution,
            cowsRequiringAttention,
            recentAlerts
        };
    }
}

module.exports = new FarmService();