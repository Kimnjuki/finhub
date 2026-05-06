import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Shield, Settings, Search, Filter } from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";

interface User {
  user_id: string;
  email: string;
  created_at: string;
  is_verified: boolean;
  subscription_tier_id: string | null;
}

interface UserRole {
  user_id: string;
  role_name: string;
  assigned_at: string;
}

interface UserWithRoles extends User {
  roles: string[];
}

const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);

  const availableRoles = ["admin", "vip_user", "analyst", "user"];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their roles using a SQL function
      const { data: usersWithRolesData, error } = await supabase
        .rpc('get_users_with_roles' as any);

      if (error) {
        // Fallback: fetch users separately and roles will be empty
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;

        const usersWithRoles: UserWithRoles[] = (usersData || []).map(user => ({
          ...user,
          roles: []
        }));

        setUsers(usersWithRoles);
        return;
      }

      setUsers(usersWithRolesData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user =>
        user.roles.includes(roleFilter)
      );
    }

    setFilteredUsers(filtered);
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const { error } = await supabase
        .rpc('assign_user_role' as any, {
          user_id: userId,
          role_name: roleName
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${roleName}" assigned successfully`,
      });

      fetchUsers();
      setIsAssignRoleOpen(false);
      setSelectedUser(null);
      setNewRole("");
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      const { error } = await supabase
        .rpc('remove_user_role' as any, {
          user_id: userId,
          role_name: roleName
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${roleName}" removed successfully`,
      });

      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'vip_user':
        return 'default';
      case 'analyst':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'vip_user':
        return '⭐';
      case 'analyst':
        return '📊';
      default:
        return '👤';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <MobileNavigation />
        <div className="max-w-7xl mx-auto p-8 pt-24 lg:pt-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <MobileNavigation />
      
      <div className="max-w-7xl mx-auto p-8 pt-24 lg:pt-8">
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gradient animate-bounce-in">
            Role Management
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-slide-up">
            Manage user roles and permissions across the platform
          </p>
        </header>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search by email</Label>
                    <Input
                      id="search"
                      placeholder="Enter email address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="lg:w-48">
                    <Label htmlFor="role-filter">Filter by role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>
                            {getRoleIcon(role)} {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users ({filteredUsers.length})
                  </span>
                  <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-primary">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card">
                      <DialogHeader>
                        <DialogTitle>Assign Role to User</DialogTitle>
                        <DialogDescription>
                          Select a user and role to assign.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="user-select">Select User</Label>
                          <Select
                            onValueChange={(userId) => {
                              const user = users.find(u => u.user_id === userId);
                              setSelectedUser(user || null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.user_id} value={user.user_id}>
                                  {user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="role-select">Select Role</Label>
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a role" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map(role => (
                                <SelectItem key={role} value={role}>
                                  {getRoleIcon(role)} {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => selectedUser && newRole && assignRole(selectedUser.user_id, newRole)}
                          disabled={!selectedUser || !newRole}
                          className="btn-primary"
                        >
                          Assign Role
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.is_verified ? "default" : "secondary"}>
                              {user.is_verified ? "✓ Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Badge 
                                    key={role} 
                                    variant={getRoleBadgeVariant(role)}
                                    className="text-xs"
                                  >
                                    {getRoleIcon(role)} {role}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  No roles
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.roles.map((role) => (
                                <Button
                                  key={role}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeRole(user.user_id, role)}
                                  className="text-xs"
                                >
                                  Remove {role}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableRoles.map((role) => {
                const roleUsers = users.filter(user => user.roles.includes(role));
                return (
                  <Card key={role} className="glass-card card-hover">
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-2">{getRoleIcon(role)}</div>
                      <CardTitle className="capitalize">{role.replace('_', ' ')}</CardTitle>
                      <CardDescription>
                        {roleUsers.length} user{roleUsers.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {roleUsers.slice(0, 3).map((user) => (
                          <div key={user.user_id} className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        ))}
                        {roleUsers.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{roleUsers.length - 3} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RoleManagement;