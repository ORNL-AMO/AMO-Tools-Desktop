import { CompressedAirDayType, ProfileSummary, ProfileSummaryData } from "../../../shared/models/compressed-air-assessment"
import { Settings } from "../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../compressed-air-calculation.service";
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
    salvageValue: number

    constructor(
        profileSummary: Array<ProfileSummary>,
        adjustedProfileSummary: Array<ProfileSummary>,
        dayType: CompressedAirDayType,
        costKwh: number,
        implementationCost: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        salvageValue: number,
        _compressedAirCalculationService: CompressedAirCalculationService,
        settings: Settings
    ) {
        super();
        let suiteSavings = _compressedAirCalculationService.calculateProfileSavings(
            profileSummary,
            adjustedProfileSummary,
            dayType,
            costKwh,
            implementationCost,
            summaryDataInterval,
            auxiliaryPowerUsage,
            salvageValue,
            settings
        );
        this.baselineResults = new CompressedAirSavingsItem();
        this.baselineResults.cost = suiteSavings.baselineCost;
        this.baselineResults.power = suiteSavings.baselineEnergyKwh;
        this.adjustedResults = new CompressedAirSavingsItem();
        this.adjustedResults.cost = suiteSavings.adjustedCost;
        this.adjustedResults.power = suiteSavings.adjustedEnergyKwh;
        this.savings = new CompressedAirSavingsItem();
        this.savings.cost = suiteSavings.costSavings;
        this.savings.power = suiteSavings.energySavingsKwh;
        this.savings.percentSavings = suiteSavings.percentSavings;

        this.dayTypeId = dayType.dayTypeId;
        this.implementationCost = implementationCost;
        this.salvageValue = salvageValue;
        this.paybackPeriod = suiteSavings.paybackMonths;
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
            salvageValue: this.salvageValue
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
        salvageValue: 0,
        paybackPeriod: 0,
        dayTypeId: undefined,
    };
}
