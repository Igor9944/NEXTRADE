import path from 'path';
import { randomUUID } from 'crypto';
import { Pool, PoolClient } from 'pg';
import { UPLOAD_MAX_BYTES } from '../config/upload';
import { DocumentRepository } from '../repositories/documentRepository';
import { OrderRepository } from '../repositories/orderRepository';
import { ProductRepository } from '../repositories/productRepository';
import { ImportExportRepository } from '../repositories/importExportRepository';
import { ShipmentRepository } from '../repositories/shipmentRepository';
import { UserRepository } from '../repositories/userRepository';
import { Actor, DocumentType, FormalityStatus } from '../types/document';
import { AppError } from '../utils/appError';
import { PdfService } from './pdfService';
import { StorageService } from './storageService';

const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_BYTES = UPLOAD_MAX_BYTES;
const DOCUMENT_TYPES: DocumentType[] = [
  'FACTURE_COMMERCIALE',
  'PACKING_LIST',
  'CERTIFICAT_ORIGINE',
  'DOCUMENT_DOUANE',
  'DOCUMENT_TRANSPORT',
  'AUTRE'
];

const FORMALITY_FLOW: Record<string, string[]> = {
  A_FAIRE: ['EN_COURS', 'BLOQUE'],
  EN_COURS: ['TERMINE', 'BLOQUE', 'A_FAIRE'],
  BLOQUE: ['EN_COURS', 'A_FAIRE'],
  TERMINE: []
};

export class DocumentService {
  constructor(
    private pool: Pool,
    private documents: DocumentRepository,
    private orders: OrderRepository,
    private products: ProductRepository,
    private importExport: ImportExportRepository,
    private shipments: ShipmentRepository,
    private users: UserRepository,
    private storage: StorageService,
    private pdf: PdfService
  ) {}

  async uploadDocument(
    actor: Actor,
    file: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    meta: {
      type_document: string;
      id_order?: string;
      id_operation?: string;
      id_shipment?: string;
    }
  ) {
    this.assertCanWrite(actor);
    if (!DOCUMENT_TYPES.includes(meta.type_document as DocumentType)) {
      throw new AppError('Invalid document type', 400);
    }
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new AppError('Unsupported file type', 400);
    }
    if (!mimeMatchesContent(file.mimetype, file.buffer)) {
      throw new AppError('File content does not match declared type', 400);
    }
    if (file.size > MAX_BYTES) {
      throw new AppError('File too large', 400);
    }
    if (!meta.id_order && !meta.id_operation && !meta.id_shipment) {
      throw new AppError('A document must be linked to an order, operation or shipment', 400);
    }
    await this.assertLinksExist(meta);

    return this.withTransaction(async (client) => {
      const reference = await this.documents.nextDocumentReference(client);
      const storedExt = path.extname(file.originalname || '').toLowerCase() || this.extFromMime(file.mimetype);
      const storageKey = this.buildStorageKey(meta, storedExt);
      const stored = await this.storage.upload(storageKey, file.buffer, file.mimetype);
      const created = await this.documents.createDocument(
        {
          reference_document: reference,
          type_document: meta.type_document as DocumentType,
          original_file_name: path.basename(file.originalname || `file${storedExt}`),
          nom_fichier: path.basename(storageKey),
          mime_type: file.mimetype,
          file_size: stored.file_size,
          storage_key: stored.storage_key,
          uploaded_by: actor.id,
          id_order: meta.id_order,
          id_operation: meta.id_operation,
          id_shipment: meta.id_shipment
        },
        client
      );
      await this.documents.addDocumentHistory(
        {
          id_document: created.id_document,
          action: 'UPLOAD',
          new_status: 'ACTIF',
          changed_by: actor.id,
          comment: meta.type_document
        },
        client
      );
      return created;
    });
  }

  async listDocuments(actor: Actor, filters: Record<string, string | undefined>) {
    const scoped = this.scopeFilters(actor, filters);
    return this.documents.listDocuments({
      id_order: scoped.id_order,
      id_operation: scoped.id_operation,
      id_shipment: scoped.id_shipment,
      type_document: scoped.type_document as DocumentType | undefined,
      id_client: scoped.id_client,
      transporteur_id: scoped.transporteur_id,
      fournisseur_id: scoped.fournisseur_id,
      page: filters.page ? Number(filters.page) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined
    });
  }

  async getDocument(actor: Actor, id: string) {
    const document = await this.documents.findDocumentById(id);
    if (!document || document.statut === 'SUPPRIME') {
      throw new AppError('Document not found', 404);
    }
    this.assertCanReadDocument(actor, document as DocumentRecordWithLinks);
    const history = await this.documents.getDocumentHistory(id);
    return { document, history };
  }

  async downloadDocument(actor: Actor, id: string) {
    const { document } = await this.getDocument(actor, id);
    if (!document.storage_key) {
      throw new AppError('Document has no stored file', 404);
    }
    const buffer = await this.storage.download(document.storage_key);
    return {
      buffer,
      mime_type: document.mime_type || 'application/octet-stream',
      file_name: document.original_file_name || document.nom_fichier || `${document.reference_document}.bin`
    };
  }

  async deleteDocument(actor: Actor, id: string) {
    if (actor.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }
    const existing = await this.documents.findDocumentById(id);
    if (!existing || existing.statut === 'SUPPRIME') {
      throw new AppError('Document not found', 404);
    }
    const deleted = await this.documents.softDeleteDocument(id);
    await this.documents.addDocumentHistory({
      id_document: id,
      action: 'DELETE',
      old_status: existing.statut,
      new_status: 'SUPPRIME',
      changed_by: actor.id
    });
    return deleted;
  }

  async generateInvoice(actor: Actor, orderId: string) {
    this.assertCanWrite(actor);
    const order = await this.orders.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.statut === 'ANNULEE') {
      throw new AppError('Cannot invoice a cancelled order', 400);
    }
    const duplicate = await this.documents.findActiveInvoiceByOrder(orderId);
    if (duplicate) {
      throw new AppError('An active invoice already exists for this order', 409);
    }

    const items = await this.orders.getOrderItems(orderId);
    if (items.length === 0) {
      throw new AppError('Order has no items', 400);
    }

    const taxRate = Number(process.env.INVOICE_TAX_RATE || '0');
    const lignes: Array<{ nom: string; quantite: number; prix_unitaire: number; sous_total: number }> = [];
    let montantHt = 0;
    for (const item of items) {
      const product = await this.products.findById(item.id_product);
      const unit = Number(item.prix_unitaire_fige);
      const sousTotal = unit * item.quantite;
      montantHt += sousTotal;
      lignes.push({
        nom: product?.nom || item.id_product,
        quantite: item.quantite,
        prix_unitaire: unit,
        sous_total: sousTotal
      });
    }
    const montantTva = Number((montantHt * taxRate).toFixed(2));
    const montantTtc = Number((montantHt + montantTva).toFixed(2));
    const customer = await this.users.findById(order.id_client);
    const devise = process.env.INVOICE_CURRENCY || 'XOF';
    const today = new Date().toISOString().slice(0, 10);

    return this.withTransaction(async (tx) => {
      const numero = await this.documents.nextInvoiceNumber(tx);
      const pdf = await this.pdf.renderInvoice({
        numero_facture: numero,
        date_emission: today,
        client_nom: [customer?.prenom, customer?.nom].filter(Boolean).join(' ') || customer?.nom_entreprise || order.id_client,
        client_email: customer?.email || '',
        client_adresse: [customer?.adresse, customer?.ville, customer?.pays].filter(Boolean).join(', ') || order.adresse_livraison || '',
        id_order: order.id_order,
        devise,
        lignes,
        montant_ht: montantHt,
        montant_tva: montantTva,
        montant_ttc: montantTtc
      });

      const docRef = await this.documents.nextDocumentReference(tx);
      const storageKey = `documents/orders/${orderId}/${randomUUID()}.pdf`;
      const stored = await this.storage.upload(storageKey, pdf, 'application/pdf');
      const document = await this.documents.createDocument(
        {
          reference_document: docRef,
          type_document: 'FACTURE_COMMERCIALE',
          original_file_name: `${numero}.pdf`,
          nom_fichier: `${numero}.pdf`,
          mime_type: 'application/pdf',
          file_size: stored.file_size,
          storage_key: stored.storage_key,
          uploaded_by: actor.id,
          id_order: orderId
        },
        tx
      );
      await this.documents.addDocumentHistory(
        {
          id_document: document.id_document,
          action: 'GENERATE',
          new_status: 'ACTIF',
          changed_by: actor.id,
          comment: 'Invoice PDF'
        },
        tx
      );

      const invoice = await this.documents.createInvoice(
        {
          numero_facture: numero,
          id_order: orderId,
          id_client: order.id_client,
          devise,
          montant_ht: montantHt,
          montant_tva: montantTva,
          montant_ttc: montantTtc,
          statut: 'ENVOYEE',
          date_emission: today,
          id_document: document.id_document
        },
        tx
      );
      await this.documents.addInvoiceHistory(
        {
          id_invoice: invoice.id_invoice,
          action: 'CREATE',
          new_status: invoice.statut,
          changed_by: actor.id
        },
        tx
      );
      return { invoice, document };
    });
  }

  async generatePackingList(actor: Actor, orderId: string) {
    this.assertCanWrite(actor);
    const order = await this.orders.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 400);
    }
    const items = await this.orders.getOrderItems(orderId);
    const customer = await this.users.findById(order.id_client);
    const lignes: Array<{ nom: string; quantite: number; unite: string }> = [];
    for (const item of items) {
      const product = await this.products.findById(item.id_product);
      lignes.push({ nom: product?.nom || item.id_product, quantite: item.quantite, unite: 'u' });
    }

    return this.withTransaction(async (tx) => {
      const reference = await this.documents.nextDocumentReference(tx);
      const pdf = await this.pdf.renderPackingList({
        reference,
        id_order: orderId,
        client_nom: customer?.nom_entreprise || order.id_client,
        destination: order.adresse_livraison,
        lignes
      });
      const storageKey = `documents/orders/${orderId}/${randomUUID()}.pdf`;
      const stored = await this.storage.upload(storageKey, pdf, 'application/pdf');
      const document = await this.documents.createDocument(
        {
          reference_document: reference,
          type_document: 'PACKING_LIST',
          original_file_name: `${reference}.pdf`,
          nom_fichier: `${reference}.pdf`,
          mime_type: 'application/pdf',
          file_size: stored.file_size,
          storage_key: stored.storage_key,
          uploaded_by: actor.id,
          id_order: orderId
        },
        tx
      );
      await this.documents.addDocumentHistory(
        {
          id_document: document.id_document,
          action: 'GENERATE',
          new_status: 'ACTIF',
          changed_by: actor.id,
          comment: 'Packing list PDF'
        },
        tx
      );
      return document;
    });
  }

  async getInvoice(actor: Actor, id: string) {
    const invoice = await this.documents.findInvoiceById(id);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }
    if ((actor.role === 'CLIENT' || actor.role === 'COMMERCANT') && invoice.id_client !== actor.id) {
      throw new AppError('Forbidden', 403);
    }
    if (actor.role !== 'ADMIN' && actor.role !== 'CLIENT' && actor.role !== 'COMMERCANT') {
      throw new AppError('Forbidden', 403);
    }
    const history = await this.documents.getInvoiceHistory(id);
    return { invoice, history };
  }

  async downloadInvoice(actor: Actor, id: string) {
    const { invoice } = await this.getInvoice(actor, id);
    if (!invoice.id_document) {
      throw new AppError('Invoice PDF is missing', 404);
    }
    return this.downloadDocument(actor, invoice.id_document);
  }

  async listFormalities(actor: Actor, id_operation: string) {
    const operation = await this.importExport.getOperationById(id_operation);
    if (!operation) {
      throw new AppError('Operation not found', 404);
    }
    await this.assertCanAccessOperation(actor, operation);
    return this.documents.listFormalitiesByOperation(id_operation);
  }

  async updateFormalityStatus(actor: Actor, id: string, statut: string, comment?: string) {
    if (actor.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }
    const allowed: FormalityStatus[] = ['A_FAIRE', 'EN_COURS', 'TERMINE', 'BLOQUE'];
    if (!allowed.includes(statut as FormalityStatus)) {
      throw new AppError('Invalid formality status', 400);
    }
    const current = await this.documents.findFormalityById(id);
    if (!current) {
      throw new AppError('Formality not found', 404);
    }
    const nexts = FORMALITY_FLOW[current.statut] || [];
    if (!nexts.includes(statut)) {
      throw new AppError(`Invalid formality transition from ${current.statut} to ${statut}`, 400);
    }
    const updated = await this.documents.updateFormalityStatus(id, statut);
    await this.documents.addFormalityHistory({
      id_formality: id,
      action: 'STATUS',
      old_status: current.statut,
      new_status: statut,
      changed_by: actor.id,
      comment: comment ?? null
    });
    return updated;
  }

  async getFormalityHistory(actor: Actor, id: string) {
    const current = await this.documents.findFormalityById(id);
    if (!current) {
      throw new AppError('Formality not found', 404);
    }
    const operation = await this.importExport.getOperationById(current.id_operation);
    if (!operation) {
      throw new AppError('Operation not found', 404);
    }
    await this.assertCanAccessOperation(actor, operation);
    return this.documents.getFormalityHistory(id);
  }

  async getOrderDossier(actor: Actor, orderId: string) {
    const order = await this.orders.getById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if ((actor.role === 'CLIENT' || actor.role === 'COMMERCANT') && order.id_client !== actor.id) {
      throw new AppError('Forbidden', 403);
    }
    if (actor.role === 'FOURNISSEUR' || actor.role === 'TRANSPORTEUR') {
      throw new AppError('Forbidden', 403);
    }
    if (actor.role !== 'ADMIN' && actor.role !== 'CLIENT' && actor.role !== 'COMMERCANT') {
      throw new AppError('Forbidden', 403);
    }
    const listed = await this.listDocuments(actor, { id_order: orderId });
    const invoice = await this.documents.findActiveInvoiceByOrder(orderId);
    const operations = await this.documents.listOperationsByOrder(orderId);
    const formalities: Array<Record<string, unknown>> = [];
    for (const operation of operations) {
      const rows = await this.documents.listFormalitiesByOperation(operation.id_operation);
      formalities.push(...rows);
    }
    return {
      order,
      invoice,
      documents: listed.documents,
      factures: listed.documents.filter((doc) => doc.type_document === 'FACTURE_COMMERCIALE'),
      packing_lists: listed.documents.filter((doc) => doc.type_document === 'PACKING_LIST'),
      autres: listed.documents.filter(
        (doc) => doc.type_document !== 'FACTURE_COMMERCIALE' && doc.type_document !== 'PACKING_LIST'
      ),
      operations,
      formalities
    };
  }

  private buildStorageKey(
    meta: { id_order?: string; id_operation?: string; id_shipment?: string },
    ext: string
  ): string {
    const id = randomUUID();
    if (meta.id_order) {
      return `documents/orders/${meta.id_order}/${id}${ext}`;
    }
    if (meta.id_operation) {
      return `documents/operations/${meta.id_operation}/${id}${ext}`;
    }
    return `documents/shipments/${meta.id_shipment}/${id}${ext}`;
  }

  private assertCanWrite(actor: Actor) {
    if (actor.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }
  }

  private scopeFilters(actor: Actor, filters: Record<string, string | undefined>) {
    if (actor.role === 'ADMIN') {
      return filters;
    }
    if (actor.role === 'CLIENT' || actor.role === 'COMMERCANT') {
      return { ...filters, id_client: actor.id };
    }
    if (actor.role === 'TRANSPORTEUR') {
      return { ...filters, transporteur_id: actor.id };
    }
    if (actor.role === 'FOURNISSEUR') {
      return { ...filters, fournisseur_id: actor.id };
    }
    throw new AppError('Insufficient permissions', 403);
  }

  private assertCanReadDocument(actor: Actor, document: DocumentRecordWithLinks) {
    if (actor.role === 'ADMIN') {
      return;
    }
    if (actor.role === 'CLIENT' || actor.role === 'COMMERCANT') {
      if (document.id_client === actor.id || document.operation_order_client === actor.id) {
        return;
      }
      throw new AppError('Forbidden', 403);
    }
    if (actor.role === 'TRANSPORTEUR') {
      if (document.transporteur_id === actor.id) {
        return;
      }
      throw new AppError('Forbidden', 403);
    }
    if (actor.role === 'FOURNISSEUR') {
      if (document.fournisseur_id === actor.id) {
        return;
      }
      throw new AppError('Forbidden', 403);
    }
    throw new AppError('Forbidden', 403);
  }

  private async assertCanAccessOperation(actor: Actor, operation: { id_order?: string | null; id_purchase?: string | null }) {
    if (actor.role === 'ADMIN') {
      return;
    }
    if (actor.role === 'CLIENT' || actor.role === 'COMMERCANT') {
      if (!operation.id_order) {
        throw new AppError('Forbidden', 403);
      }
      const order = await this.orders.getById(operation.id_order);
      if (!order || order.id_client !== actor.id) {
        throw new AppError('Forbidden', 403);
      }
      return;
    }
    if (actor.role === 'FOURNISSEUR') {
      if (!operation.id_purchase) {
        throw new AppError('Forbidden', 403);
      }
      const purchase = await this.pool.query('SELECT id_fournisseur FROM purchases WHERE id_purchase = $1', [
        operation.id_purchase
      ]);
      if (!purchase.rows[0] || purchase.rows[0].id_fournisseur !== actor.id) {
        throw new AppError('Forbidden', 403);
      }
      return;
    }
    throw new AppError('Forbidden', 403);
  }

  private async assertLinksExist(meta: { id_order?: string; id_operation?: string; id_shipment?: string }) {
    if (meta.id_order) {
      const order = await this.orders.getById(meta.id_order);
      if (!order) {
        throw new AppError('Order not found', 400);
      }
    }
    if (meta.id_operation) {
      const operation = await this.importExport.getOperationById(meta.id_operation);
      if (!operation) {
        throw new AppError('Operation not found', 400);
      }
    }
    if (meta.id_shipment) {
      const shipment = await this.shipments.findById(meta.id_shipment);
      if (!shipment) {
        throw new AppError('Shipment not found', 400);
      }
    }
  }

  private extFromMime(mime: string): string {
    if (mime === 'application/pdf') return '.pdf';
    if (mime === 'image/jpeg') return '.jpg';
    if (mime === 'image/png') return '.png';
    return '.bin';
  }

  private async withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

function mimeMatchesContent(mime: string, buffer: Buffer): boolean {
  if (mime === 'application/pdf') {
    return buffer.subarray(0, 4).toString('utf8') === '%PDF';
  }
  if (mime === 'image/jpeg') {
    return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
  }
  if (mime === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return false;
}

type DocumentRecordWithLinks = {
  statut: string;
  id_client?: string | null;
  transporteur_id?: string | null;
  fournisseur_id?: string | null;
  operation_order_id?: string | null;
  operation_order_client?: string | null;
};
