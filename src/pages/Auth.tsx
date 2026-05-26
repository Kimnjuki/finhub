const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 shadow-lg">
              <div className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-vogun text-gradient-green tracking-wide">
            FINHUBAFRICA
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Authentication coming soon
          </p>
        </div>

        <div className="glass-card border-primary/20 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Sign In / Sign Up</h2>
          <p className="text-muted-foreground mb-6">
            Authentication features are coming soon. All pages are currently accessible without signing in.
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </a>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Explore all features without authentication
          </p>
          <div className="mt-2">
            <a href="/markets" className="text-xs text-primary hover:underline">
              Browse Markets
            </a>
            <span className="text-xs text-muted-foreground mx-2">|</span>
            <a href="/analytics" className="text-xs text-primary hover:underline">
              View Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;