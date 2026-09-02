const { z } = require('zod');

/**
 * Validates incoming hardware payloads. 
 * We reject physically impossible values to protect the ML and Risk engines.
 */
const sensorDataSchema = z.object({
  testId: z.string().trim().min(1, 'Test ID is required'),
  cowId: z.string().trim().min(1, 'Cow ID is required'),
  deviceId: z.string().trim().min(1, 'Device ID is required'),
  
  // The device should send an ISO string or Unix timestamp
  timestamp: z.coerce.date(),

  measurements: z.object({
    // pH scale is 0-14. Bovine milk is typically 6.4-6.8, 
    // but we allow the full physical sensor range here.
    ph: z.number().min(0).max(14),
    
    // Temperature in Celsius. 
    // A living cow is ~38.5C. We bound it to 0-50C to catch broken sensor wires (which often read -127 or 999).
    temperature: z.number().min(0).max(50),
    
    // Electrical conductivity (mS/cm). Typically 4.0 - 6.0 for healthy cows.
    // Must be positive.
    conductivity: z.number().min(0).max(50),
  })
});

module.exports = { sensorDataSchema };