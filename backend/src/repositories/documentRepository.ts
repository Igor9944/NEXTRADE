import { Pool, PoolClient } from 'pg';
import { DocumentRecord, DocumentStatus, DocumentType, InvoiceRecord, InvoiceStatus } from '../types/document';

type Queryable = Pool | PoolClient;

export class DocumentRepository {
  constructor(private pool: Pool) {}

  private db(client?: Queryable): Queryable {
    return client ?? this.pool;
  }

  async nextDocumentReference(client: Queryable): Promise<string> {
    const year = new Date().getUTCFullYear();
    const result = await client.query(
      `INSERT INTO document_reference_counters (year, last_value)
       VALUES ($1, 1)
       ON CONFLICT (year) DO UPDATE SET last_value = document_reference_counters.last_value + 1
       RETURNING last_value`,
      [year]
    );
    return `DOC-${year}-${String(result.rows[0].last_value).padStart(6, '0')}`;
  }

  async nextInvoiceNumber(client: Queryable): Promise<string> {
    const year = new Date().getUTCFullYear();
    const result = await client.query(
      `INSERT INTO invoice_reference_counters (year, last_value)
       VALUES ($1, 1)
       ON CONFLICT (year) DO UPDATE SET last_value = invoice_reference_counters.last_value + 1
       RETURNING last_value`,
      [year]
    );
    return `FAC-${year}-${String(result.rows[0].last_value).padStart(6, '0')}`;
  }

  async createDocument(
    data: {
      reference_document: string;
      type_document: DocumentType;
      original_file_name: string | null;
      nom_fichier: string | null;
      mime_type: string | null;
      file_size: number | null;
      storage_key: string | null;
      uploaded_by: string;
      id_order?: string | null;
      id_operation?: string | null;
      id_shipment?: string | null;
      statut?: DocumentStatus;
    },
    client?: Queryable
  ): Promise<DocumentRecord> {
    const result = await this.db(client).query(
      `INSERT INTO documents (
         reference_document, type_document, original_file_name, nom_fichier, mime_type, file_size,
         storage_key, chemin_fichier, uploaded_by, id_order, id_operation, id_shipment, statut
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.reference_document,
        data.type_document,
        data.original_file_name,
        data.nom_fichier,
        data.mime_type,
        data.file_size,
        data.storage_key,
        data.storage_key,
        data.uploaded_by,
        data.id_order ?? null,
        data.id_operation ?? null,
        data.id_shipment ?? null,
        data.statut ?? 'ACTIF'
      ]
    );
    return result.rows[0];
  }

  async findDocumentById(id: string, client?: Queryable): Promise<DocumentRecord | null> {
    const result = await this.db(client).query(
      `SELECT d.*, o.id_client, s.transporteur_id, ie.id_order AS operation_order_id,
              ie_order.id_client AS operation_order_client, p.id_fournisseur AS fournisseur_id
       FROM documents d
       LEFT JOIN orders o ON o.id_order = d.id_order
       LEFT JOIN shipments s ON s.id_shipment = d.id_shipment
       LEFT JOIN import_export_operations ie ON ie.id_operation = d.id_operation
       LEFT JOIN orders ie_order ON ie_order.id_order = ie.id_order
       LEFT JOIN purchases p ON p.id_purchase = ie.id_purchase
       WHERE d.id_document = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async listDocuments(filters: {
    id_order?: string;
    id_operation?: string;
    id_shipment?: string;
    type_document?: DocumentType;
    id_client?: string;
    transporteur_id?: string;
    fournisseur_id?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const where: string[] = [`d.statut <> 'SUPPRIME'`];
    const values: unknown[] = [];
    let i = 1;
    if (filters.id_order) {
      where.push(`d.id_order = $${i++}`);
      values.push(filters.id_order);
    }
    if (filters.id_operation) {
      where.push(`d.id_operation = $${i++}`);
      values.push(filters.id_operation);
    }
    if (filters.id_shipment) {
      where.push(`d.id_shipment = $${i++}`);
      values.push(filters.id_shipment);
    }
    if (filters.type_document) {
      where.push(`d.type_document = $${i++}`);
      values.push(filters.type_document);
    }
    if (filters.id_client) {
      where.push(`(o.id_client = $${i} OR ie_order.id_client = $${i})`);
      values.push(filters.id_client);
      i += 1;
    }
    if (filters.transporteur_id) {
      where.push(`s.transporteur_id = $${i++}`);
      values.push(filters.transporteur_id);
    }
    if (filters.fournisseur_id) {
      where.push(`p.id_fournisseur = $${i++}`);
      values.push(filters.fournisseur_id);
    }
    const join = `
      FROM documents d
      LEFT JOIN orders o ON o.id_order = d.id_order
      LEFT JOIN shipments s ON s.id_shipment = d.id_shipment
      LEFT JOIN import_export_operations ie ON ie.id_operation = d.id_operation
      LEFT JOIN orders ie_order ON ie_order.id_order = ie.id_order
      LEFT JOIN purchases p ON p.id_purchase = ie.id_purchase
    `;
    const count = await this.pool.query(`SELECT COUNT(*)::int AS total ${join} WHERE ${where.join(' AND ')}`, values);
    const total = count.rows[0].total as number;
    const offset = (page - 1) * limit;
    const rows = await this.pool.query(
      `SELECT d.* ${join} WHERE ${where.join(' AND ')} ORDER BY d.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...values, limit, offset]
    );
    return { documents: rows.rows as DocumentRecord[], total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit) || 1) };
  }

  async softDeleteDocument(id: string, client?: Queryable): Promise<DocumentRecord | null> {
    const result = await this.db(client).query(
      `UPDATE documents SET statut = 'SUPPRIME' WHERE id_document = $1 AND statut <> 'SUPPRIME' RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async addDocumentHistory(data: {
    id_document: string;
    action: string;
    old_status?: string | null;
    new_status?: string | null;
    changed_by: string;
    comment?: string | null;
  }, client?: Queryable) {
    await this.db(client).query(
      `INSERT INTO document_history (id_document, action, old_status, new_status, changed_by, comment)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.id_document, data.action, data.old_status ?? null, data.new_status ?? null, data.changed_by, data.comment ?? null]
    );
  }

  async getDocumentHistory(id: string) {
    const result = await this.pool.query(
      `SELECT * FROM document_history WHERE id_document = $1 ORDER BY created_at ASC`,
      [id]
    );
    return result.rows;
  }

  async findActiveInvoiceByOrder(id_order: string, client?: Queryable): Promise<InvoiceRecord | null> {
    const result = await this.db(client).query(
      `SELECT * FROM invoices WHERE id_order = $1 AND statut <> 'ANNULEE' LIMIT 1`,
      [id_order]
    );
    return result.rows[0] || null;
  }

  async createInvoice(data: {
    numero_facture: string;
    id_order: string;
    id_client: string;
    devise: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    statut: InvoiceStatus;
    date_emission: string;
    id_document?: string | null;
  }, client?: Queryable): Promise<InvoiceRecord> {
    const result = await this.db(client).query(
      `INSERT INTO invoices (
         numero_facture, id_order, id_client, devise, montant_ht, montant_tva, montant_ttc,
         statut, date_emission, id_document
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.numero_facture,
        data.id_order,
        data.id_client,
        data.devise,
        data.montant_ht,
        data.montant_tva,
        data.montant_ttc,
        data.statut,
        data.date_emission,
        data.id_document ?? null
      ]
    );
    return result.rows[0];
  }

  async attachInvoiceDocument(id_invoice: string, id_document: string, client?: Queryable) {
    await this.db(client).query(
      `UPDATE invoices SET id_document = $1, updated_at = NOW() WHERE id_invoice = $2`,
      [id_document, id_invoice]
    );
  }

  async findInvoiceById(id: string): Promise<(InvoiceRecord & { id_client: string | null }) | null> {
    const result = await this.pool.query(`SELECT * FROM invoices WHERE id_invoice = $1`, [id]);
    return result.rows[0] || null;
  }

  async addInvoiceHistory(data: {
    id_invoice: string;
    action: string;
    old_status?: string | null;
    new_status?: string | null;
    changed_by: string;
    comment?: string | null;
  }, client?: Queryable) {
    await this.db(client).query(
      `INSERT INTO invoice_history (id_invoice, action, old_status, new_status, changed_by, comment)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.id_invoice, data.action, data.old_status ?? null, data.new_status ?? null, data.changed_by, data.comment ?? null]
    );
  }

  async getInvoiceHistory(id: string) {
    const result = await this.pool.query(
      `SELECT * FROM invoice_history WHERE id_invoice = $1 ORDER BY created_at ASC`,
      [id]
    );
    return result.rows;
  }

  async findFormalityById(id: string) {
    const result = await this.pool.query(`SELECT * FROM customs_formalities WHERE id_formality = $1`, [id]);
    return result.rows[0] || null;
  }

  async updateFormalityStatus(id: string, statut: string, client?: Queryable) {
    const result = await this.db(client).query(
      `UPDATE customs_formalities SET statut = $1 WHERE id_formality = $2 RETURNING *`,
      [statut, id]
    );
    return result.rows[0] || null;
  }

  async addFormalityHistory(data: {
    id_formality: string;
    action: string;
    old_status: string | null;
    new_status: string;
    changed_by: string;
    comment?: string | null;
  }, client?: Queryable) {
    await this.db(client).query(
      `INSERT INTO formality_history (id_formality, action, old_status, new_status, changed_by, comment)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.id_formality, data.action, data.old_status, data.new_status, data.changed_by, data.comment ?? null]
    );
  }

  async getFormalityHistory(id: string) {
    const result = await this.pool.query(
      `SELECT * FROM formality_history WHERE id_formality = $1 ORDER BY created_at ASC`,
      [id]
    );
    return result.rows;
  }

  async listFormalitiesByOperation(id_operation: string) {
    const result = await this.pool.query(
      `SELECT * FROM customs_formalities WHERE id_operation = $1 ORDER BY created_at ASC`,
      [id_operation]
    );
    return result.rows;
  }

  async listOperationsByOrder(id_order: string) {
    const result = await this.pool.query(
      `SELECT id_operation, type_operation, id_order, reference_operation, pays_origine, pays_destination, statut
       FROM import_export_operations WHERE id_order = $1 ORDER BY created_at ASC`,
      [id_order]
    );
    return result.rows;
  }
}
