
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Record, userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { Navbar } from "@/components/layout/Navbar";
import { DataTable } from "@/components/ui/DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(authService.getCurrentUser());

  // Redirect if not logged in
  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login");
      return;
    }

    setUser(authService.getCurrentUser());

    const loadRecords = async () => {
      try {
        setLoading(true);
        // Add a variable delay to demonstrate async loading
        const recordsData = await userService.getUserRecords(1200);
        setRecords(recordsData);
      } catch (error) {
        console.error("Failed to load records:", error);
        toast.error("Failed to load your records");
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
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              View and manage your records
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Records</CardTitle>
              <CardDescription>
                All your current records and their status
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
