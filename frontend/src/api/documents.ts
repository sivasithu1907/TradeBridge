import { apiClient } from './client';

export interface UploadedDocument {
  id: string;
  fileName: string;
  docType: string;
  status: 'pending_review' | 'verified' | 'rejected';
  uploadedAt: string;
  fileSizeBytes: number;
  bookingNumber: string | null;
}

interface RawDocument {
  id: string;
  file_name: string;
  doc_type: string;
  status: 'pending_review' | 'verified' | 'rejected';
  uploaded_at: string;
  file_size_bytes: string;
  booking_number: string | null;
}

function toFrontend(d: RawDocument): UploadedDocument {
  return {
    id: d.id,
    fileName: d.file_name,
    docType: d.doc_type,
    status: d.status,
    uploadedAt: d.uploaded_at,
    fileSizeBytes: Number(d.file_size_bytes),
    bookingNumber: d.booking_number,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const documentApi = {
  async list(): Promise<UploadedDocument[]> {
    const { documents } = await apiClient.get<{ documents: RawDocument[] }>('/documents');
    return documents.map(toFrontend);
  },

  formatFileSize,

  /**
   * Real file upload via FormData/multipart -- the backend validates
   * actual file content (magic bytes), not just a filename string.
   * Exactly one of rfqId/bookingId/shipmentId should be provided to
   * anchor what this document is attached to.
   */
  async upload(
    file: File,
    docType: string,
    anchor: { rfqId?: string; bookingId?: string; shipmentId?: string }
  ): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    if (anchor.rfqId) formData.append('rfqId', anchor.rfqId);
    if (anchor.bookingId) formData.append('bookingId', anchor.bookingId);
    if (anchor.shipmentId) formData.append('shipmentId', anchor.shipmentId);

    const { document } = await apiClient.postForm<{ document: RawDocument }>('/documents', formData);
    return toFrontend(document);
  },

  downloadUrl(documentId: string): string {
    const base = (import.meta.env.VITE_API_URL || '/api') as string;
    return `${base}/documents/${documentId}/download`;
  },
};
