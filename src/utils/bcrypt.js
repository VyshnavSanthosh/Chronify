const bcrypt = require("bcrypt");

// Generate hash for any string
async function hashString(text) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(text, salt);
}

// Compare plain text with hashed text
async function compareString(plainText, hashedText) {
    return await bcrypt.compare(plainText, hashedText);
}

module.exports = {
    hashString,
    compareString
};
