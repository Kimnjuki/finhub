import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface AdSpaceProps {
  title?: string;
}

const AdSpace = ({ title = "Advertisement Space" }: AdSpaceProps) => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
              </div>
              <div className="min-h-[200px] bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div id="ad-banner" className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Ad content will display here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdSpace;
