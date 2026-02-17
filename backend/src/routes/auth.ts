import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { db } from '@/config/database';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  console.log('Register request body:', req.body); // Add this
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password || !role) {
      console.log('Missing fields:', { email, username, password: !!password, role }); // Add this
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Checking for existing user...'); // Add this
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    console.log('Existing user check done:', existingUser); // Add this

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.log('Hashing password...'); // Add this
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting user...'); // Add this
    const newUser = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        role,
      })
      .returning();
    console.log('User inserted:', newUser); // Add this

    req.login(newUser[0], (err: any) => {
      if (err) {
        console.log('Login after register failed:', err); // Add this
        return res.status(500).json({ error: 'Login failed' });
      }
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          username: newUser[0].username,
          role: newUser[0].role,
        },
      });
    });
  } catch (error: any) {
    console.error('Registration error:', error); // Add this
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.login(user, (loginErr: any) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated', user: null });
  }

  const user = req.user as any;
  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err: any) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logout successful' });
  });
});

export default router;