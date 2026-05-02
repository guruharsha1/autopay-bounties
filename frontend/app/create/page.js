import CreateBountyForm from "@/components/CreateBountyForm";

export default function CreatePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Bounty</h1>
      <p className="text-slate-400">
        Escrow SOL in the bounty PDA for a GitHub issue.
      </p>
      <CreateBountyForm />
    </section>
  );
}
