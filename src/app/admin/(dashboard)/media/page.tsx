import { AdminHeader } from "@/components/admin/admin-header";
import { MediaLibrary } from "@/components/admin/media-library";
import { listMedia } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await getCurrentAdmin();
  const query = (await searchParams).q || "";
  const assets = await listMedia(query);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Media library" />
      <div className="p-4 md:p-8">
        <MediaLibrary
          query={query}
          assets={assets.map((asset) => ({
            id: asset.id,
            publicUrl: asset.publicUrl,
            thumbnailUrl: asset.thumbnailUrl,
            kind: asset.kind,
            originalFilename: asset.originalFilename,
            altText: asset.altText,
            width: asset.width,
            height: asset.height,
            mimeType: asset.mimeType,
            sizeBytes: asset.fileBytes > BigInt(0) ? Number(asset.fileBytes) : asset.sizeBytes,
          }))}
        />
      </div>
    </>
  );
}
