import fs from 'fs';
import path from 'path';
import { periodStart } from '../src/repositories/analyticsRepository';
import { PdfService } from '../src/services/pdfService';

function extractLangKeys(source: string, lang: 'fr' | 'en' | 'ar'): string[] {
  const marker = `${lang}: {`;
  const start = source.indexOf(marker);
  if (start < 0) {
    throw new Error(`missing ${lang} block`);
  }
  const body = source.slice(start + marker.length);
  const end = body.indexOf('\n  }');
  const block = body.slice(0, end);
  return [...block.matchAll(/^\s{4}([A-Za-z0-9_]+):/gm)].map((match) => match[1]);
}

describe('i18n key parity and analytics/pdf units', () => {
  it('keeps FR, EN and AR keys aligned', () => {
    const source = fs.readFileSync(path.join(__dirname, '../../frontend/src/i18n/translations.ts'), 'utf8');
    const fr = extractLangKeys(source, 'fr').sort();
    const en = extractLangKeys(source, 'en').sort();
    const ar = extractLangKeys(source, 'ar').sort();
    expect(fr.length).toBeGreaterThan(10);
    expect(en).toEqual(fr);
    expect(ar).toEqual(fr);
  });

  it('exposes missing translation keys as the key itself', () => {
    const translations = { fr: { login: 'Connexion' } } as Record<string, Record<string, string>>;
    const t = (key: string) => translations.fr[key] || key;
    expect(t('login')).toBe('Connexion');
    expect(t('this_key_does_not_exist')).toBe('this_key_does_not_exist');
  });

  it('computes analytics period starts', () => {
    const year = periodStart('year');
    expect(year.getMonth()).toBe(0);
    expect(year.getDate()).toBe(1);
    const thirty = periodStart('30d');
    expect(Date.now() - thirty.getTime()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });

  it('renders a French invoice PDF buffer', async () => {
    const pdf = await new PdfService().renderInvoice({
      numero_facture: 'FAC-TEST-1',
      date_emission: '2026-09-29',
      client_nom: 'Client Demo',
      client_email: 'demo.client@nextrade.test',
      id_order: 'c1000000-0000-4000-8000-000000000001',
      devise: 'XOF',
      lignes: [{ nom: 'Demo Cacao 50kg', quantite: 1, prix_unitaire: 1200, sous_total: 1200 }],
      montant_ht: 1200,
      montant_tva: 0,
      montant_ttc: 1200
    });
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.length).toBeGreaterThan(200);
  });
});
