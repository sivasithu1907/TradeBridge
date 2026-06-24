import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { documentApi, UploadedDocument } from '../../api/documents';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'certificate_of_origin', label: 'Certificate of Origin' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'customs_form', label: 'Customs Declaration' },
  { value: 'other', label: 'Other' },
];

function docTypeLabel(value: string): string {
  return DOC_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const DocumentsCenter: React.FC = () => {
  const { shipments } = useMarketplace();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('commercial_invoice');
  const [shipmentId, setShipmentId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    documentApi
      .list()
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load documents'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (shipments.length > 0 && !shipmentId) setShipmentId(shipments[0].id);
  }, [shipments, shipmentId]);

  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }
    if (!shipmentId) {
      setError('You need at least one confirmed shipment to attach a document to.');
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await documentApi.upload(selectedFile, docType, { shipmentId });
      setDocuments((prev) => [uploaded, ...prev]);
      setShowUploadModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Document Center</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Bills of lading, commercial invoices, and other shipment documents
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowUploadModal(true)}
          icon={<UploadCloud className="w-4 h-4" />}
          disabled={shipments.length === 0}
        >
          Upload Document
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#EB5D0B]"
          />
        </div>
      </div>

      {error && !showUploadModal && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#6B7280] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F7F8FA] text-[#6B7280] text-[11px] uppercase font-bold border-b border-[#F1F5F9]">
                  <th className="py-3.5 px-6">Document</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Booking</th>
                  <th className="py-3.5 px-6">Uploaded</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#6B7280] text-sm">
                      {documents.length === 0 ? 'No documents uploaded yet.' : 'No documents match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4.5 h-4.5 text-[#EB5D0B] flex-shrink-0" />
                          <span className="font-bold text-[#111827] text-xs">{doc.fileName}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 pl-7 block">
                          {documentApi.formatFileSize(doc.fileSizeBytes)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F7F8FA] border border-[#E5E7EB] text-[#374151]">
                          {docTypeLabel(doc.docType)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-[#111827] font-semibold">
                        {doc.bookingNumber || '-'}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#6B7280]">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={doc.status === 'verified' ? 'success' : 'warning'}
                          icon={doc.status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        >
                          {doc.status === 'verified' ? 'Verified' : 'Pending Review'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a href={documentApi.downloadUrl(doc.id)} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="primary" icon={<Download className="w-3.5 h-3.5" />}>
                            Download
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <h3 className="font-bold text-base text-[#111827]">Upload Document</h3>
            <p className="text-xs text-[#6B7280]">PDF, JPEG, PNG, Word, or Excel files up to 15 MB.</p>

            <form onSubmit={handleUpload} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
                  >
                    {DOC_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Booking</label>
                  <select
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#111827]"
                  >
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>{s.bookingNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-[#6B7280] file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-[#F7F8FA] file:text-[#111827] file:font-semibold file:cursor-pointer cursor-pointer border border-[#E5E7EB] rounded-xl bg-[#F7F8FA] p-1"
                />
                {selectedFile && (
                  <p className="text-[11px] text-[#6B7280] mt-1.5">
                    {selectedFile.name} ({documentApi.formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              {error && (
                <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
