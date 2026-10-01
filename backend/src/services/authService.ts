import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterUserDto, LoginUserDto, AuthResponse } from '../types/auth';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: RegisterUserDto): Promise<AuthResponse> {
    const email = String(userData.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Invalid email');
    }

    if (!validatePassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const passwordHash = await hashPassword(userData.password);
    const newUser = await this.userRepository.create({
      email,
      password_hash: passwordHash,
      role: 'CLIENT',
      nom_entreprise: String(userData.nom_entreprise || '').trim(),
      telephone: String(userData.telephone || '').trim(),
      nom: String(userData.nom || '').trim(),
      prenom: String(userData.prenom || '').trim(),
      adresse: String(userData.adresse || '').trim(),
      ville: String(userData.ville || '').trim(),
      pays: String(userData.pays || '').trim()
    });

    const accessToken = generateToken({
      id: newUser.id_user,
      email: newUser.email,
      role: newUser.role
    });

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

  async login(loginData: LoginUserDto): Promise<AuthResponse> {
    const email = String(loginData.email || '').trim().toLowerCase();
    const password = String(loginData.password || '');

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateToken({
      id: user.id_user,
      email: user.email,
      role: user.role
    });

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
