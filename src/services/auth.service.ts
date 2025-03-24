
import { toast } from "@/components/ui/sonner";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Mock database of users
const USERS: User[] = [
  {
    id: "1",
    username: "admin",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    username: "user",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Regular+User&background=27AE60&color=fff",
    createdAt: new Date("2023-02-15"),
  },
  {
    id: "3",
    username: "johndoe",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    username: "janedoe",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "user",
    createdAt: new Date("2023-04-20"),
  },
];

// Simulate API delay
const simulateApiDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials, delayMs: number = 800): Promise<User> {
    // Simulate API delay
    await simulateApiDelay(delayMs);

    // Find user with matching credentials
    const user = USERS.find(u => u.username === credentials.username);

    // Simulate authentication
    if (user && credentials.password === "password") {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    throw new Error("Invalid username or password");
  }

  public async logout(delayMs: number = 500): Promise<void> {
    await simulateApiDelay(delayMs);
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  public isAdmin(): boolean {
    return this.currentUser?.role === "admin";
  }

  // For admin functions - get all users
  public async getAllUsers(delayMs: number = 800): Promise<User[]> {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      throw new Error("Unauthorized access");
    }
    
    await simulateApiDelay(delayMs);
    return [...USERS];
  }

  // Add new user (admin only)
  public async addUser(user: Omit<User, 'id' | 'createdAt'>, delayMs: number = 800): Promise<User> {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      throw new Error("Unauthorized access");
    }
    
    await simulateApiDelay(delayMs);
    
    // Create new user
    const newUser: User = {
      ...user,
      id: (USERS.length + 1).toString(),
      createdAt: new Date(),
    };
    
    USERS.push(newUser);
    return newUser;
  }

  // Delete user (admin only)
  public async deleteUser(userId: string, delayMs: number = 800): Promise<void> {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      throw new Error("Unauthorized access");
    }
    
    await simulateApiDelay(delayMs);
    
    const index = USERS.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }
    
    // Don't allow deleting the logged-in user
    if (userId === this.currentUser?.id) {
      throw new Error("Cannot delete your own account");
    }
    
    USERS.splice(index, 1);
  }
}

export const authService = AuthService.getInstance();
