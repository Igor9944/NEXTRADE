import { ImportExportRepository } from '../repositories/importExportRepository';
import {
  ImportExportOperationRecord,
  ImportExportItemRecord,
  CustomsFormalityRecord,
  ImportExportOperationStatus,
  TransportMode,
} from '../types/importExport';
import { Product } from '../types/catalog';

export class ImportExportService {
  constructor(private importExportRepository: ImportExportRepository) {}

  async createImportExportOperation(
    data: {
      type_operation: 'IMPORT' | 'EXPORT';
      id_order?: string;
      id_purchase?: string;
      reference_operation: string;
      pays_origine: string;
      pays_destination: string;
      statut?: ImportExportOperationStatus;
      date_depart?: string | null;
      date_arrivee_prevue?: string | null;
      mode_transport?: TransportMode | null;
      items: Array<{
        id_product: string;
        quantite: number;
        unite?: string;
      }>;
    }
  ): Promise<{
    operation: ImportExportOperationRecord;
    items: ImportExportItemRecord[];
    formalities: CustomsFormalityRecord[];
  }> {
    // Validate that either id_order or id_purchase is provided
    if (!data.id_order && !data.id_purchase) {
      throw new Error('Either id_order or id_purchase must be provided');
    }

    // Validate that pays_origine and pays_destination are not empty
    if (!data.pays_origine.trim() || !data.pays_destination.trim()) {
      throw new Error('Origin and destination countries are required');
    }

    // Validate that items array is not empty
    if (!data.items || data.items.length === 0) {
      throw new Error('At least one item must be provided');
    }

    // Validate each item
    for (const item of data.items) {
      if (item.quantite <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      // Note: We assume product validation will be done by checking if product exists
      // In a real system, we would check the product repository here
    }

    // Create the operation
    const operation = await this.importExportRepository.createOperation({
      type_operation: data.type_operation,
      id_order: data.id_order,
      id_purchase: data.id_purchase,
      reference_operation: data.reference_operation,
      pays_origine: data.pays_origine,
      pays_destination: data.pays_destination,
      statut: data.statut,
      date_depart: data.date_depart,
      date_arrivee_prevue: data.date_arrivee_prevue,
      mode_transport: data.mode_transport,
    });

    // Add items to the operation
    const itemsWithOperationId = data.items.map((item) => ({
      id_operation: operation.id_operation,
      id_product: item.id_product,
      quantite: item.quantite,
      unite: item.unite,
    }));

    const createdItems = await this.importExportRepository.addItems(
      itemsWithOperationId
    );

    // If the operation is transfrontaliere (origin != destination), create an initial customs formality
    const formalities: CustomsFormalityRecord[] = [];
    if (data.pays_origine.toLowerCase() !== data.pays_destination.toLowerCase()) {
      const formality = await this.importExportRepository.addCustomsFormality({
        id_operation: operation.id_operation,
        type_formality: 'DECLARATION_EN_DOUANE', // Initial formality type
        statut: 'A_FAIRE',
      });
      formalities.push(formality);
    }

    return {
      operation,
      items: createdItems,
      formalities,
    };
  }

  async getOperationById(id_operation: string): Promise<{
    operation: ImportExportOperationRecord | null;
    items: ImportExportItemRecord[];
    formalities: CustomsFormalityRecord[];
  }> {
    const operation = await this.importExportRepository.getOperationById(id_operation);
    if (!operation) {
      return { operation: null, items: [], formalities: [] };
    }

    const items = await this.importExportRepository.getOperationItems(operation.id_operation);
    const formalities = await this.importExportRepository.getCustomsFormalitiesByOperation(
      operation.id_operation
    );

    return { operation, items, formalities };
  }

  async updateOperationStatus(
    id_operation: string,
    statut: ImportExportOperationStatus
  ): Promise<ImportExportOperationRecord | null> {
    // Here we could add business logic to validate status transitions
    // For now, we'll just update the status
    return await this.importExportRepository.updateOperationStatus(id_operation, statut);
  }

  async listOperations(
    filters: {
      type_operation?: 'IMPORT' | 'EXPORT';
      statut?: ImportExportOperationStatus;
      pays_origine?: string;
      pays_destination?: string;
      reference_operation?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    return await this.importExportRepository.listOperations(filters);
  }

  async deleteOperation(id_operation: string): Promise<boolean> {
    return await this.importExportRepository.deleteOperation(id_operation);
  }
}
