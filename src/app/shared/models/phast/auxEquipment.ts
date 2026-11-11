import { ElectricityReductionData } from '../standalone';

export interface AuxEquipment {
    name: string;
    dutyCycle: number;
    motorPower: string;
    motorPhase: string;
    supplyVoltage: number;
    averageCurrent: number;
    powerFactor: number;
    totalConnectedPower: number;
    ratedCapacity: number;
}

/**
 * Auxiliary equipment entered with the Electricity Reduction inputs. Electricity cost comes from the
 * facility settings rather than each item, and duty cycle is assumed to be 100%.
 */
export interface AuxiliaryEquipmentItem extends Omit<ElectricityReductionData, 'electricityCost'> {
    id: string;
}
