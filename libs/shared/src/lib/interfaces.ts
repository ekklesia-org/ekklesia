// Interface de Auditoria
export interface AuditLog {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Interface para configuração da igreja
export interface ChurchSettings {
  timezone?: string;
  currency?: string;
  fiscalYear?: string;
  enabledModules?: string[];
  enableOCR?: boolean;
  ocrApiKey?: string;
  bankName?: string;
  accountNumber?: string;
}

// Interface para transações financeiras
export interface FinancialTransaction {
  description: string;
  amount: number;
  type: string;
  category: string;
  status: string;
  transactionDate: Date;
  referenceNumber?: string;
  memberId?: string;
  isFromOCR?: boolean;
  ocrData?: string;
  attachments?: string[];
}
