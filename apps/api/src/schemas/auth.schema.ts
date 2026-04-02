import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('El correo es inválido').min(1, 'El correo es obligatorio'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('El correo es inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    role: z.enum(['admin', 'gerente', 'supervisor', 'empleado']).optional()
  })
});
