import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "@/config/database";
import { users, applications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) {
      return done(null, false);
    }

    // Compute isApproved from applications table
    const approvedApp = await db.query.applications.findFirst({
      where: and(
        eq(applications.userId, user.id),
        eq(applications.status, "approved"),
      ),
    });

    const userWithApproval = {
      ...user,
      isApproved: user.userType === "admin" || !!approvedApp,
    };

    done(null, userWithApproval);
  } catch (err) {
    done(err);
  }
});
