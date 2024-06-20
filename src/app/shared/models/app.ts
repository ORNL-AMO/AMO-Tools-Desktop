import { WaterDiagram } from "../../../process-flow-types/shared-process-flow-types";

export type MeasurItemType = 'page' | 'assessment' | 'inventory' | 'data-explorer';

export interface Diagram {
    id?: number,
    directoryId?: number,
    waterDiagram?: WaterDiagram,
    createdDate?: Date,
    modifiedDate?: Date,
    type: string;
    name: string;
    selected?: boolean;
    appVersion?: string;
    isExample?: boolean;
}