import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
    title: string;
    description: string;
    comingSoon?: string[];
}

export function PlaceholderPage({ title, description, comingSoon }: PlaceholderPageProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                        This view is being migrated from the vanilla prototype. Key features:
                    </p>
                    {comingSoon && (
                        <ul className="space-y-2">
                            {comingSoon.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
