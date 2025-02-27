
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomers } from "@/lib/supabase-client";
import { UserPlus, Filter, MoreVertical, Mail, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const { toast } = useToast();
  const { data: customers = [], isLoading, error } = useCustomers();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  
  // Converting customers to users with additional info
  const users = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: ["Admin", "User", "Manager"][Math.floor(Math.random() * 3)], // Random role for demo
    status: Math.random() > 0.2 ? "Active" : "Away", // Random status
    lastActive: customer.last_active ? new Date(customer.last_active).toLocaleString() : "Never",
  }));
  
  if (error) {
    toast({
      title: "Error loading users",
      description: error.message,
      variant: "destructive",
    });
  }

  const handleAddUser = () => {
    setIsAddingUser(true);
  };

  const handleCancelAddUser = () => {
    setIsAddingUser(false);
    setNewUser({ name: "", email: "" });
  };

  const handleSaveUser = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          { name: newUser.name, email: newUser.email },
        ]);
      
      if (error) throw error;
      
      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully.`,
      });
      
      // Reset form
      setNewUser({ name: "", email: "" });
      setIsAddingUser(false);
      
    } catch (error) {
      toast({
        title: "Error adding user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              onClick={handleAddUser}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {isAddingUser && (
          <div className="dashboard-card">
            <h3 className="font-medium mb-4">Add New User</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  onClick={handleCancelAddUser}
                >
                  Cancel
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={handleSaveUser}
                  disabled={!newUser.name || !newUser.email}
                >
                  Save User
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
          )}
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
                { label: "Total Users", value: users.length.toString() },
                { label: "Active Now", value: users.filter(u => u.status === "Active").length.toString() },
                { label: "New This Month", value: Math.floor(users.length * 0.3).toString() },
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
