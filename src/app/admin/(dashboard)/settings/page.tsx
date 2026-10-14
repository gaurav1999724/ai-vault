import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getEditorOptions, getSettingsForm } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function SettingsPage() {
  const [admin, settings, options] = await Promise.all([getCurrentAdmin(), getSettingsForm(), getEditorOptions()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Website settings" />
      <div className="p-4 md:p-8">
        <SettingsForm initial={settings} assets={options.assets} />
      </div>
    </>
  );
}
