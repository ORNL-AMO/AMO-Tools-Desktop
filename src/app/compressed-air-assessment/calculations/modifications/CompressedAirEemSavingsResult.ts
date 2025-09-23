import { EemSavingsResults } from "../caCalculationModels"

export class CompressedAirSavingsItem {
    cost: number
    power: number
    annualEmissionOutput: number
    annualEmissionOutputSavings: number
    percentSavings: number
    constructor() {
        this.cost = 0;
        this.power = 0;
        this.annualEmissionOutput = 0;
        this.annualEmissionOutputSavings = 0;
        this.percentSavings = 0;
    }
}


export class CompressedAirEemSavingsResult extends CompressedAirSavingsItem {

    baselineResults: CompressedAirSavingsItem;
    adjustedResults: CompressedAirSavingsItem;
    savings: CompressedAirSavingsItem;
    implementationCost: number;
    paybackPeriod: number
    dayTypeId: string

    constructor() {
        super();
        this.baselineResults = new CompressedAirSavingsItem();
        this.adjustedResults = new CompressedAirSavingsItem();
        this.savings = new CompressedAirSavingsItem();
        this.implementationCost = 0;
        this.paybackPeriod = 0;
        this.dayTypeId = '';
    }

    getEemSavingsResults(): EemSavingsResults {
        return {
            baselineResults: this.baselineResults,
            adjustedResults: this.adjustedResults,
            savings: this.savings,
            implementationCost: this.implementationCost,
            paybackPeriod: this.paybackPeriod,
            dayTypeId: this.dayTypeId,
        }
    }
}
