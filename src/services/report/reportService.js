const Test = require('../../models/Test');
const Cow = require('../../models/Cow');
const User = require('../../models/User');

class ReportService {
    /**
     * Generates a comprehensive clinical report JSON for a specific test
     * @param {String} testId 
     * @param {String} farmerId 
     * @returns {Object} Report data object
     */
    async generateTestReport(testId, farmerId) {
        // 1. Fetch Test, ensuring it belongs to the authenticated farmer
        const test = await Test.findOne({ testId, farmerId }).lean();
        
        if (!test) {
            const error = new Error('Test not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        if (test.status !== 'COMPLETED') {
            const error = new Error('Report can only be generated for completed tests');
            error.statusCode = 400;
            throw error;
        }

        // 2. Fetch Cow & Farmer details
        const cow = await Cow.findOne({ _id: test.cowId }).select('-__v').lean();
        const farmer = await User.findOne({ _id: farmerId }).select('name farmName email phone').lean();

        // 3. Assemble structured report document
        const report = {
            metadata: {
                reportId: `REP-${test.testId}`,
                generatedAt: new Date().toISOString(),
                testDate: test.completedAt,
                modelVersion: test.modelVersion,
                riskConfigVersion: test.riskConfigVersion,
                disclaimer: "This system provides a risk assessment based on configured inputs and machine learning. It does not replace definitive veterinary diagnosis."
            },
            farmDetails: {
                farmerName: farmer.name,
                farmName: farmer.farmName,
                contact: farmer.email
            },
            cowDetails: {
                id: cow.cowId,
                name: cow.name,
                breed: cow.breed,
                lactationNumber: cow.lactationNumber,
                penNumber: cow.penNumber
            },
            assessmentResult: {
                finalScore: test.riskResult.score,
                riskLevel: test.riskResult.level,
                trend: test.riskResult.trend || 'STABLE'
            },
            riskComponents: test.riskResult.components,
            clinicalObservations: test.observations.map(obs => ({
                question: obs.question,
                answer: obs.answer,
                flagged: obs.score > 0
            })),
            cmtResult: test.cmtData ? {
                result: test.cmtData.cmtResult,
                score: test.cmtData.cmtScore
            } : null,
            sensorData: test.sensorData ? {
                ph: test.sensorData.ph,
                temperature: test.sensorData.temperature,
                conductivity: test.sensorData.conductivity
            } : null,
            aiAnalysis: test.mlResult ? {
                probability: test.mlResult.probability,
                confidence: test.mlResult.confidence
            } : null,
            contributingFactors: test.riskResult.contributingFactors || [],
            recommendedActions: test.riskResult.recommendedActions || []
        };

        return report;
    }
}

module.exports = new ReportService();