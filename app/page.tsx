import CandyRain from "@/components/CandyRain";
import Hero from "@/components/Hero";
import Institutional from "@/components/Institutional";
import ProductSection from "@/components/ProductSection";
import ScrollProgress from "@/components/ScrollProgress";
import { PRODUCTS } from "@/lib/products";

export default function Page() {
  return (
    <>
      <ScrollProgress />
      <CandyRain />

      <main>
        <Hero />

        {PRODUCTS.map((product, index) => (
          <ProductSection
            key={product.id}
            product={product}
            previous={PRODUCTS[index - 1]}
            index={index}
          />
        ))}

        <Institutional />
      </main>
    </>
  );
}
