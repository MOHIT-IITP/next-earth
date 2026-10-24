export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  initials: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const DEFAULT_MOCK_USER: User = {
  id: "user-earth-01",
  name: "Dr. Elena Rostova",
  email: "elena.rostova@earth.org",
  role: "Lead Field Ecologist",
  organization: "Global Biosphere Survey",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  initials: "ER",
  createdAt: "2024-03-15",
};

const STORAGE_KEY = "earth_auth_session_v1";

/**
 * MockAuthAdapter
 * Provides deterministic, frontend-only authentication behavior for Phase 2.
 * Designed to be replaced with a real Auth provider (e.g. NextAuth, Supabase, Lucia) in later phases.
 */
export class MockAuthAdapter {
  private static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getSession(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        // Initialize with default mock user for seamless demonstration
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_USER));
        return DEFAULT_MOCK_USER;
      }
      return stored ? JSON.parse(stored) : null;
    } catch {
      return DEFAULT_MOCK_USER;
    }
  }

  static setSession(user: User | null): void {
    if (typeof window === "undefined") return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    await this.sleep(500);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: "Email address is required." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password) {
      return { success: false, error: "Password is required." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    // Explicit mock credentials check
    if (password === "invalid_password") {
      return { success: false, error: "Invalid credentials. Please verify your email and password." };
    }

    // Determine user profile
    const namePart = trimmedEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = namePart
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EA";

    const user: User = {
      id: `user-${Date.now()}`,
      name: trimmedEmail === DEFAULT_MOCK_USER.email ? DEFAULT_MOCK_USER.name : formattedName,
      email: trimmedEmail,
      role: "Field Researcher",
      organization: "Earth Consortium",
      initials,
      createdAt: new Date().toISOString(),
    };

    this.setSession(user);
    return { success: true, user };
  }

  static async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    await this.sleep(600);

    if (!name.trim()) {
      return { success: false, error: "Full name is required." };
    }
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const initials = name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EA";

    const user: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      role: "Observer & Contributor",
      organization: "Earth Collaborative",
      initials,
      createdAt: new Date().toISOString(),
    };

    this.setSession(user);
    return { success: true, user };
  }

  static async logout(): Promise<void> {
    await this.sleep(200);
    this.setSession(null);
  }

  static async resetPassword(email: string): Promise<AuthResponse> {
    await this.sleep(500);
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    return { success: true };
  }

  static updateUser(updates: Partial<User>): User | null {
    const current = this.getSession();
    if (!current) return null;
    const updated = { ...current, ...updates };
    this.setSession(updated);
    return updated;
  }
}
