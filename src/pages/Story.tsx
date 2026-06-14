import { PageHeader, Card } from "../components/UI";

export default function Story() {
  return (
    <div>
      <PageHeader title="The Story of Jango.US" subtitle="Backstory and lore of the arena." />
      <Card glow>
        <h3 style={{ marginTop: 0 }}>Welcome to the Arena</h3>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Jango.US is a competitive arena where players sharpen skill across fast 1v1 games. Earn Scaps,
          climb the ranks, and prove yourself from rookie lobbies to championship brackets.
        </p>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Every match is pure skill. No pay-to-win, no luck boxes deciding outcomes — just you, your
          aim, and the leaderboard. This is where competitors are made.
        </p>
      </Card>
    </div>
  );
}
