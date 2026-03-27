import { Router, Response } from 'express';
import prisma from '../config/db.js';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { area, department, startDate, endDate, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (area) where.area = area;
    if (department) where.department = department;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    if (req.user!.role === 'empleado') {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      where.userName = user?.name;
    }

    const [logs, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { timestamp: 'desc' },
        include: { accessPoint: true },
      }),
      prisma.attendanceLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userName, department, area, type, temperature, source = 'manual' } = req.body;

    const accessPoint = await prisma.accessPoint.findFirst({
      where: { area, type },
    });

    const logData: any = {
      userName,
      department,
      area,
      type,
      temperature: temperature ? parseFloat(temperature) : null,
      source,
    };

    if (accessPoint?.id) {
      logData.accessPointId = accessPoint.id;
    }

    const log = await prisma.attendanceLog.create({
      data: logData,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [total, byArea, byType, recent] = await Promise.all([
      prisma.attendanceLog.count({ where }),
      prisma.attendanceLog.groupBy({
        by: ['area'],
        where,
        _count: true,
      }),
      prisma.attendanceLog.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.attendanceLog.findMany({
        where,
        take: 10,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    res.json({ total, byArea, byType, recent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
