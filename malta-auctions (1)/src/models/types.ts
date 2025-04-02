interface AuctionAsset {
  type: 'real_estate' | 'vessel' | 'currency' | 'vehicle';
  seizureReason: 'sanctions' | 'debt' | 'contraband';
  legalStatus: {
    unSanctionsCompliance: boolean;
    localCourtOrder: string | null;
  };
  // Customs-specific
  contrabandType?: 'drugs' | 'weapons' | 'currency';
  // Vessel-specific
  imoNumber?: string;
  arrestWarrantId?: string;
  // Additional fields for UI display
  description: string;
  debtAmount?: string;
  value?: string;
  origin?: string;
  source: string;
  dateAdded: string;
  serialNumbers?: string[];
  // Compliance-related fields
  sanctionStatus?: 'BLOCKED' | 'CLEAR' | 'REVIEW';
  complianceDisclaimer?: string;
}

export { AuctionAsset };
