import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  CreditCard,
  BarChart3,
  Shield,
  Crown,
  Star,
} from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";

const AdminDashboard = () => {
  const stats = useQuery(api.admin.dashboardStats);
  const recentTransactions = useQuery(api.admin.recentTransactions);
  const recentUsers = useQuery(api.admin.recentUsers);

  const loading = stats === undefined || recentTransactions === undefined || recentUsers === undefined;

  const getSubscriptionBadge = (tier: string, status: string) => {
    if (status !== "active" && tier !== "Free") {
      return <Badge variant="outline">Inactive</Badge>;
    }
    switch (tier) {
      case "Premium":
        return <Badge variant="default" className="bg-primary">Premium</Badge>;
      case "VIP":
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        );
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin"))
      return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    if (roles.includes("vip_user"))
      return <Badge variant="default"><Star className="h-3 w-3 mr-1" />VIP User</Badge>;
    if (roles.includes("analyst"))
      return <Badge variant="secondary"><BarChart3 className="h-3 w-3 mr-1" />Analyst</Badge>;
    return null;
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

  const totalUsers = stats?.totalUsers ?? 0;
  const activeSubscriptions = stats?.activeSubscriptions ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <MobileNavigation />
      <div className="max-w-7xl mx-auto p-8 pt-24 lg:pt-8">
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gradient animate-bounce-in">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-slide-up">
            Monitor platform performance, user activity, and revenue metrics
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Paying customers</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">Recurring revenue</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Free to paid conversion</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                Free Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.freeUsers ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                Premium Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.premiumUsers ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                VIP Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.vipUsers ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Users
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Recent Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest registered users and their subscription status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentUsers ?? []).map((user: any) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user.subscriptionTier, user.subscriptionStatus)}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.roles) || <Badge variant="outline">User</Badge>}
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentTransactions ?? []).map((tx: any) => (
                      <TableRow key={tx._id}>
                        <TableCell className="font-medium">${tx.amount}</TableCell>
                        <TableCell className="capitalize">{tx.transactionType}</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === "completed" ? "default" : "outline"}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
