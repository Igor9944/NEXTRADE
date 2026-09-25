import { Pool } from 'pg';
import {
  ImportExportOperationRecord,
  ImportExportItemRecord,
  CustomsFormalityRecord,
  ImportExportOperationType,
  ImportExportOperationStatus,
  TransportMode,
  CustomsFormalityStatus,
} from '../types/importExport';
import { Product } from '../types/catalog';

export class ImportExportRepository {
  constructor(private pool: Pool) {}

  async createOperation(data: {
    type_operation: ImportExportOperationType;
    id_order?: string;
    id_purchase?: string;
    reference_operation: string;
    pays_origine: string;
    pays_destination: string;
    statut?: ImportExportOperationStatus;
    date_depart?: string | null;
    date_arrivee_prevue?: string | null;
    mode_transport?: TransportMode | null;
  }): Promise<ImportExportOperationRecord> {
    // Set default statut to PREPARATION if not provided
    const statut = data.statut ?? 'PREPARATION';

    const result = await this.pool.query(
      `INSERT INTO import_export_operations (
        type_operation, id_order, id_purchase, reference_operation, 
        pays_origine, pays_destination, statut, date_depart, 
        date_arrivee_prevue, mode_transport
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id_operation, type_operation, id_order, id_purchase, 
                reference_operation, pays_origine, pays_destination, 
                statut, date_depart, date_arrivee_prevue, 
                date_arrivee_reelle, mode_transport, created_at, updated_at`,
      [
        data.type_operation,
        data.id_order ?? null,
        data.id_purchase ?? null,
        data.reference_operation,
        data.pays_origine,
        data.pays_destination,
        statut,
        data.date_depart ?? null,
        data.date_arrivee_prevue ?? null,
        data.mode_transport ?? null
      ]
    );
    return result.rows[0];
  }

  async addItems(
    items: Array<{
      id_operation: string;
      id_product: string;
      quantite: number;
      unite?: string;
    }>
  ): Promise<ImportExportItemRecord[]> {
    if (items.length === 0) {
      return [];
    }

    const insertClauses: string[] = [];
    const values: any[] = [];

    items.forEach((item, index) => {
      const base = index * 4;
      insertClauses.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
      values.push(item.id_operation, item.id_product, item.quantite, item.unite ?? null);
    });

    const query = `INSERT INTO import_export_items (id_operation, id_product, quantite, unite)
                   VALUES ${insertClauses.join(', ')}
                   RETURNING id_item, id_operation, id_product, quantite, unite, created_at, updated_at`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async getOperationById(id_operation: string): Promise<ImportExportOperationRecord | null> {
    const result = await this.pool.query(
      `SELECT id_operation, type_operation, id_order, id_purchase, reference_operation, 
              pays_origine, pays_destination, statut, date_depart, date_arrivee_prevue, 
              date_arrivee_reelle, mode_transport, created_at, updated_at
       FROM import_export_operations WHERE id_operation = $1`,
      [id_operation]
    );
    return result.rows[0] || null;
  }

  async getOperationItems(id_operation: string): Promise<ImportExportItemRecord[]> {
    const result = await this.pool.query(
      `SELECT id_item, id_operation, id_product, quantite, unite, created_at, updated_at
       FROM import_export_items WHERE id_operation = $1 ORDER BY created_at ASC`,
      [id_operation]
    );
    return result.rows;
  }

  async getOperationWithItems(id_operation: string): Promise<{
    operation: ImportExportOperationRecord | null;
    items: ImportExportItemRecord[];
  }> {
    const operation = await this.getOperationById(id_operation);
    const items = operation ? await this.getOperationItems(id_operation) : [];
    return { operation, items };
  }

  async updateOperation(
    id_operation: string,
    data: Partial<Omit<ImportExportOperationRecord, 'id_operation' | 'created_at' | 'updated_at'>>
  ): Promise<ImportExportOperationRecord | null> {
    // Build dynamic update query
    const fields = Object.keys(data)
      .filter((key) => data[key as keyof typeof data] !== undefined)
      .map((key) => `${key} = $${Object.keys(data).indexOf(key) + 2}`);

    if (fields.length === 0) {
      return await this.getOperationById(id_operation);
    }

    const values = Object.values(data).filter(
      (value) => value !== undefined
    );

    const query = `
      UPDATE import_export_operations
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id_operation = $1
      RETURNING id_operation, type_operation, id_order, id_purchase, reference_operation, 
                pays_origine, pays_destination, statut, date_depart, date_arrivee_prevue, 
                date_arrivee_reelle, mode_transport, created_at, updated_at
    `;

    const result = await this.pool.query(query, [id_operation, ...values]);
    return result.rows[0] || null;
  }

  async updateOperationStatus(
    id_operation: string,
    statut: ImportExportOperationStatus
  ): Promise<ImportExportOperationRecord | null> {
    const result = await this.pool.query(
      `UPDATE import_export_operations
       SET statut = $1, updated_at = NOW()
       WHERE id_operation = $2
       RETURNING id_operation, type_operation, id_order, id_purchase, reference_operation, 
                 pays_origine, pays_destination, statut, date_depart, date_arrivee_prevue, 
                 date_arrivee_reelle, mode_transport, created_at, updated_at`,
      [statut, id_operation]
    );
    return result.rows[0] || null;
  }

  async addCustomsFormality(
    data: {
      id_operation: string;
      type_formality: string;
      statut?: CustomsFormalityStatus;
    }
  ): Promise<CustomsFormalityRecord> {
    const statut = data.statut ?? 'A_FAIRE';

    const result = await this.pool.query(
      `INSERT INTO customs_formalities (id_operation, type_formality, statut)
       VALUES ($1, $2, $3)
       RETURNING id_formality, id_operation, type_formality, statut, created_at, updated_at`,
      [data.id_operation, data.type_formality, statut]
    );
    return result.rows[0];
  }

  async getCustomsFormalitiesByOperation(
    id_operation: string
  ): Promise<CustomsFormalityRecord[]> {
    const result = await this.pool.query(
      `SELECT id_formality, id_operation, type_formality, statut, created_at, updated_at
       FROM customs_formalities WHERE id_operation = $1 ORDER BY created_at ASC`,
      [id_operation]
    );
    return result.rows;
  }

  async listOperations(
    filters: {
      type_operation?: ImportExportOperationType;
      statut?: ImportExportOperationStatus;
      pays_origine?: string;
      pays_destination?: string;
      reference_operation?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    operations: ImportExportOperationRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      type_operation,
      statut,
      pays_origine,
      pays_destination,
      reference_operation,
      page = 1,
      limit = 10,
    } = filters;

    const clauses: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (type_operation) {
      clauses.push(`type_operation = $${index++}`);
      values.push(type_operation);
    }

    if (statut) {
      clauses.push(`statut = $${index++}`);
      values.push(statut);
    }

    if (pays_origine) {
      clauses.push(`pays_origine ILIKE $${index++}`);
      values.push(`%${pays_origine}%`);
    }

    if (pays_destination) {
      clauses.push(`pays_destination ILIKE $${index++}`);
      values.push(`%${pays_destination}%`);
    }

    if (reference_operation) {
      clauses.push(`reference_operation ILIKE $${index++}`);
      values.push(`%${reference_operation}%`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::int AS total
       FROM import_export_operations
       ${whereClause}`,
      values
    );

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * limit;

    const result = await this.pool.query(
      `SELECT id_operation, type_operation, id_order, id_purchase, reference_operation, 
              pays_origine, pays_destination, statut, date_depart, date_arrivee_prevue, 
              date_arrivee_reelle, mode_transport, created_at, updated_at
       FROM import_export_operations
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    return {
      operations: result.rows,
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }

  async deleteOperation(id_operation: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM import_export_operations WHERE id_operation = $1',
      [id_operation]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
