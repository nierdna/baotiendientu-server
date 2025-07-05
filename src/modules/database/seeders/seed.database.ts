import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminConfigRepository, UserRepository } from '../repositories';
import * as bcrypt from 'bcrypt';

// Mock credentials for testing
const MOCK_CREDENTIALS = {
  admin: {
    id: 'ce88afd5-0cf0-4f16-b683-0de615f95946',
    email: 'admin@baotiendientu.com',
    password: 'Admin123!',
    role: 'admin',
    name: 'System Administrator',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=0d47a1&color=fff'
  },
  member: {
    id: '9036d53e-a1b0-4203-b505-f75282e03ac8',
    email: 'member@baotiendientu.com',
    password: 'Member123!',
    role: 'member', 
    name: 'Test Member',
    avatarUrl: 'https://ui-avatars.com/api/?name=Member&background=4caf50&color=fff'
  }
};

@Injectable()
export class SeedDatabase implements OnApplicationBootstrap {
  @Inject(AdminConfigRepository)
  private readonly adminConfigRepository: AdminConfigRepository;

  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  constructor() {}

  async onApplicationBootstrap() {
    const isWorker = Boolean(Number(process.env.IS_WORKER || 0));
    if (!isWorker) {
      return;
    }
    const start = Date.now();

    console.log('🌱 Starting database seeding...');

    // Seed mock users
    await this.seedMockUsers();

    const end = Date.now();

    console.log('Time to seed database', (end - start) / 1000);
    console.log('-----------SEED DATABASE SUCCESSFULLY----------------');
  }

  private async seedMockUsers() {
    console.log('👥 Seeding mock users...');
    
    // Seed admin user
    await this.seedUser(MOCK_CREDENTIALS.admin);
    
    // Seed member user  
    await this.seedUser(MOCK_CREDENTIALS.member);
    
    console.log('✅ Mock users seeded successfully!');
    console.log('📋 Mock Credentials:');
    console.log('   👑 Admin:', MOCK_CREDENTIALS.admin.email, '|', MOCK_CREDENTIALS.admin.password);
    console.log('   👤 Member:', MOCK_CREDENTIALS.member.email, '|', MOCK_CREDENTIALS.member.password);
  }

  private async seedUser(userData: any) {
    const { id, email, password, role, name, avatarUrl } = userData;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      console.log(`✅ User already exists: ${email} (ID: ${existingUser.id})`);
      
      // Update password and role to ensure consistency
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.name = name;
      existingUser.avatarUrl = avatarUrl;
      await this.userRepository.save(existingUser);
      
      console.log(`   🔄 Updated: ${name} (${role})`);
      return;
    }

    // Create new user with specific ID
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      id, // Use specific ID
      name,
      email,
      password: hashedPassword,
      role,
      avatarUrl,
    });

    await this.userRepository.save(user);
    
    console.log(`✅ Created: ${name} (${role}) - ID: ${user.id}`);
  }
}
