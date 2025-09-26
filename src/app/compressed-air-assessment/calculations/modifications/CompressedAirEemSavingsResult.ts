import { CompressedAirDayType, ProfileSummary, ProfileSummaryData } from "../../../shared/models/compressed-air-assessment"
import { EemSavingsResults } from "../caCalculationModels"
import * as _ from 'lodash';

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

    setEnergyAndCost(profileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number, summaryDataInterval: number, auxiliaryPowerUsage: { cost: number, energyUse: number }) {
        let filteredSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
        let flatSummaryData: Array<ProfileSummaryData> = _.flatMap(filteredSummary, (summary) => { return summary.profileSummaryData });
        flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
        let sumPower: number = _.sumBy(flatSummaryData, 'power');
        sumPower = sumPower * summaryDataInterval * dayType.numberOfDays;
        if (auxiliaryPowerUsage) {
            sumPower = sumPower + auxiliaryPowerUsage.energyUse;
        }
        let sumCost: number = sumPower * costKwh;
        this.cost = sumCost;
        this.power = sumPower;
    }

    setSavings(baselineResults: CompressedAirSavingsItem, adjustedResults: CompressedAirSavingsItem) {
        this.cost = baselineResults.cost - adjustedResults.cost;
        this.power = baselineResults.power - adjustedResults.power;
        this.percentSavings = ((baselineResults.cost - adjustedResults.cost) / baselineResults.cost) * 100;
    }
}


export class CompressedAirEemSavingsResult extends CompressedAirSavingsItem {

    baselineResults: CompressedAirSavingsItem;
    adjustedResults: CompressedAirSavingsItem;
    savings: CompressedAirSavingsItem;
    implementationCost: number;
    paybackPeriod: number
    dayTypeId: string

    constructor(profileSummary: Array<ProfileSummary>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, costKwh: number, implementationCost: number, summaryDataInterval: number, auxiliaryPowerUsage: { cost: number, energyUse: number }) {
        super();
        this.baselineResults = new CompressedAirSavingsItem();
        this.baselineResults.setEnergyAndCost(profileSummary, dayType, costKwh, summaryDataInterval, { cost: 0, energyUse: 0 });
        this.adjustedResults = new CompressedAirSavingsItem();
        this.adjustedResults.setEnergyAndCost(adjustedProfileSummary, dayType, costKwh, summaryDataInterval, auxiliaryPowerUsage);
        this.savings = new CompressedAirSavingsItem();
        this.savings.setSavings(this.baselineResults, this.adjustedResults);

        this.dayTypeId = dayType.dayTypeId;
        this.implementationCost = implementationCost;
        this.paybackPeriod = (this.implementationCost / this.savings.cost) * 12;
        if (this.paybackPeriod < 0) {
            this.paybackPeriod = 0;
        }
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

export function getEmptyEemSavings(): EemSavingsResults {
    return {
        baselineResults: {
            cost: 0,
            power: 0,
        },
        adjustedResults: {
            cost: 0,
            power: 0,
        },
        savings: {
            cost: 0,
            power: 0,
            percentSavings: 0,
        },
        implementationCost: 0,
        paybackPeriod: 0,
        dayTypeId: undefined,
    };
}