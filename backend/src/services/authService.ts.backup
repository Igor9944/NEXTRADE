import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterUserDto, LoginUserDto, User, AuthResponse } from '../types/auth';

/**
 * Authentication service
 */
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Register a new user
   * @param userData - Registration data
   * @returns Auth response with token and user data
   * @throws Error if email already exists or password is invalid
   */
  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate password strength
    if (!validatePassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user (excluding password field and letting DB handle id_user, created_at, updated_at)
    const { password, ...userDataWithoutPassword } = userData;
    const newUser = await this.userRepository.create({
      ...userDataWithoutPassword,
      password_hash: passwordHash
    });

    // Generate JWT token
    const accessToken = generateToken({
      id: newUser.id_user,
      email: newUser.email,
      role: newUser.role
    });

    // Return response (without password hash)
    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: newUser.id_user,
        email: newUser.email,
        role: newUser.role
      }
    };
  }

  /**
   * Login user
   * @param loginData - Login credentials
   * @returns Auth response with token and user data
   * @throws Error if credentials are invalid
   */
  async login(loginData: LoginUserDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare passwords
    const isValidPassword = await comparePassword(
      loginData.password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = generateToken({
      id: user.id_user,
      email: user.email,
      role: user.role
    });

    // Return response (without password hash)
    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.role
      }
    };
  }
}