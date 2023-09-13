import { Settings } from "../../shared/models/settings";
import { Assessment } from "../../shared/models/assessment";
import { Directory } from "../../shared/models/directory";
import { Calculator } from "../../shared/models/calculators";
import { InventoryItem } from "../../shared/models/inventory/inventory";

export interface ImportExportAssessment {
    settings: Settings;
    assessment: Assessment;
    calculator?: Calculator;
}

export interface ImportExportDirectory {
    settings: Settings;
    directory: Directory;
    calculator?: Array<Calculator>;
}

export interface ImportExportInventory {
    inventoryItem: InventoryItem,
    settings: Settings;
}

export interface ImportExportData {
    directories: Array<ImportExportDirectory>;
    assessments: Array<ImportExportAssessment>;
    inventories: Array<ImportExportInventory>;
    calculators?: Array<Calculator>;
    origin?: string;
}
