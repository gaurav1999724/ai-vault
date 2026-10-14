import { AdminHeader } from "@/components/admin/admin-header";
import { ProfileForm } from "@/components/admin/profile-form";
import { getEditorOptions, getProfileForm } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function ProfileAdminPage() {
  const [admin, profile, options] = await Promise.all([getCurrentAdmin(), getProfileForm(), getEditorOptions()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Profile" />
      <div className="p-4 md:p-8">
        <ProfileForm initial={profile} assets={options.assets} />
      </div>
    </>
  );
}
