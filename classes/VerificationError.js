class VerificationError extends Error {
    constructor(...args) {
        super(...args);
    }
}

module.exports = VerificationError;