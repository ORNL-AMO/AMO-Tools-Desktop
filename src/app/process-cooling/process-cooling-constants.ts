import { getNewIdString } from "../shared/helperFunctions";
import { ChillerInventoryItem } from "../shared/models/process-cooling-assessment";

// * avoid accidental mutation, ex. we pop, shift options
export const getCondenserCoolingMethods = () => {
    return [
        { value: 0, name: 'Water' },
        { value: 1, name: 'Air' },
    ] as const;
};

export enum CompressorChillerTypeEnum {
    CENTRIFUGAL = 0,
    //helical rotary, see SuiteApiHelperService.ts note
    SCREW = 1,
    RECIPROCATING = 2,
}

export const CompressorChillerTypes =
{
    [CompressorChillerTypeEnum.CENTRIFUGAL]: 'Centrifugal',
    [CompressorChillerTypeEnum.RECIPROCATING]: 'Reciprocating',
    [CompressorChillerTypeEnum.SCREW]: 'Helical Rotary'
}

export const getDefaultInventoryItem = (): ChillerInventoryItem => {
    return {
        itemId: getNewIdString(),
        name: 'New Chiller',
        description: undefined,
        modifiedDate: new Date(),
        chillerType: CompressorChillerTypeEnum.CENTRIFUGAL,
        capacity: 0,
        isFullLoadEffKnown: false,
        fullLoadEff: 0,
        age: 0,
        installVSD: false,
        useARIMonthlyLoadSchedule: false,
        monthlyLoads: Array(12).fill(Array(11).fill(0)),
    };
}