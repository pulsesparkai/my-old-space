import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

  if (user) {
    window.location.href = '/app';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
            Top8.io
          </h1>
          <p className="text-2xl mb-8 opacity-90">
            The nostalgic social network you've been waiting for
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">
            Remember MySpace? We're bringing back the magic of customizable profiles, 
            your Top 8 friends, and that early 2000s internet energy.
          </p>
          
          <div className="space-x-4">
            <Link to="/auth">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-lg">
                Sign Up
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Custom Themes</h3>
              <p className="opacity-80">Express yourself with customizable backgrounds, colors, and that classic MySpace aesthetic.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Your Top 8</h3>
              <p className="opacity-80">Curate your closest friends and show the world who matters most to you.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Profile Comments</h3>
              <p className="opacity-80">Let friends leave messages on your profile, just like the good old days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
