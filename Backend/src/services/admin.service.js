const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminService {
  constructor(adminRepository) {
    this.adminRepo = adminRepository;
  }

  /**
   * Authenticate admin and return JWT token.
   */
  async login(email, password) {
    // 1. Find admin with password
    const admin = await this.adminRepo.findByEmailWithPassword(email);

    if (!admin) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // 3. Update last login
    await this.adminRepo.updateLastLogin(admin._id);

    // 4. Sign JWT
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Get the current admin's profile (from JWT payload adminId).
   */
  async getProfile(adminId) {
    const admin = await this.adminRepo.findById(adminId);

    if (!admin) {
      const err = new Error('Admin not found');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  }

  /**
   * Seed the first admin account.
   * Only works if no admins exist in the database.
   * Used once during initial deployment.
   */
  async seedFirstAdmin({ name, email, password }) {
    const existingCount = await this.adminRepo.countActive();
    if (existingCount > 0) {
      const err = new Error('Admin account already exists');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await this.adminRepo.create({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
    });

    return {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  }
}

module.exports = AdminService;
