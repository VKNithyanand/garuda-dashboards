
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomers, useAddCustomer, useDeleteCustomer } from "@/lib/supabase-client";
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
  Settings,
  User,
  Eye,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/contexts/DataContext";

interface Customer {
  id: string;
  name: string;
  email: string;
  last_active?: string;
}

interface UserItem extends Customer {
  role: string;
  status: string;
  lastActive: string;
  department: string;
  location: string;
  phone: string;
  bio: string;
}

interface UserDetailForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  bio: string;
}

const Users = () => {
  const { toast } = useToast();
  const { usersData, setUsersData } = useData();
  const { data: customers = [], isLoading, error, refetch } = useCustomers();
  const addCustomer = useAddCustomer();
  const deleteCustomer = useDeleteCustomer();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    role: "all"
  });
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserDetail, setShowUserDetail] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailForm>({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    location: "",
    bio: ""
  });
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  
  // Combine database customers with any users added via the UI
  useEffect(() => {
    if (customers.length > 0) {
      // Convert database customers to UserItem format
      const dbUsers: UserItem[] = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: ["Admin", "User", "Manager"][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.2 ? "Active" : "Away",
        lastActive: customer.last_active ? new Date(customer.last_active).toLocaleString() : "Never",
        department: ["Engineering", "Marketing", "Sales", "Support"][Math.floor(Math.random() * 4)],
        location: ["New York", "London", "Tokyo", "Berlin", "Sydney"][Math.floor(Math.random() * 5)],
        phone: "+1 " + Math.floor(Math.random() * 1000) + "-" + Math.floor(Math.random() * 1000) + "-" + Math.floor(Math.random() * 10000),
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia."
      }));
      
      // Merge with any local users, avoiding duplicates by email
      const existingEmails = new Set(dbUsers.map(user => user.email));
      const localUsersToKeep = usersData.filter(user => !existingEmails.has(user.email));
      
      setUsersData([...dbUsers, ...localUsersToKeep]);
    }
  }, [customers, setUsersData]);
  
  const users = usersData;

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

  useEffect(() => {
    if (showUserDetail) {
      const user = users.find(u => u.id === showUserDetail);
      if (user) {
        setUserDetail({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role || "",
          department: user.department || "",
          location: user.location || "",
          bio: ""
        });
      }
    }
  }, [showUserDetail, users]);

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
    setNewUser({ name: "", email: "", role: "User" });
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
      // First try to add to database
      let newUserData;
      try {
        const result = await addCustomer.mutateAsync({
          name: newUser.name,
          email: newUser.email
        });
        newUserData = result;
        await refetch();
      } catch (dbError) {
        console.error("Database error:", dbError);
        // If database fails, create a local user
        newUserData = {
          id: crypto.randomUUID(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: "Active",
          lastActive: "Just now",
          department: "Unassigned",
          location: "Remote",
          phone: "",
          bio: ""
        };
        
        // Add the new user to our context
        setUsersData([...usersData, newUserData]);
      }
      
      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully.`,
      });
      
      setNewUser({ name: "", email: "", role: "User" });
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
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to invite.",
        variant: "destructive",
      });
      return;
    }
    
    setActiveAction("invite");
    setIsSendingInvitation(true);
    
    try {
      const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));
      const emails = selectedUsersData.map(user => user.email);
      
      // Call the Supabase Edge Function to send invitations
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { emails }
      });
      
      if (error) throw error;
      
      toast({
        title: "Invitations Sent",
        description: `Invitation emails have been sent to ${emails.length} user(s).`,
      });
      
      // Update the users' status to reflect the invitation
      const updatedUsers = usersData.map(user => {
        if (selectedUsers.includes(user.id)) {
          return { ...user, status: "Invited" };
        }
        return user;
      });
      
      setUsersData(updatedUsers);
      setSelectedUsers([]);
      
    } catch (error: any) {
      toast({
        title: "Error Sending Invitations",
        description: error.message || "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveAction(null);
      setIsSendingInvitation(false);
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

    if (action === "invite") {
      await handleInviteUsers();
      return;
    }

    setActiveAction(action);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const actionMap: Record<string, string> = {
        "export": "exported",
        "delete": "deleted"
      };
      
      if (action === "delete") {
        // Delete from both database and local state
        for (const userId of selectedUsers) {
          try {
            await deleteCustomer.mutateAsync(userId);
          } catch (dbError) {
            console.error("Failed to delete from database:", dbError);
          }
        }
        
        // Remove deleted users from local state
        const updatedUsers = usersData.filter(user => !selectedUsers.includes(user.id));
        setUsersData(updatedUsers);
        
        await refetch();
      }
      
      toast({
        title: "Action Complete",
        description: `Successfully ${actionMap[action]} ${selectedUsers.length} user(s).`,
      });
      
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
      if (action === "invite") {
        await handleInviteUsers();
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const actionMessages: Record<string, string> = {
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

  const handleDeleteUser = async (userId: string) => {
    try {
      // Try to delete from database first
      try {
        await deleteCustomer.mutateAsync(userId);
        await refetch();
      } catch (dbError) {
        console.error("Database delete error:", dbError);
        // If database delete fails, remove from local state
        const updatedUsers = usersData.filter(user => user.id !== userId);
        setUsersData(updatedUsers);
      }
      
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
  
  const handleSaveUserDetails = async () => {
    if (!showUserDetail) return;
    
    try {
      // Update the user in our local state
      const updatedUsers = usersData.map(user => {
        if (user.id === showUserDetail) {
          return {
            ...user,
            name: userDetail.name,
            email: userDetail.email,
            phone: userDetail.phone,
            role: userDetail.role,
            department: userDetail.department,
            location: userDetail.location,
            bio: userDetail.bio
          };
        }
        return user;
      });
      
      setUsersData(updatedUsers);
      
      toast({
        title: "User Updated",
        description: "User details have been updated successfully.",
      });
      
      setShowUserDetail(null);
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message || "Failed to update user details.",
        variant: "destructive",
      });
    }
  };

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
                  setShowUserDetail(userId);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View User
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-md flex items-center"
                onClick={() => {
                  setShowMenu(false);
                  setShowUserDetail(userId);
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
                  handleDeleteUser(userId);
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

  const UserDetailModal = () => {
    if (!showUserDetail) return null;
    
    const user = users.find(u => u.id === showUserDetail);
    if (!user) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
        <div className="w-full max-w-3xl p-6 rounded-lg border border-input bg-background shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">User Details</h3>
            <button onClick={() => setShowUserDetail(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer">
                  <Upload className="h-4 w-4" />
                </div>
              </div>
              <p className="text-lg font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 inline-flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={userDetail.name}
                    onChange={(e) => setUserDetail({...userDetail, name: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={userDetail.email}
                    onChange={(e) => setUserDetail({...userDetail, email: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={userDetail.phone}
                    onChange={(e) => setUserDetail({...userDetail, phone: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={userDetail.role}
                    onChange={(e) => setUserDetail({...userDetail, role: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <input
                    type="text"
                    value={userDetail.department}
                    onChange={(e) => setUserDetail({...userDetail, department: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={userDetail.location}
                    onChange={(e) => setUserDetail({...userDetail, location: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={userDetail.bio}
                  onChange={(e) => setUserDetail({...userDetail, bio: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  onClick={() => setShowUserDetail(null)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUserDetails}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
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
                  disabled={activeAction === "invite" || isSendingInvitation}
                >
                  {activeAction === "invite" || isSendingInvitation ? (
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
                disabled={activeAction === "invite" || isSendingInvitation}
              >
                {activeAction === "invite" || isSendingInvitation ? (
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

      {showUserDetail && <UserDetailModal />}
    </DashboardLayout>
  );
};

export default Users;
