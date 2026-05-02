import BountyBoard from "@/components/BountyBoard";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Bounty Board</h1>
      <p className="text-slate-400">
        Open bounties are paid automatically when a matching PR is merged.
      </p>
      <BountyBoard />
    </section>
  );
}
