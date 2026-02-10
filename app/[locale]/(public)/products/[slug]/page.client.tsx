"use client";

import { notFound } from "next/navigation";
import { ProductPageTemplate } from "@/_components/products";
import { getProductConfig, productExists } from "../_config";

interface ProductPageClientProps {
  params: {
    slug: string;
    locale: string;
  };
}

export default function ProductPageClient({ params }: ProductPageClientProps) {
  const { slug } = params;

  if (!productExists(slug)) notFound();

  const config = getProductConfig(slug);
  return <ProductPageTemplate {...config} />;
}
