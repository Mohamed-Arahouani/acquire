'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AcquireSchema = new Schema({
    source: String,
    timestamp: { type: Date, default: Date.now }, // Cuándo se hizo
    latencyMs: Number,                            // Cuánto tardó
    features: [Number],                           // Los datos de entrada (array de números)

    featureCount: Number,
    scalerVersion: String,
    createdAt: { type: Date, default: Date.now },
    targetDate: Date,
    dailyValues: [Number], 
    
    kunnaMeta: {
        alias: String,
        name: String,
        daysUsed: [String]
    },
    
    fetchMeta: {
        timeStart: Date,
        timeEnd: Date,
    },
                        
    
});

module.exports = mongoose.model('Acquire', AcquireSchema);