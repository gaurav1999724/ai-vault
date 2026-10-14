import { AdminHeader } from "@/components/admin/admin-header";
import { MessageList } from "@/components/admin/message-list";
import { listMessages } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function MessagesPage() {
  const [admin, messages] = await Promise.all([getCurrentAdmin(), listMessages()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Contact messages" />
      <div className="p-4 md:p-8">
        <MessageList messages={messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString(), readAt: message.readAt?.toISOString() || null }))} />
      </div>
    </>
  );
}
