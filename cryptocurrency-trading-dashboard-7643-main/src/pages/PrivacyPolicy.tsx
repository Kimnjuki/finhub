import { Card, CardContent } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy - FINHUBAFRICA | Data Protection & User Privacy"
        description="Read FINHUBAFRICA's privacy policy to understand how we protect your data, manage your information, and ensure your privacy while using our crypto and forex trading platform."
        keywords="privacy policy, data protection, user privacy, GDPR, data security, cryptocurrency privacy, forex trading privacy"
      />
      <main className="min-h-screen bg-background pt-28 lg:pt-24">
        <MobileNavigation />
        
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your privacy and data security are our top priorities
            </p>
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Our Commitment to Privacy</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We value your privacy. At FINHUBAFRICA, we are committed to protecting your personal information 
                      and being transparent about how we collect, use, and safeguard your data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Information We Collect</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p><strong className="text-foreground">Email Addresses:</strong> Emails are collected only for newsletter communication and account management purposes.</p>
                      <p><strong className="text-foreground">Usage Data:</strong> We collect anonymous analytics data to improve our platform and user experience.</p>
                      <p><strong className="text-foreground">Trading Data:</strong> Portfolio and trading information you input into our calculators and tools are stored locally on your device.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">How We Use Your Information</h2>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>To send you weekly crypto insights and market updates (only if you subscribe to our newsletter)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>To provide and improve our trading platform and tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>To analyze platform usage and optimize user experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>To comply with legal obligations and prevent fraudulent activity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Data Protection & Security</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">We never share user data with third parties.</strong> Your personal information 
                    remains confidential and is protected using industry-standard security measures.
                  </p>
                  <p>
                    All data transmission is encrypted using SSL/TLS protocols. We implement strict access controls 
                    and regularly audit our security practices to ensure your data remains safe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Cookies & Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By using our platform, you agree to standard data practices and cookies. We use cookies to:
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Remember your preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Analyze platform performance and user behavior</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Provide personalized content and features</span>
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  You can control cookie settings through your browser preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Access your personal data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Request correction of inaccurate data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Request deletion of your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Unsubscribe from our newsletter at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Object to data processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use trusted third-party services for specific functionalities (such as CoinGecko for market data). 
                  These services have their own privacy policies, and we recommend reviewing them. We do not share 
                  your personal information with these services beyond what's necessary for platform functionality.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify users of any significant changes via email or platform notification.
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong className="text-foreground">Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Questions or Concerns?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this privacy policy or how we handle your data, 
                  please contact us through our support channels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default PrivacyPolicy;
