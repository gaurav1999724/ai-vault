import { AdminHeader } from "@/components/admin/admin-header";
import { CategoryManager } from "@/components/admin/category-manager";
import { listCategories, getEditorOptions } from "@/lib/data/admin";
import { getCurrentAdmin } from "@/lib/auth";

export default async function CategoriesPage() {
  const [admin, categories, options] = await Promise.all([getCurrentAdmin(), listCategories(), getEditorOptions()]);
  return (
    <>
      <AdminHeader name={admin?.name || "Admin"} title="Categories" />
      <div className="p-4 md:p-8">
        <CategoryManager
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            coverAssetId: category.coverAssetId,
            displayOrder: category.displayOrder,
            published: category.published,
            count: category._count.creations,
          }))}
          assets={options.assets}
        />
      </div>
    </>
  );
}
