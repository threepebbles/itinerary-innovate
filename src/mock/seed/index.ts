import { db } from '../db';
import type { User, Workspace, Category } from '@/entities/types';

export const seedDatabase = async () => {
  // Check if already seeded
  const existingUsers = await db.users.count();
  if (existingUsers > 0) {
    console.log('Database already seeded');
    return;
  }

  // Create demo user
  const demoUser: User = {
    id: crypto.randomUUID(),
    email: 'demo@courseitda.com',
    password: btoa('demo123'), // hashed password
    nickname: '데모유저',
    createdAt: new Date().toISOString(),
  };

  await db.users.add(demoUser);

  // Create demo workspace
  const demoWorkspace: Workspace = {
    id: crypto.randomUUID(),
    ownerId: demoUser.id,
    title: '홍대 데이트 코스',
    headcount: 2,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.workspaces.add(demoWorkspace);

  // Create demo categories
  const categories: Category[] = [
    {
      id: crypto.randomUUID(),
      workspaceId: demoWorkspace.id,
      name: '점심',
      color: '#6E59A5',
      sortOrder: 0,
      representativePlaceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      workspaceId: demoWorkspace.id,
      name: '카페',
      color: '#2563EB',
      sortOrder: 1,
      representativePlaceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.categories.bulkAdd(categories);

  console.log('Database seeded successfully!');
  console.log('Demo credentials: demo@courseitda.com / demo123');
};

// Auto-seed on first load
if (typeof window !== 'undefined') {
  seedDatabase().catch(console.error);
}
