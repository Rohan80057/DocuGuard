export type DocumentId = string;

export type Resolution = 'accept_doc1' | 'accept_doc2' | 'ignore' | null;

export interface Document {
  id: DocumentId;
  title: string;
  content: string;
}

export interface Conflict {
  id: string;
  documentIds: [DocumentId, DocumentId];
  documentTitles: [string, string];
  excerpts: [string, string];
  explanation: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'unresolved' | 'resolved' | 'ignored';
  resolution: Resolution;
}

export interface HistoryEvent {
  id: string;
  type: 'analysis_started' | 'analysis_complete' | 'conflict_resolved' | 'report_generated';
  details: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}
