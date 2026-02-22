import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { signup } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Ambulance, Hospital, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ambulance' | 'hospital' | 'traffic'>('ambulance');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(email, password, name, role, badgeNumber || undefined);
      toast.success('Account created successfully! Please login.');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    ambulance: <Ambulance className="w-5 h-5" />,
    hospital: <Hospital className="w-5 h-5" />,
    traffic: <ShieldCheck className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md border-primary/20 bg-white/90 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <Ambulance className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Join RAKSH</CardTitle>
          <CardDescription>Create your emergency response account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambulance">
                    <div className="flex items-center gap-2">
                      {roleIcons.ambulance}
                      <span>Ambulance Driver</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hospital">
                    <div className="flex items-center gap-2">
                      {roleIcons.hospital}
                      <span>Hospital Staff</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="traffic">
                    <div className="flex items-center gap-2">
                      {roleIcons.traffic}
                      <span>Traffic Police</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(role === 'traffic' || role === 'ambulance') && (
              <div className="space-y-2">
                <Label htmlFor="badge">
                  {role === 'traffic' ? 'Badge Number' : 'Vehicle Number'} (Optional)
                </Label>
                <Input
                  id="badge"
                  type="text"
                  placeholder={role === 'traffic' ? 'TP-12345' : 'KA-01-AB-1234'}
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/" className="text-red-500 hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}