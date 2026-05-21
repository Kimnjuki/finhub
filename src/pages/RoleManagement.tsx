import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { Users, UserPlus, Shield, Search } from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";

interface UserWithRoles {
  userId: string;
  email: string;
  createdAt: number;
  roles: string[];
}

const RoleManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);

  const usersData = useQuery(api.admin.recentUsers);
  const assignRoleMutation = useMutation(api.queries.helpers.assignRole);

  const availableRoles = ["admin", "vip_user", "analyst", "user"];

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData as unknown as UserWithRoles[]);
    }
  }, [usersData]);

  useEffect(() => {
    if (!users) return;
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user =>
        user.roles?.includes(roleFilter)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleAssignRole = async () => {
    if (!selectedUserId || !newRole) return;
    try {
      await assignRoleMutation({ userId: selectedUserId, roleName: newRole });
      toast({
        title: "Success",
        description: `Role "${newRole}" assigned successfully`,
      });
      setIsAssignRoleOpen(false);
      setSelectedUserId(null);
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

  const loading = !usersData;

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
                              setSelectedUserId(userId);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.userId} value={user.userId}>
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
                          onClick={handleAssignRole}
                          disabled={!selectedUserId || !newRole}
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
                        <TableHead>Roles</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role: string) => (
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
                            {new Date(user.createdAt).toLocaleDateString()}
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
                const roleUsers = users.filter(user => user.roles?.includes(role));
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
                          <div key={user.userId} className="text-sm text-muted-foreground">
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