import { AuctionAsset } from '../models/types';

/**
 * Legal compliance engine for checking sanctions
 */
function checkSanctions(asset: AuctionAsset): 'BLOCKED' | 'CLEAR' | 'REVIEW' {
  // Check for Haftar-linked entities (as per requirements)
  const HAFTAR_LINKED = ['Khalifa Haftar', 'LNA', 'Bayda'];
  
  // Check for sanctioned origins
  const SANCTIONED_ORIGINS = ['Russia', 'Belarus', 'North Korea', 'Iran', 'Syria', 'Libya'];
  
  // Check for sanctioned keywords in description
  const SANCTIONED_KEYWORDS = [
    'sanctioned', 'illegal', 'prohibited', 'restricted', 
    'UN resolution', 'resolution 1973', 'embargo'
  ];
  
  // Check if description contains Haftar-linked terms
  if (HAFTAR_LINKED.some(term => 
    asset.description?.toLowerCase().includes(term.toLowerCase())
  )) {
    return 'BLOCKED';
  }
  
  // Check if origin is from sanctioned region
  if (asset.origin && SANCTIONED_ORIGINS.some(region => 
    asset.origin?.toLowerCase().includes(region.toLowerCase())
  )) {
    // If it's from a sanctioned region, it needs further review
    return 'REVIEW';
  }
  
  // Check if description contains sanctioned keywords
  if (SANCTIONED_KEYWORDS.some(keyword => 
    asset.description?.toLowerCase().includes(keyword.toLowerCase())
  )) {
    return 'REVIEW';
  }
  
  // Check if seizure reason is sanctions-related
  if (asset.seizureReason === 'sanctions') {
    return 'BLOCKED';
  }
  
  // If none of the above conditions are met, the asset is clear
  return 'CLEAR';
}

/**
 * Auto-redact sensitive fields
 */
function redactSensitiveFields(asset: AuctionAsset): AuctionAsset {
  const redactedAsset = { ...asset };
  
  // Redact serial numbers for currency
  if (asset.type === 'currency' && asset.serialNumbers) {
    redactedAsset.serialNumbers = asset.serialNumbers.map(serial => 
      serial.substring(0, 4) + 'XXXX' + serial.substring(serial.length - 4)
    );
  }
  
  // Redact sensitive information in description
  if (asset.description) {
    // Redact passport numbers
    redactedAsset.description = asset.description.replace(
      /passport\s+#?\s*([A-Z0-9]{2,12})/gi, 
      'passport #REDACTED'
    );
    
    // Redact bank account numbers
    redactedAsset.description = redactedAsset.description.replace(
      /account\s+#?\s*([0-9]{6,20})/gi, 
      'account #REDACTED'
    );
    
    // Redact personal names if asset is sanctioned
    if (asset.seizureReason === 'sanctions' || !asset.legalStatus.unSanctionsCompliance) {
      const nameRegex = /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
      redactedAsset.description = redactedAsset.description.replace(nameRegex, '[REDACTED NAME]');
    }
  }
  
  // Redact specific vessel information if it's under sanctions
  if (asset.type === 'vessel' && !asset.legalStatus.unSanctionsCompliance) {
    // Keep IMO number but redact other identifying info
    redactedAsset.description = redactedAsset.description.replace(
      /(vessel|ship|boat)\s+"([^"]+)"/gi,
      '$1 "[REDACTED]"'
    );
  }
  
  return redactedAsset;
}

/**
 * Check if bidder is from sanctioned region
 */
function isSanctionedRegion(bidderInfo: { country: string, region?: string }): boolean {
  const SANCTIONED_REGIONS = [
    'Russia', 'Belarus', 'North Korea', 'Iran', 'Syria', 
    'Crimea', 'Donetsk', 'Luhansk', 'Libya'
  ];
  
  // Check if country is in sanctioned regions
  if (SANCTIONED_REGIONS.some(region => 
    bidderInfo.country.toLowerCase().includes(region.toLowerCase())
  )) {
    return true;
  }
  
  // Check specific regions if provided
  if (bidderInfo.region && SANCTIONED_REGIONS.some(region => 
    bidderInfo.region?.toLowerCase().includes(region.toLowerCase())
  )) {
    return true;
  }
  
  return false;
}

/**
 * Generate compliance disclaimer for asset
 */
function generateComplianceDisclaimer(asset: AuctionAsset): string {
  const sanctionStatus = checkSanctions(asset);
  
  if (sanctionStatus === 'BLOCKED') {
    return 'WARNING: This asset is subject to international sanctions. Bidding is restricted to Level 4 verified entities only. UN Resolution compliance verification required.';
  } else if (sanctionStatus === 'REVIEW') {
    return 'NOTICE: This asset requires additional compliance review. Bidders must provide enhanced due diligence documentation.';
  } else if (asset.type === 'currency') {
    return 'COMPLIANCE NOTICE: Currency transactions are subject to anti-money laundering regulations. Bidders must provide source of funds documentation.';
  } else if (asset.type === 'vessel') {
    return 'MARITIME NOTICE: Vessel transfer subject to Transport Malta regulations. New owner must register vessel within 14 days of purchase.';
  } else if (asset.contrabandType) {
    return 'CONTRABAND NOTICE: This asset was seized as contraband. Special permits may be required for possession or transfer.';
  } else {
    return 'LEGAL NOTICE: This asset is sold as-is with no warranties. Buyer is responsible for all transfer fees and taxes.';
  }
}

/**
 * Verify bidder eligibility for asset
 */
function verifyBidderEligibility(
  asset: AuctionAsset, 
  bidderInfo: { 
    verificationLevel: number, 
    country: string, 
    region?: string,
    sanctionsChecked: boolean
  }
): { eligible: boolean, reason?: string } {
  // Check if asset is blocked and bidder has sufficient verification
  const sanctionStatus = checkSanctions(asset);
  
  if (sanctionStatus === 'BLOCKED' && bidderInfo.verificationLevel < 4) {
    return { 
      eligible: false, 
      reason: 'This asset requires Level 4 verification. Please upgrade your verification status.' 
    };
  }
  
  // Check if bidder is from sanctioned region
  if (isSanctionedRegion(bidderInfo)) {
    return { 
      eligible: false, 
      reason: 'Bidders from sanctioned regions are not eligible for this auction.' 
    };
  }
  
  // Check if bidder has completed sanctions check
  if (sanctionStatus !== 'CLEAR' && !bidderInfo.sanctionsChecked) {
    return { 
      eligible: false, 
      reason: 'Sanctions compliance check required before bidding.' 
    };
  }
  
  // If all checks pass, bidder is eligible
  return { eligible: true };
}

export { 
  checkSanctions, 
  redactSensitiveFields, 
  isSanctionedRegion, 
  generateComplianceDisclaimer,
  verifyBidderEligibility
};
