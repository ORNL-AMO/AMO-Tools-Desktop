import { OperatingHours, OperatingCosts } from "./operations";

export interface SSMT {
    name?: string
    //  modifications?: Modification[],
    selected?: boolean,
    // fieldData?: FieldData,
    // fanMotor?: FanMotor,
    // fanSetup?: FanSetup,
    // baseGasDensity?: BaseGasDensity,
    // notes: Notes,
    implementationCosts?: number,
    setupDone?: boolean,
    operatingHours?: OperatingHours,
    operatingCosts?: OperatingCosts,
    equipmentNotes?: string
}