import { Settings } from "../../shared/models/settings";
import { Assessment } from "../../shared/models/assessment";
import { Directory } from "../../shared/models/directory";
import { Calculator } from "../../shared/models/calculators";
import { InventoryItem } from "../../shared/models/inventory/inventory";
import { Diagram } from "../models/diagram";

export interface ImportExportAssessment {
    settings: Settings;
    assessment: Assessment;
    calculator?: Calculator;
    diagram?: Diagram;
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

export interface ImportExportDiagram {
    settings: Settings;
    diagram: Diagram;
    assessment?: Assessment;
}

export interface ImportExportData {
    directories: Array<ImportExportDirectory>;
    assessments: Array<ImportExportAssessment>;
    inventories: Array<ImportExportInventory>;
    diagrams: Array<ImportExportDiagram>;
    calculators?: Array<Calculator>;
    origin?: string;
}
