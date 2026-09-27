import PDFDocument from 'pdfkit';

export interface InvoicePdfLine {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

export interface InvoicePdfInput {
  numero_facture: string;
  date_emission: string;
  client_nom: string;
  client_email: string;
  client_adresse?: string;
  id_order: string;
  devise: string;
  lignes: InvoicePdfLine[];
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
}

export interface PackingPdfInput {
  reference: string;
  id_order: string;
  client_nom: string;
  destination?: string | null;
  lignes: Array<{ nom: string; quantite: number; unite?: string }>;
}

function money(value: number, devise: string): string {
  return `${Number(value).toFixed(2)} ${devise}`;
}

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

export class PdfService {
  async renderInvoice(input: InvoicePdfInput): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.fontSize(20).text('NEXTRADE', { align: 'left' });
    doc.fontSize(12).text('Facture commerciale', { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).text(`Numéro : ${input.numero_facture}`);
    doc.text(`Date : ${input.date_emission}`);
    doc.text(`Commande : ${input.id_order}`);
    doc.text(`Client : ${input.client_nom}`);
    doc.text(`Email : ${input.client_email}`);
    if (input.client_adresse) {
      doc.text(`Adresse : ${input.client_adresse}`);
    }
    doc.text(`Devise : ${input.devise}`);
    doc.moveDown();
    input.lignes.forEach((line) => {
      doc.text(
        `${line.nom}  x${line.quantite}  @ ${money(line.prix_unitaire, input.devise)}  = ${money(line.sous_total, input.devise)}`
      );
    });
    doc.moveDown();
    doc.text(`Sous-total HT : ${money(input.montant_ht, input.devise)}`);
    doc.text(`Taxe : ${money(input.montant_tva, input.devise)}`);
    doc.fontSize(12).text(`Total TTC : ${money(input.montant_ttc, input.devise)}`);
    return collectPdf(doc);
  }

  async renderPackingList(input: PackingPdfInput): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.fontSize(20).text('NEXTRADE', { align: 'left' });
    doc.fontSize(12).text('Packing list', { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).text(`Référence : ${input.reference}`);
    doc.text(`Commande : ${input.id_order}`);
    doc.text(`Client : ${input.client_nom}`);
    if (input.destination) {
      doc.text(`Destination : ${input.destination}`);
    }
    doc.moveDown();
    input.lignes.forEach((line) => {
      doc.text(`${line.nom}  —  ${line.quantite} ${line.unite || 'u'}`);
    });
    return collectPdf(doc);
  }
}
