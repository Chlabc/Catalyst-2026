import { Container } from "@/components/ui/Container";
import { SOSWidget } from "@/components/canvas/SOSWidget";

export default function SOSPage() {
    return (
        <Container>
            <div className="py-12">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Care and support
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">SOS</h1>
                <p className="mt-3 max-w-xl text-text-muted">
                    A dedicated space for trusted support tools. The care hub content can
                    be added here without changing the rest of the Blossom dashboard.
                </p>
                <div className="mt-8 max-w-lg">
                    <SOSWidget />
                </div>
            </div>
        </Container>
    );
}
