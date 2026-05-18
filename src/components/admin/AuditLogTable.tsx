'use client';

import { useState, useEffect } from 'react';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminId: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
}

export default function AuditLogTable() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="nes-table-responsive">
      <table className="nes-table is-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              <td>{new Date(e.createdAt).toLocaleString()}</td>
              <td><span className="nes-badge"><span className="is-warning">{e.action}</span></span></td>
              <td>{e.entityType}</td>
              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.entityId}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr><td colSpan={4} className="text-center">No audit entries yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
