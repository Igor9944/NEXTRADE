import { Pool, PoolClient } from 'pg';
import { TransactionRecord, TransactionStatus } from '../types/payment';

type Queryable = Pool | PoolClient;

export class PaymentRepository {
  constructor(private pool: Pool) {}

  private db(client?: Queryable): Queryable {
    return client ?? this.pool;
  }

  async create(data: {
    id_order: string;
    montant_paye: number;
    methode_paiement: string;
    statut_transaction: TransactionStatus;
    reference_externe?: string | null;
    provider?: string | null;
    devise?: string | null;
  }, client?: Queryable): Promise<TransactionRecord> {
    const result = await this.db(client).query(
      `INSERT INTO transactions (
         id_order, montant_paye, methode_paiement, statut_transaction, reference_externe, provider, devise
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        data.id_order,
        data.montant_paye,
        data.methode_paiement,
        data.statut_transaction,
        data.reference_externe ?? null,
        data.provider ?? null,
        data.devise ?? null
      ]
    );
    return result.rows[0];
  }

  async updateGatewayReference(
    id_transaction: string,
    reference_externe: string,
    statut: TransactionStatus,
    client?: Queryable
  ): Promise<TransactionRecord | null> {
    const result = await this.db(client).query(
      `UPDATE transactions
       SET reference_externe = $1, statut_transaction = $2, updated_at = NOW()
       WHERE id_transaction = $3
       RETURNING *`,
      [reference_externe, statut, id_transaction]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<TransactionRecord | null> {
    const result = await this.pool.query(`SELECT * FROM transactions WHERE id_transaction = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByExternalReference(reference: string): Promise<TransactionRecord | null> {
    const result = await this.pool.query(`SELECT * FROM transactions WHERE reference_externe = $1`, [reference]);
    return result.rows[0] || null;
  }

  async findByProviderEvent(eventId: string): Promise<TransactionRecord | null> {
    const result = await this.pool.query(`SELECT * FROM transactions WHERE provider_event_id = $1`, [eventId]);
    return result.rows[0] || null;
  }

  async listByOrder(id_order: string): Promise<TransactionRecord[]> {
    const result = await this.pool.query(
      `SELECT * FROM transactions WHERE id_order = $1 ORDER BY created_at DESC`,
      [id_order]
    );
    return result.rows;
  }

  async findValidatedByOrder(id_order: string): Promise<TransactionRecord | null> {
    const result = await this.pool.query(
      `SELECT * FROM transactions WHERE id_order = $1 AND statut_transaction = 'VALIDEE' LIMIT 1`,
      [id_order]
    );
    return result.rows[0] || null;
  }

  async applyProviderResult(
    id_transaction: string,
    statut: TransactionStatus,
    eventId: string,
    client?: Queryable
  ): Promise<TransactionRecord | null> {
    const result = await this.db(client).query(
      `UPDATE transactions
       SET statut_transaction = $1, provider_event_id = COALESCE(provider_event_id, $2), updated_at = NOW()
       WHERE id_transaction = $3
       RETURNING *`,
      [statut, eventId, id_transaction]
    );
    return result.rows[0] || null;
  }
}
