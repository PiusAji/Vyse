import AllShoesSection from "@/components/AllShoesSection";
import { getPageSections } from "@/lib/admin-page-api";
import { getAllProductsWithTags } from "@/lib/api";

export default async function ProductsPage() {
  const products = await getAllProductsWithTags();
  const sections = await getPageSections("all-shoes");

  const allShoesSection = sections.find(
    (s) => s.section === "allshoes" && s.isActive
  );

  return (
    <div>
      {allShoesSection && (
        <AllShoesSection
          content={allShoesSection.content}
          products={products}
        />
      )}
    </div>
  );
}
