const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true },
    message: { type: String, required: true },
    building: { type: String, required: true },
    sensor: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;