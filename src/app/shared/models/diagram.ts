import { ParentContainerDimensions, WaterDiagram } from "process-flow-lib";
import { Assessment } from "./assessment";

export interface Diagram {
    id?: number,
    directoryId?: number,
    assessmentId?: number,
    waterDiagram?: WaterDiagram,
    createdDate?: Date,
    modifiedDate?: Date,
    type: string;
    name: string;
    selected?: boolean;
    appVersion?: string;
    isExample?: boolean;
}

export interface IntegratedAssessmentDiagram {
    diagramId: number,
    assessment: Assessment,
    parentDimensions: ParentContainerDimensions
  }