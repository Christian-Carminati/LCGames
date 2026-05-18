import AuditLogTable from '@/components/admin/AuditLogTable';

export default function AuditPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>
      <AuditLogTable />
    </div>
  );
}
