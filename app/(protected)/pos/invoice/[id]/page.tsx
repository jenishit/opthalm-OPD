import { InvoicePrintView } from "./_components/InvoicePrintView";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoicePrintView id={id} />;
}
