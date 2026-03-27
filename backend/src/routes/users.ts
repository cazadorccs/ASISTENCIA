import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('gerencia', 'admin', 'manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { department, role, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (department) where.department = department;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', authenticate, authorize('gerencia', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role, department } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        department,
      },
    });

    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', authenticate, authorize('gerencia', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, role, department, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(role && { role }),
        ...(department && { department }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', authenticate, authorize('gerencia', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id: id as string } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
