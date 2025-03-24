
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { authService } from "@/services/auth.service";
import UserManagement from "@/components/admin/UserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Record, userService } from "@/services/user.service";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (currentUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    setUser(currentUser);

    const loadRecords = async () => {
      try {
        setLoading(true);
        // Add a variable delay to demonstrate async loading
        const recordsData = await userService.getUserRecords(1000);
        setRecords(recordsData);
      } catch (error) {
        console.error("Failed to load records:", error);
        toast.error("Failed to load system records");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [navigate]);

  const columnHelper = createColumnHelper<Record>();

  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "pending"
                ? "outline"
                : "secondary"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("userId", {
      header: "User ID",
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    }),
  ];

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar user={user} />
      
      <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and system records
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="records">All Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>All System Records</CardTitle>
                <CardDescription>
                  View and manage all records in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <DataTable columns={columns} data={records} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
