import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { login } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Ambulance, AlertCircle, Shield, Activity } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { access_token, user } = await login(email, password);
      console.log('Login successful!', {
        hasAccessToken: !!access_token,
        tokenPreview: access_token ? `${access_token.substring(0, 20)}...` : 'none',
        user: user
      });
      
      // Verify token was saved to localStorage
      const savedToken = localStorage.getItem('access_token');
      console.log('Token verification:', {
        tokenSaved: !!savedToken,
        tokensMatch: savedToken === access_token
      });
      
      toast.success('🚀 Login successful!');
      
      // Navigate based on role
      if (user.role === 'ambulance') {
        navigate('/ambulance');
      } else if (user.role === 'hospital') {
        navigate('/hospital');
      } else if (user.role === 'traffic') {
        navigate('/traffic');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md border-primary/20 bg-white/90 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="relative mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50 relative">
              <Ambulance className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"></div>
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-primary mb-2">
              RAKSH
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Emergency Response Coordination System
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-primary" />
                <span>Real-time</span>
              </div>
              <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Ambulance className="w-3 h-3 text-primary" />
                <span>Life-saving</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input-background border-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input-background border-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/30" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <p className="text-xs text-muted-foreground">Create an account to get started or use existing credentials.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}