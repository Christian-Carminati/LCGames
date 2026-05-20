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

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'is-success',
  UPDATE: 'is-warning',
  DELETE: 'is-error',
};

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <span className="nes-text is-primary" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px' }}>
          Loading logs...
        </span>
      </div>
    );
  }

  return (
    <div className="nes-container is-dark is-rounded with-title" style={{ padding: '16px' }}>
      <p className="title" style={{ fontSize: '12px' }}>▶ System Audit Log</p>
      <div className="nes-table-responsive">
        <table className="nes-table is-bordered is-dark" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>Date</th>
              <th style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>Action</th>
              <th style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>Entity</th>
              <th style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px' }}>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td>
                  <span className="nes-badge" style={{ display: 'inline-block' }}>
                    <span className={ACTION_COLORS[e.action] || 'is-warning'}>
                      {e.action}
                    </span>
                  </span>
                </td>
                <td style={{ fontSize: '10px' }}>{e.entityType}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '10px' }}>
                  {e.entityId}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  <span className="nes-text is-disabled" style={{ fontSize: '10px' }}>No audit entries yet</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
