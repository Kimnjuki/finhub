import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, MessageCircle, Heart, Share2, Twitter, RefreshCw, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface SocialPost {
  id: string;
  platform: 'reddit' | 'twitter';
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  engagement: number;
  timestamp: string;
  symbol: string;
  author: string;
  verified: boolean;
}

interface TrendingTopic {
  symbol: string;
  socialVolume: number;
  sentimentScore: number; // -100 to 100
  mentions24h: number;
  priceCorrelation: number;
  trending: boolean;
  platforms: {
    reddit: { mentions: number; sentiment: number };
    twitter: { mentions: number; sentiment: number };
  };
  topHashtags: string[];
}

const fetchSocialData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'LINK', 'XRP'];
  
  const trendingTopics: TrendingTopic[] = symbols.map(symbol => {
    const sentimentScore = (Math.random() - 0.5) * 200; // -100 to 100
    const socialVolume = Math.floor(Math.random() * 10000) + 1000;
    const mentions24h = Math.floor(Math.random() * 5000) + 500;
    
    return {
      symbol,
      socialVolume,
      sentimentScore,
      mentions24h,
      priceCorrelation: Math.random() * 100,
      trending: Math.random() > 0.6,
      platforms: {
        reddit: {
          mentions: Math.floor(mentions24h * 0.3),
          sentiment: sentimentScore + (Math.random() - 0.5) * 40
        },
        twitter: {
          mentions: Math.floor(mentions24h * 0.7),
          sentiment: sentimentScore + (Math.random() - 0.5) * 40
        }
      },
      topHashtags: [
        `#${symbol}`,
        `#${symbol}USD`,
        '#crypto',
        '#blockchain',
        '#trading'
      ].slice(0, Math.floor(Math.random() * 3) + 3)
    };
  });

  const socialPosts: SocialPost[] = Array.from({ length: 8 }, (_, i) => ({
    id: `post-${i}`,
    platform: Math.random() > 0.5 ? 'reddit' : 'twitter',
    content: [
      "Just bought more $BTC! This dip is a gift 🎁",
      "$ETH looking strong above $2600 resistance 💪",
      "Anyone else seeing this $SOL pattern? Moon incoming? 🚀",
      "$ADA holders, patience will be rewarded 🙏",
      "Technical analysis says $LINK is ready to breakout 📊",
      "$MATIC polygon ecosystem growing fast 🌱",
      "Bear market? More like discount season! $BTC $ETH",
      "DeFi summer returning? $UNI $AAVE looking good 🏖️"
    ][i],
    sentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as any,
    engagement: Math.floor(Math.random() * 1000) + 50,
    timestamp: `${Math.floor(Math.random() * 24)}h ago`,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    author: `user${Math.floor(Math.random() * 1000)}`,
    verified: Math.random() > 0.7
  }));

  return { trendingTopics, socialPosts };
};

const SocialSentiment = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['socialSentiment'],
    queryFn: fetchSocialData,
    refetchInterval: 60000, // Refresh every minute
  });

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 20) return 'text-success';
    if (sentiment < -20) return 'text-destructive';
    return 'text-warning';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 20) return <TrendingUp className="w-4 h-4" />;
    if (sentiment < -20) return <TrendingDown className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'reddit': return <Globe className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-vogun">
            <MessageCircle className="w-5 h-5" />
            Social Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-vogun">
            <div className="p-2 bg-accent/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-accent" />
            </div>
            Social Sentiment & Trends
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="hover:bg-accent/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time sentiment from Reddit and Twitter/X
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trending">Trending Topics</TabsTrigger>
            <TabsTrigger value="posts">Social Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-4">
            {data?.trendingTopics.slice(0, 6).map((topic, index) => (
              <div
                key={topic.symbol}
                className="p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg font-mono">${topic.symbol}</span>
                    {topic.trending && (
                      <Badge className="bg-warning/20 text-warning border-warning/30 animate-pulse">
                        🔥 Trending
                      </Badge>
                    )}
                    <div className={`flex items-center gap-1 ${getSentimentColor(topic.sentimentScore)}`}>
                      {getSentimentIcon(topic.sentimentScore)}
                      <span className="text-sm font-medium">
                        {topic.sentimentScore > 0 ? '+' : ''}{topic.sentimentScore.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{topic.mentions24h.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">mentions</div>
                  </div>
                </div>
                
                {/* Sentiment Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Bearish</span>
                    <span>Sentiment Score</span>
                    <span>Bullish</span>
                  </div>
                  <Progress 
                    value={(topic.sentimentScore + 100) / 2} 
                    className="h-2 bg-muted"
                  />
                </div>
                
                {/* Platform Breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-orange-500" />
                    <span>Reddit: {topic.platforms.reddit.mentions}</span>
                    <span className={getSentimentColor(topic.platforms.reddit.sentiment)}>
                      ({topic.platforms.reddit.sentiment > 0 ? '+' : ''}{topic.platforms.reddit.sentiment.toFixed(0)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="w-4 h-4 text-blue-500" />
                    <span>Twitter: {topic.platforms.twitter.mentions}</span>
                    <span className={getSentimentColor(topic.platforms.twitter.sentiment)}>
                      ({topic.platforms.twitter.sentiment > 0 ? '+' : ''}{topic.platforms.twitter.sentiment.toFixed(0)})
                    </span>
                  </div>
                </div>
                
                {/* Hashtags */}
                <div className="flex flex-wrap gap-2">
                  {topic.topHashtags.map((hashtag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs hover:bg-primary/20 cursor-pointer">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="posts" className="space-y-4">
            {data?.socialPosts.map((post, index) => (
              <div
                key={post.id}
                className="p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{post.author}</span>
                      {post.verified && (
                        <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
                      <Badge className={`text-xs ml-auto ${
                        post.sentiment === 'bullish' ? 'bg-success/20 text-success' :
                        post.sentiment === 'bearish' ? 'bg-destructive/20 text-destructive' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {post.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.engagement}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{Math.floor(post.engagement * 0.3)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        <span>{Math.floor(post.engagement * 0.1)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs ml-auto">
                        ${post.symbol}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SocialSentiment;