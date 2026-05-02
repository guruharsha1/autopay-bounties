import ProfileCard from "@/components/ProfileCard";

export default function ProfilePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-slate-400">
        Register your GitHub username so webhook payouts can resolve your wallet.
      </p>
      <ProfileCard />
    </section>
  );
}
