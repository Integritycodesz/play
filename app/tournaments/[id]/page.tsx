import { TournamentDetailView } from "@/components/tournaments/tournament-detail-view";

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <TournamentDetailView id={id} />
    );
}
