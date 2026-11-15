import { ZReportView } from "../_components/ZReportView";

export default async function ShiftReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ZReportView id={id} />;
}
