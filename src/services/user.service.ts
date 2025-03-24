
import { authService, User } from "./auth.service";

export interface Record {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "completed" | "archived";
  createdAt: Date;
}

// Mock records
const RECORDS: Record[] = [
  // Admin records
  {
    id: "1",
    userId: "1",
    title: "System Maintenance",
    description: "Perform regular system updates and maintenance",
    status: "completed",
    createdAt: new Date("2023-05-10")
  },
  {
    id: "2",
    userId: "1",
    title: "User Onboarding",
    description: "Develop new user onboarding flow",
    status: "pending",
    createdAt: new Date("2023-05-15")
  },
  {
    id: "3",
    userId: "1",
    title: "Security Audit",
    description: "Conduct security review of all systems",
    status: "pending",
    createdAt: new Date("2023-05-18")
  },
  // User records
  {
    id: "4",
    userId: "2",
    title: "Complete Profile",
    description: "Add personal details to user profile",
    status: "completed",
    createdAt: new Date("2023-05-01")
  },
  {
    id: "5",
    userId: "2",
    title: "Training Module 1",
    description: "Complete first training module",
    status: "completed",
    createdAt: new Date("2023-05-05")
  },
  {
    id: "6",
    userId: "2",
    title: "Submit Documents",
    description: "Upload required documentation",
    status: "pending",
    createdAt: new Date("2023-05-12")
  },
  // John Doe records
  {
    id: "7",
    userId: "3",
    title: "Project Alpha",
    description: "Initial planning for Project Alpha",
    status: "pending",
    createdAt: new Date("2023-04-22")
  },
  {
    id: "8",
    userId: "3",
    title: "Client Meeting",
    description: "Schedule meeting with new client",
    status: "completed",
    createdAt: new Date("2023-04-28")
  },
  // Jane Doe records
  {
    id: "9",
    userId: "4",
    title: "Data Analysis",
    description: "Analyze Q1 sales data",
    status: "completed",
    createdAt: new Date("2023-05-03")
  },
  {
    id: "10",
    userId: "4",
    title: "Presentation Prep",
    description: "Prepare slides for quarterly review",
    status: "pending",
    createdAt: new Date("2023-05-08")
  }
];

// Simulate API delay
const simulateApiDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getUserRecords(delayMs: number = 800): Promise<Record[]> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    await simulateApiDelay(delayMs);
    
    // If admin, can see all records
    if (currentUser.role === "admin") {
      return [...RECORDS];
    }
    
    // Regular users can only see their own records
    return RECORDS.filter(record => record.userId === currentUser.id);
  }

  public async getRecordById(recordId: string, delayMs: number = 500): Promise<Record> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    await simulateApiDelay(delayMs);
    
    const record = RECORDS.find(r => r.id === recordId);
    
    if (!record) {
      throw new Error("Record not found");
    }
    
    // Admin can access any record, users can only access their own
    if (currentUser.role === "admin" || record.userId === currentUser.id) {
      return record;
    }
    
    throw new Error("Unauthorized access to this record");
  }

  public async updateRecordStatus(recordId: string, status: Record["status"], delayMs: number = 600): Promise<Record> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const recordIndex = RECORDS.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error("Record not found");
    }
    
    const record = RECORDS[recordIndex];
    
    // Check if user can modify this record
    if (currentUser.role !== "admin" && record.userId !== currentUser.id) {
      throw new Error("Unauthorized to modify this record");
    }
    
    await simulateApiDelay(delayMs);
    
    // Update record
    RECORDS[recordIndex] = {
      ...record,
      status
    };
    
    return RECORDS[recordIndex];
  }

  public async createRecord(recordData: Omit<Record, 'id' | 'userId' | 'createdAt'>, delayMs: number = 700): Promise<Record> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    await simulateApiDelay(delayMs);
    
    const newRecord: Record = {
      ...recordData,
      id: (RECORDS.length + 1).toString(),
      userId: currentUser.id,
      createdAt: new Date()
    };
    
    RECORDS.push(newRecord);
    return newRecord;
  }

  // Admin only - get all users with their record counts
  public async getUsersWithRecordCounts(delayMs: number = 900): Promise<(User & { recordCount: number })[]> {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized access");
    }
    
    await simulateApiDelay(delayMs);
    
    // Get all users
    const users = await authService.getAllUsers(0); // No additional delay
    
    // Calculate record counts for each user
    return users.map(user => {
      const userRecords = RECORDS.filter(record => record.userId === user.id);
      return {
        ...user,
        recordCount: userRecords.length
      };
    });
  }
}

export const userService = UserService.getInstance();
