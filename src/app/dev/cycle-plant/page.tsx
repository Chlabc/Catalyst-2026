import { notFound } from "next/navigation";
import { CyclePlantGallery } from "@/components/canvas/CyclePlantGallery";

export default function CyclePlantPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <CyclePlantGallery />;
}
