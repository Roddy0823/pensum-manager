import { z } from 'zod';

// Sanitize string input - removes potential XSS vectors
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Sanitize email
export function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

// ===== Authentication Schemas =====

export const emailSchema = z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'Email muy largo')
    .transform(sanitizeEmail);

export const passwordSchema = z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'Contraseña muy larga')
    .regex(
        /^[^\s<>'"]*$/,
        'La contraseña contiene caracteres no permitidos'
    );

export const fullNameSchema = z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre muy largo')
    .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
        'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
    )
    .transform(sanitizeString);

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    fullName: fullNameSchema,
});

// ===== Program & Subject Schemas =====

export const programNameSchema = z
    .string()
    .min(2, 'El nombre del programa debe tener al menos 2 caracteres')
    .max(200, 'Nombre del programa muy largo')
    .transform(sanitizeString);

export const semesterSchema = z
    .number()
    .int('El semestre debe ser un número entero')
    .min(1, 'El semestre mínimo es 1')
    .max(20, 'El semestre máximo es 20');

export const creditsSchema = z
    .number()
    .int('Los créditos deben ser un número entero')
    .min(0, 'Los créditos no pueden ser negativos')
    .max(50, 'El máximo de créditos es 50');

export const subjectNameSchema = z
    .string()
    .min(2, 'El nombre de la materia debe tener al menos 2 caracteres')
    .max(200, 'Nombre de la materia muy largo')
    .transform(sanitizeString);

export const createProgramSchema = z.object({
    name: programNameSchema,
    totalSemesters: semesterSchema,
});

export const createSubjectSchema = z.object({
    name: subjectNameSchema,
    semester: semesterSchema,
    credits: creditsSchema,
});

export const updateSubjectSchema = z.object({
    name: subjectNameSchema.optional(),
    semester: semesterSchema.optional(),
    credits: creditsSchema.optional(),
});

// ===== UUID Validation =====

export const uuidSchema = z
    .string()
    .uuid('ID inválido');

// ===== Rate Limiting Helper =====

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60000 // 1 minute
): { allowed: boolean; remainingAttempts: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    // Clean up old entries
    if (entry && now > entry.resetTime) {
        rateLimitMap.delete(key);
    }

    const currentEntry = rateLimitMap.get(key);

    if (!currentEntry) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remainingAttempts: maxAttempts - 1, resetIn: windowMs };
    }

    if (currentEntry.count >= maxAttempts) {
        return {
            allowed: false,
            remainingAttempts: 0,
            resetIn: currentEntry.resetTime - now
        };
    }

    currentEntry.count++;
    return {
        allowed: true,
        remainingAttempts: maxAttempts - currentEntry.count,
        resetIn: currentEntry.resetTime - now
    };
}

export function resetRateLimit(key: string): void {
    rateLimitMap.delete(key);
}

// ===== Validation Helper =====

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0]?.message || 'Error de validación'
            };
        }
        return { success: false, error: 'Error de validación desconocido' };
    }
}

// ===== Security Helpers =====

// Check if string contains potential SQL injection patterns
export function hasSqlInjectionPatterns(input: string): boolean {
    const patterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
        /(-{2}|;|\*|'|"|`)/,
        /(\bOR\b\s+\d+\s*=\s*\d+)/i,
        /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    ];

    return patterns.some(pattern => pattern.test(input));
}

// Generate a random string for honeypot field names
export function generateHoneypotName(): string {
    const prefixes = ['website', 'url', 'homepage', 'company'];
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${random}`;
}

// Export types
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type CreateProgramData = z.infer<typeof createProgramSchema>;
export type CreateSubjectData = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectData = z.infer<typeof updateSubjectSchema>;
