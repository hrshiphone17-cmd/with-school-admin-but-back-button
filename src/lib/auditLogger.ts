interface AuditEntry {
  adminId: string;
  action: string;
  target: string;
  timestamp: string;
}

export function auditLog(adminId: string, action: string, target: string): AuditEntry {
  const entry: AuditEntry = {
    adminId,
    action,
    target,
    timestamp: new Date().toISOString(),
  };
  console.log("[AUDIT]", JSON.stringify(entry));
  return entry;
}
