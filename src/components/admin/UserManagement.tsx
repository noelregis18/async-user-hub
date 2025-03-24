
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { authService, User } from "@/services/auth.service";
import { toast } from "sonner";

interface UserWithRecordCount extends User {
  recordCount: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRecordCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all users with record counts
      const usersWithRecords = await authService.getAllUsers();
      
      // Add record count (in real app this would come from backend)
      const enhancedUsers = usersWithRecords.map(user => ({
        ...user,
        recordCount: Math.floor(Math.random() * 10) // Simulating record counts
      }));
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useState(() => {
    loadUsers();
  });

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(true);
      await authService.deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.name} deleted successfully`);
      
      // Update users list
      setUsers(users.filter(user => user.id !== userToDelete.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const columnHelper = createColumnHelper<UserWithRecordCount>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("username", {
      header: "Username",
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "default" : "outline"}>
          {row.original.role === "admin" ? "Admin" : "User"}
        </Badge>
      ),
    }),
    columnHelper.accessor("recordCount", {
      header: "Records",
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUserToDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold">{row.original.name}</span>? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    }),
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </div>
        <Button className="ml-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </CardContent>
    </Card>
  );
}

export default UserManagement;
