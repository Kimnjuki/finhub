import { Card, CardContent } from "@/components/ui/card";

interface FeatureCard {
  title: string;
  text: string;
}

interface FeatureCardsProps {
  columns: number;
  cards: FeatureCard[];
}

const FeatureCards = ({ columns, cards }: FeatureCardsProps) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[columns] || "md:grid-cols-3";

  return (
    <section className="py-16 px-4">
      <div className={`max-w-7xl mx-auto grid grid-cols-1 ${gridCols} gap-6`}>
        {cards.map((card, index) => (
          <Card key={index} className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
