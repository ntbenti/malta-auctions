import { AuctionAsset } from '../models/types';
import { 
  checkSanctions, 
  redactSensitiveFields, 
  generateComplianceDisclaimer,
  verifyBidderEligibility
} from './compliance';

/**
 * Process assets through compliance engine before sending to UI
 */
function processAssetsForDisplay(assets: AuctionAsset[]): AuctionAsset[] {
  return assets.map(asset => {
    // Apply redaction to sensitive fields
    const redactedAsset = redactSensitiveFields(asset);
    
    // Add compliance disclaimer
    redactedAsset.complianceDisclaimer = generateComplianceDisclaimer(redactedAsset);
    
    // Add sanction status
    redactedAsset.sanctionStatus = checkSanctions(redactedAsset);
    
    return redactedAsset;
  });
}

/**
 * Process assets before storing in database
 */
function processAssetsForStorage(assets: AuctionAsset[]): AuctionAsset[] {
  return assets.map(asset => {
    // Check sanctions status and update the unSanctionsCompliance field
    const sanctionStatus = checkSanctions(asset);
    
    // Update the legal status based on sanctions check
    const updatedAsset = {
      ...asset,
      legalStatus: {
        ...asset.legalStatus,
        unSanctionsCompliance: sanctionStatus === 'CLEAR'
      }
    };
    
    return updatedAsset;
  });
}

/**
 * Check if user can bid on an asset
 */
function canUserBidOnAsset(
  asset: AuctionAsset, 
  userInfo: { 
    verificationLevel: number, 
    country: string, 
    region?: string,
    sanctionsChecked: boolean
  }
): { canBid: boolean, message?: string } {
  const eligibility = verifyBidderEligibility(asset, userInfo);
  
  if (!eligibility.eligible) {
    return {
      canBid: false,
      message: eligibility.reason
    };
  }
  
  return { canBid: true };
}

export {
  processAssetsForDisplay,
  processAssetsForStorage,
  canUserBidOnAsset
};
