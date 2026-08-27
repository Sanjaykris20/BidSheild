'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  DocumentItem,
  TenderDetail,
  BidItem,
  ClarificationItem,
  ToastMessage,
} from '@/types/user';
import {
  initialProfile,
  initialDocuments,
  initialTenders,
  initialBids,
  initialClarifications,
} from '@/lib/mockUserStore';
import { generateHash } from '@/lib/utils';

interface UserStoreContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  documents: DocumentItem[];
  addDocument: (docData: {
    name: string;
    category: DocumentItem['category'];
    docNumber: string;
    expiryDate: string;
    status: DocumentItem['status'];
    source: string;
    confidence: number;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc';
    extractedFields?: DocumentItem['extractedFields'];
  }) => DocumentItem;
  deleteDocument: (id: string) => void;
  tenders: TenderDetail[];
  getTenderById: (id: string) => TenderDetail | undefined;
  bids: BidItem[];
  getBidById: (id: string) => BidItem | undefined;
  createBid: (newBidData: {
    tenderId: string;
    tenderNumber: string;
    tenderTitle: string;
    organization: string;
    quotedValueINR: number;
    priceBreakdown: BidItem['priceBreakdown'];
    attachedDocIds: string[];
  }) => BidItem;
  clarifications: ClarificationItem[];
  getClarificationById: (id: string) => ClarificationItem | undefined;
  submitClarificationResponse: (
    clarificationId: string,
    remarks: string,
    docName?: string,
    docSize?: string
  ) => void;
  toasts: ToastMessage[];
  addToast: (msg: {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    durationMs?: number;
  }) => void;
  removeToast: (id: string) => void;
  isUploadModalOpen: boolean;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  viewingDocument: DocumentItem | null;
  openDocumentViewer: (doc: DocumentItem) => void;
  closeDocumentViewer: () => void;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

export const UserStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [tenders] = useState<TenderDetail[]>(initialTenders);
  const [bids, setBids] = useState<BidItem[]>(initialBids);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>(initialClarifications);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentItem | null>(null);

  const addToast = ({
    message,
    type = 'info',
    title,
    durationMs = 4000,
  }: {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    durationMs?: number;
  }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, message, type, title, durationMs };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, durationMs);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    addToast({
      title: 'Profile Updated',
      message: 'Your statutory company details have been updated successfully.',
      type: 'success',
    });
  };

  const addDocument = (docData: {
    name: string;
    category: DocumentItem['category'];
    docNumber: string;
    expiryDate: string;
    status: DocumentItem['status'];
    source: string;
    confidence: number;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc';
    extractedFields?: DocumentItem['extractedFields'];
  }): DocumentItem => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hashSha256: generateHash('SHA256'),
      ...docData,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addToast({
      title: 'Document Verified',
      message: `${newDoc.name} parsed with ${newDoc.confidence}% confidence and added to Vault.`,
      type: 'success',
    });
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    addToast({
      title: 'Document Removed',
      message: doc ? `${doc.name} removed from your Vault.` : 'Document removed.',
      type: 'info',
    });
  };

  const getTenderById = (id: string): TenderDetail | undefined => {
    return tenders.find((t) => t.id.toLowerCase() === id.toLowerCase() || t.tenderNumber.replace(/\//g, '-').toLowerCase() === id.toLowerCase());
  };

  const getBidById = (id: string): BidItem | undefined => {
    return bids.find((b) => b.id.toLowerCase() === id.toLowerCase() || b.bidId.toLowerCase() === id.toLowerCase());
  };

  const createBid = (newBidData: {
    tenderId: string;
    tenderNumber: string;
    tenderTitle: string;
    organization: string;
    quotedValueINR: number;
    priceBreakdown: BidItem['priceBreakdown'];
    attachedDocIds: string[];
  }): BidItem => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bidId = `BID-2026-${randomNum}`;
    const newBid: BidItem = {
      id: `bid-${randomNum}`,
      bidId,
      tenderId: newBidData.tenderId,
      tenderNumber: newBidData.tenderNumber,
      tenderTitle: newBidData.tenderTitle,
      organization: newBidData.organization,
      quotedValueINR: newBidData.quotedValueINR,
      quotedValueFormatted: newBidData.priceBreakdown.totalQuotedFormatted,
      priceBreakdown: newBidData.priceBreakdown,
      status: 'SUBMITTED',
      complianceScore: 92,
      riskLevel: 'LOW',
      submittedAt: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' IST',
      sealedEnvelopeHash: generateHash('SHA256'),
      auditTimeline: [
        {
          stageNumber: 1,
          title: 'Bid Sealed & Submitted',
          status: 'COMPLETED',
          timestamp: 'Just Now',
          description: 'SHA-256 Sealed Envelope generated with DSC Level 3 signature.',
          completedBy: 'Bidder Portal',
        },
        {
          stageNumber: 2,
          title: 'Govt API Verification & OCR Extraction',
          status: 'IN_PROGRESS',
          description: 'GSTN, PAN NSDL, ICAI UDIN verifying statutory integrity.',
          completedBy: 'AI Gateway',
        },
        {
          stageNumber: 3,
          title: 'Compliance Rule Matrix Run',
          status: 'PENDING',
          description: 'Automated 24-rule deterministic check queued.',
        },
        {
          stageNumber: 4,
          title: 'Technical Committee Evaluation',
          status: 'PENDING',
          description: 'Awaiting technical opening by Procurement Bureau.',
        },
        {
          stageNumber: 5,
          title: 'Final Award / Determination',
          status: 'PENDING',
          description: 'Commercial opening and L1 determination.',
        },
      ],
      auditSummary: {
        passedRules: 21,
        reviewRules: 2,
        failedRules: 0,
        totalRules: 24,
      },
      auditMatrix: [
        {
          ruleId: 'REQ-STAT-01',
          category: 'Statutory',
          title: 'Valid GSTIN Registration',
          tenderRequirement: 'Active Regular GSTIN',
          bidderExtractedValue: `${profile.gstin} (Active Regular)`,
          status: 'PASS',
          confidence: 100,
        },
        {
          ruleId: 'REQ-STAT-02',
          category: 'Statutory',
          title: 'PAN Card Validation',
          tenderRequirement: 'Company PAN registered',
          bidderExtractedValue: `${profile.pan} (Verified)`,
          status: 'PASS',
          confidence: 99,
        },
        {
          ruleId: 'REQ-FIN-01',
          category: 'Financial',
          title: 'Average 3-Yr Financial Turnover',
          tenderRequirement: '≥ ₹ 10.00 Cr',
          bidderExtractedValue: '₹ 14.80 Cr (CA Audited)',
          status: 'PASS',
          confidence: 100,
        },
      ],
      attachedDocIds: newBidData.attachedDocIds,
    };

    setBids((prev) => [newBid, ...prev]);
    addToast({
      title: 'Bid Submitted Successfully',
      message: `Bid ${bidId} sealed cryptographically with SHA-256 envelope hash.`,
      type: 'success',
      durationMs: 6000,
    });
    return newBid;
  };

  const getClarificationById = (id: string): ClarificationItem | undefined => {
    return clarifications.find((c) => c.id.toLowerCase() === id.toLowerCase());
  };

  const submitClarificationResponse = (
    clarificationId: string,
    remarks: string,
    docName?: string,
    docSize?: string
  ) => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' IST';

    setClarifications((prev) =>
      prev.map((c) => {
        if (c.id === clarificationId) {
          return {
            ...c,
            status: 'RESPONDED',
            bidderResponse: {
              remarks,
              attachedDocName: docName || 'OEM_Authorization_Renewed_FY27.pdf',
              attachedDocSize: docSize || '2.1 MB',
              respondedAt: timestamp,
            },
          };
        }
        return c;
      })
    );

    // Also update the corresponding bid status if applicable
    const cl = clarifications.find((c) => c.id === clarificationId);
    if (cl) {
      setBids((prev) =>
        prev.map((b) => {
          if (b.bidId === cl.bidId) {
            return {
              ...b,
              status: 'UNDER_EVALUATION',
              auditTimeline: b.auditTimeline.map((stage) => {
                if (stage.stageNumber === 4) {
                  return {
                    ...stage,
                    status: 'COMPLETED',
                    description: `Clarification response transmitted with supporting ${docName || 'OEM Authorization'}.`,
                    timestamp,
                  };
                }
                return stage;
              }),
            };
          }
          return b;
        })
      );
    }

    addToast({
      title: 'Clarification Transmitted',
      message: 'Official response and updated OEM credentials sent to CPCL Procurement Officer.',
      type: 'success',
    });
  };

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const openDocumentViewer = (doc: DocumentItem) => setViewingDocument(doc);
  const closeDocumentViewer = () => setViewingDocument(null);

  return (
    <UserStoreContext.Provider
      value={{
        profile,
        updateProfile,
        documents,
        addDocument,
        deleteDocument,
        tenders,
        getTenderById,
        bids,
        getBidById,
        createBid,
        clarifications,
        getClarificationById,
        submitClarificationResponse,
        toasts,
        addToast,
        removeToast,
        isUploadModalOpen,
        openUploadModal,
        closeUploadModal,
        viewingDocument,
        openDocumentViewer,
        closeDocumentViewer,
      }}
    >
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
};
