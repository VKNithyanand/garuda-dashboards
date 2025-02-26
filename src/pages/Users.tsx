
import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Filter, MoreVertical, Mail, UserCheck } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Manager",
    status: "Away",
    lastActive: "3 days ago",
  },
];

const Users = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.lastActive}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.status}
                  </div>
                  <button className="rounded-full p-2 hover:bg-accent">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="dashboard-card">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Invite Users</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">Review Access</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="font-medium mb-4">User Statistics</h3>
            <div className="space-y-4">
              {[
                { label: "Total Users", value: "156" },
                { label: "Active Now", value: "23" },
                { label: "New This Month", value: "45" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                >
                  <span className="text-sm">{stat.label}</span>
                  <span className="text-sm font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
