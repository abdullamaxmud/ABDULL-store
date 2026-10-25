require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Script to safely update or reset credentials for Admin or Customer
 * Usage:
 *   node utils/updateCredentials.js <admin|customer> <newName> <newEmail> <newPassword>
 * Example:
 *   node utils/updateCredentials.js admin "Super Admin" "admin@mybrand.com" "MyStrongPass123!"
 */

const run = async () => {
  const [, , targetRole = 'admin', newName, newEmail, newPassword] = process.argv;

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const role = targetRole.toLowerCase() === 'admin' ? 'admin' : 'customer';
    const user = await User.findOne({ role }).sort({ createdAt: 1 });

    if (!user) {
      console.error(`❌ No user found with role "${role}".`);
      process.exit(1);
    }

    console.log(`🔍 Found account: ${user.name} (${user.email}) [role: ${user.role}]`);

    if (newName) user.name = newName;
    if (newEmail) user.email = newEmail.toLowerCase();
    if (newPassword) {
      if (newPassword.length < 8) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
      }
      user.password = newPassword; // Mongoose pre-save hook will hash this automatically
      // A fresh password also clears any lockout from earlier failed attempts
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    await user.save();

    console.log('\n=============================================');
    console.log(`✅ SUCCESS: ${user.role.toUpperCase()} credentials updated!`);
    console.log(`• Name / Username : ${user.name}`);
    console.log(`• Email / Login   : ${user.email}`);
    if (newPassword) {
      console.log('• Password        : updated (hashed & saved securely — not shown here)');
    } else {
      console.log(`• Password        : [Unchanged]`);
    }
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating credentials:', err.message);
    process.exit(1);
  }
};

run();
