import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL || '';

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
