const { z } = require('zod');

exports.registerSchema = {
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    role: z.enum(['student', 'recruiter', 'admin']).optional(),
  }),
};

exports.loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

exports.createInterviewSchema = {
  body: z.object({
    jobposition: z.string().min(1),
    jobdescription: z.string().optional(),
    jobdesc: z.string().optional(),
    jobexp: z.union([z.string(), z.number()]).optional(),
    difficulty: z.string().optional(),
  }),
};
