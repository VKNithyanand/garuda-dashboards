import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomers } from "@/lib/supabase-client";
import { 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Mail, 
  UserCheck, 
  Loader2, 
  Search, 
  ChevronDown, 
  X, 
  Bell, 
  CheckCircle2, 
  FileText,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Users = () => {
  const { toast } = useToast();
  const { data: customers = [], isLoading, error, refetch } = useCustomers();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    role: "all"
  });
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Converting customers to users with additional info
  const users = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    role: ["Admin", "User", "Manager"][Math.floor(Math.random() * 3)], // Random role for demo
    status: Math.random() > 0.2 ? "Active" : "Away", // Random status
    lastActive: customer.last_active ? new Date(customer.last_active).toLocaleString() : "Never",
  }));
  
  // Apply filters and search
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filters.status === "all" || 
      user.status.toLowerCase() === filters.status.toLowerCase();
    
    const matchesRole = filters.role === "all" || 
      user.role.toLowerCase() === filters.role.toLowerCase();
      
    return matchesSearch && matchesStatus && matchesRole;
  });
  
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
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingUser(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          { name: newUser.name, email: newUser.email },
        ]);
      
      if (error) throw error;
      
      // Refresh the users list
      refetch();
      
      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully.`,
      });
      
      // Reset form
      setNewUser({ name: "", email: "" });
      setIsAddingUser(false);
      
    } catch (error: any) {
      toast({
        title: "Error adding user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      role: "all"
    });
    setSearchTerm("");
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // If all are selected, unselect all
      setSelectedUsers([]);
    } else {
      // Otherwise select all
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const performBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to perform this action.",
        variant: "destructive",
      });
      return;
    }

    setActiveAction(action);
    try {
      // Simulate processing time for the action
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, we would call an API to perform the action on the selected users
      
      const actionMap: Record<string, string> = {
        "invite": "invited",
        "export": "exported",
        "delete": "deleted"
      };
      
      toast({
        title: "Action Complete",
        description: `Successfully ${actionMap[action]} ${selectedUsers.length} user(s).`,
      });
      
      // Clear selected users after action
      setSelectedUsers([]);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} users. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const performQuickAction = async (action: string) => {
    setActiveAction(action);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const actionMessages: Record<string, string> = {
        "invite": "Invitation emails have been sent to users",
        "review": "Access review has been completed"
      };
      
      toast({
        title: "Action Complete",
        description: actionMessages[action] || "Action completed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Action failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Refresh the users list
      refetch();
      
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Create the dropdown menu for a user
  const UserActionMenu = ({ userId, userName }: { userId: string, userName: string }) => {
    const [showMenu, setShowMenu] = useState(false);
    
    return (
      <div className="relative">
        <button 
          className="rounded-full p-2 hover:bg-accent"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 z-10 mt-2 w-56 p-2 rounded-md border border-input bg-background shadow-md">
            <div className="py-1">
              <button 
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md flex items-center"
                onClick={() => {
                  setShowMenu(false);
                  toast({
                    title: "User Edited",
                    description: `${userName}'s details are now being edited.`,
                  });
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit User
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md flex items-center"
                onClick={() => {
                  setShowMenu(false);
                  toast({
                    title: "Email Sent",
                    description: `An email has been sent to ${userName}.`,
                  });
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md flex items-center"
                onClick={() => {
                  setShowMenu(false);
                  toast({
                    title: "Notification Sent",
                    description: `A notification has been sent to ${userName}.`,
                  });
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Notification
              </button>
              <div className="my-1 border-t border-input"></div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md flex items-center"
                onClick={() => {
                  setShowMenu(false);
                  deleteUser(userId);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Delete User
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
            <div className="relative">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 z-10 mt-2 w-72 p-4 rounded-md border border-input bg-background shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Filter Options</h4>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs block mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="away">Away</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs block mb-1">Role</label>
                      <select
                        value={filters.role}
                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <button 
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear Filters
                      </button>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  disabled={isSubmittingUser || !newUser.name || !newUser.email}
                >
                  {isSubmittingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save User"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-card">
          <div className="mb-4 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                  onClick={() => performBulkAction("invite")}
                  disabled={activeAction === "invite"}
                >
                  {activeAction === "invite" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                  onClick={() => performBulkAction("export")}
                  disabled={activeAction === "export"}
                >
                  {activeAction === "export" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-50 text-red-500 hover:bg-red-100 h-8 px-3"
                  onClick={() => performBulkAction("delete")}
                  disabled={activeAction === "delete"}
                >
                  {activeAction === "delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center rounded-lg bg-primary/5 p-2 text-sm font-medium">
                <div className="w-10 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={selectAllUsers}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="flex-1 px-4">Name / Email</div>
                <div className="w-32 text-right">Role</div>
                <div className="w-32 text-right">Status</div>
                <div className="w-32 text-right">Last Active</div>
                <div className="w-10"></div>
              </div>
              
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-10 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-4 px-4">
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
                  <div className="w-32 text-right">
                    <span className="text-sm font-medium">{user.role}</span>
                  </div>
                  <div className="w-32 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm">{user.lastActive}</p>
                  </div>
                  <div className="w-10">
                    <UserActionMenu userId={user.id} userName={user.name} />
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No users match your current filters</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-primary hover:text-primary/80"
                  >
                    Clear filters to see all users
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="dashboard-card">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <button 
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                onClick={() => performQuickAction("invite")}
                disabled={activeAction === "invite"}
              >
                {activeAction === "invite" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span className="text-sm">Invite Users</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                onClick={() => performQuickAction("review")}
                disabled={activeAction === "review"}
              >
                {activeAction === "review" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
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
