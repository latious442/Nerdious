const crypto = require('crypto');
const mongoose = require('mongoose');

const adminCredentialSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

adminCredentialSchema.statics.createPasswordRecord = function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, passwordHash };
};

adminCredentialSchema.methods.verifyPassword = function verifyPassword(password) {
  try {
    const computed = crypto.scryptSync(password, this.salt, 64).toString('hex');
    const computedBuffer = Buffer.from(computed, 'hex');
    const storedBuffer = Buffer.from(this.passwordHash || '', 'hex');
    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
};

module.exports = mongoose.model('AdminCredential', adminCredentialSchema);
