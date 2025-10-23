const mongoose = require('mongoose');

const observerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
});

const Observer = mongoose.model('Observer', observerSchema);

module.exports = Observer;