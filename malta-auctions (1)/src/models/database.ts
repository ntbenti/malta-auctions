import { AuctionAsset } from './types';

/**
 * Database service for interacting with Cloudflare D1
 */
export class AuctionDatabase {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Initialize the database with schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Read schema from file (in production this would be bundled)
      // For this example, we'll assume the schema is applied during deployment
      console.log('Database schema would be initialized during deployment');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Insert a new auction asset
   */
  async insertAsset(asset: AuctionAsset): Promise<number> {
    try {
      const { serialNumbers, ...assetData } = asset;
      
      // Insert the asset
      const result = await this.db.prepare(`
        INSERT INTO auction_assets (
          type, seizure_reason, un_sanctions_compliance, local_court_order,
          contraband_type, imo_number, arrest_warrant_id, description,
          debt_amount, value, origin, source, date_added
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        asset.type,
        asset.seizureReason,
        asset.legalStatus.unSanctionsCompliance ? 1 : 0,
        asset.legalStatus.localCourtOrder,
        asset.contrabandType || null,
        asset.imoNumber || null,
        asset.arrestWarrantId || null,
        asset.description,
        asset.debtAmount || null,
        asset.value || null,
        asset.origin || null,
        asset.source,
        asset.dateAdded
      ).run();
      
      // Get the inserted ID
      const id = result.meta.last_row_id as number;
      
      // Insert serial numbers if any
      if (serialNumbers && serialNumbers.length > 0) {
        for (const serial of serialNumbers) {
          await this.db.prepare(`
            INSERT INTO asset_serials (asset_id, serial_number)
            VALUES (?, ?)
          `).bind(id, serial).run();
        }
      }
      
      return id;
    } catch (error) {
      console.error('Error inserting asset:', error);
      throw error;
    }
  }

  /**
   * Get all auction assets
   */
  async getAllAssets(): Promise<AuctionAsset[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM auction_assets
        ORDER BY date_added DESC
      `).all();
      
      const assets = result.results as any[];
      
      // Convert to AuctionAsset objects
      const auctionAssets: AuctionAsset[] = await Promise.all(
        assets.map(async (asset) => {
          // Get serial numbers if applicable
          let serialNumbers: string[] = [];
          if (asset.type === 'currency') {
            const serialsResult = await this.db.prepare(`
              SELECT serial_number FROM asset_serials
              WHERE asset_id = ?
            `).bind(asset.id).all();
            
            serialNumbers = serialsResult.results.map((row: any) => row.serial_number);
          }
          
          return {
            type: asset.type,
            seizureReason: asset.seizure_reason,
            legalStatus: {
              unSanctionsCompliance: asset.un_sanctions_compliance === 1,
              localCourtOrder: asset.local_court_order
            },
            contrabandType: asset.contraband_type || undefined,
            imoNumber: asset.imo_number || undefined,
            arrestWarrantId: asset.arrest_warrant_id || undefined,
            description: asset.description,
            debtAmount: asset.debt_amount || undefined,
            value: asset.value || undefined,
            origin: asset.origin || undefined,
            source: asset.source,
            dateAdded: asset.date_added,
            serialNumbers: serialNumbers.length > 0 ? serialNumbers : undefined
          };
        })
      );
      
      return auctionAssets;
    } catch (error) {
      console.error('Error getting assets:', error);
      return [];
    }
  }

  /**
   * Get assets by type
   */
  async getAssetsByType(type: AuctionAsset['type']): Promise<AuctionAsset[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM auction_assets
        WHERE type = ?
        ORDER BY date_added DESC
      `).bind(type).all();
      
      const assets = result.results as any[];
      
      // Convert to AuctionAsset objects (simplified for brevity)
      const auctionAssets: AuctionAsset[] = assets.map((asset) => ({
        type: asset.type,
        seizureReason: asset.seizure_reason,
        legalStatus: {
          unSanctionsCompliance: asset.un_sanctions_compliance === 1,
          localCourtOrder: asset.local_court_order
        },
        contrabandType: asset.contraband_type || undefined,
        imoNumber: asset.imo_number || undefined,
        arrestWarrantId: asset.arrest_warrant_id || undefined,
        description: asset.description,
        debtAmount: asset.debt_amount || undefined,
        value: asset.value || undefined,
        origin: asset.origin || undefined,
        source: asset.source,
        dateAdded: asset.date_added
      }));
      
      return auctionAssets;
    } catch (error) {
      console.error(`Error getting assets by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get assets by sanctions status
   */
  async getAssetsBySanctionsStatus(compliant: boolean): Promise<AuctionAsset[]> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM auction_assets
        WHERE un_sanctions_compliance = ?
        ORDER BY date_added DESC
      `).bind(compliant ? 1 : 0).all();
      
      const assets = result.results as any[];
      
      // Convert to AuctionAsset objects (simplified for brevity)
      const auctionAssets: AuctionAsset[] = assets.map((asset) => ({
        type: asset.type,
        seizureReason: asset.seizure_reason,
        legalStatus: {
          unSanctionsCompliance: asset.un_sanctions_compliance === 1,
          localCourtOrder: asset.local_court_order
        },
        contrabandType: asset.contraband_type || undefined,
        imoNumber: asset.imo_number || undefined,
        arrestWarrantId: asset.arrest_warrant_id || undefined,
        description: asset.description,
        debtAmount: asset.debt_amount || undefined,
        value: asset.value || undefined,
        origin: asset.origin || undefined,
        source: asset.source,
        dateAdded: asset.date_added
      }));
      
      return auctionAssets;
    } catch (error) {
      console.error(`Error getting assets by sanctions status:`, error);
      return [];
    }
  }
}
