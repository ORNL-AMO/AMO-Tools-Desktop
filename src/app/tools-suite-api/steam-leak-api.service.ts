import { Injectable } from '@angular/core';
import { ToolsSuiteApiService } from './tools-suite-api.service';

type SteamLeakUtilityTypeKey = 'steam' | 'electric' | 'natural_gas';

export interface SteamLeakUtilityTypeOption {
    value: number;
    name: string;
    key: SteamLeakUtilityTypeKey;
}

export interface SteamLeakApiResult {
    leakRate: number;
    steamLoss: number;
    energyLoss: number;
    leakCost: number;
}

export interface SteamLeakApiInput {
    operatingTime: number;
    steamTemp: number;
    steamPressure: number;
    costOfElectricity: number;
    leakPressure: number;
    leakTemp: number;
    feedwaterTemp: number;
    boilerEfficiency: number;
    systemEfficiency: number;
    utilityType: SteamLeakUtilityTypeKey;
    fuelCost: number;
    fuelEnergyFactor: number;
    steamCost: number;
}

@Injectable({ providedIn: 'root' })
export class SteamLeakApiService {
    constructor(
        private toolsSuiteApiService: ToolsSuiteApiService,
    ) { }

        // Use the generic 13-arg constructor so we can support all utility types with one code path.
    private readonly defaultSteamLeakApiInput: SteamLeakApiInput = {
        operatingTime: 8760,
        steamTemp: 500,
        steamPressure: 300,
        costOfElectricity: 0.1,
        leakPressure: 200,
        leakTemp: 400,
        feedwaterTemp: 70,
        boilerEfficiency: 80,
        systemEfficiency: 75,
        utilityType: 'electric',
        fuelCost: 15.5,
        fuelEnergyFactor: 1.038,
        steamCost: 0,
    };

    /**
     * Normalize input, map enums, and create a SteamLeakSurvey WASM instance.
     * Always delete the instance after use.
     */
    private createSurveyInstance(input?: Partial<SteamLeakApiInput>) {
        const merged: SteamLeakApiInput = {
            ...this.defaultSteamLeakApiInput,
            ...(input ?? {}),
        };
        const utilityType = this.getUtilityTypeEnum(merged.utilityType);
        const SteamLeakSurvey = this.toolsSuiteApiService.ToolsSuiteModule.SteamLeakSurvey;
        return new SteamLeakSurvey(
            merged.operatingTime,
            merged.steamTemp,
            merged.steamPressure,
            merged.costOfElectricity,
            merged.leakPressure,
            merged.leakTemp,
            merged.feedwaterTemp,
            merged.boilerEfficiency,
            merged.systemEfficiency,
            utilityType,
            merged.fuelCost,
            merged.fuelEnergyFactor,
            merged.steamCost,
        );
    }

    getUtilityTypeEnum(type: SteamLeakUtilityTypeKey): number {
        const module = this.toolsSuiteApiService.ToolsSuiteModule;
        const utilityTypeEnum = module?.UtilityType ?? module?.SteamLeakSurvey?.UtilityType;
        if (!utilityTypeEnum) {
            throw new Error('Steam leak UtilityType enum is not available. Ensure ToolsSuiteApiService.initializeModule() has completed.');
        }
        return utilityTypeEnum[type];
    }

    getCostOfSteam(turbineEfficiency?: number, surveyInput?: Partial<SteamLeakApiInput>): number {
        const instance = this.createSurveyInstance(surveyInput);
        try {
            return turbineEfficiency === undefined
                ? instance.costOfSteam()
                : instance.costOfSteam(turbineEfficiency);
        } finally {
            instance.delete();
        }
    }

    estimateMethodPRVCalc(leakRate: number, surveyInput?: Partial<SteamLeakApiInput>): SteamLeakApiResult {
        const instance = this.createSurveyInstance(surveyInput);
        const result = instance.estimateMethodPRVCalc(leakRate);
        console.log('estimateMethodPRVCalc leakRate', result.leakRate);
        console.log('estimateMethodPRVCalc steamLoss', result.steamLoss);
        console.log('estimateMethodPRVCalc energyLoss', result.energyLoss);
        console.log('estimateMethodPRVCalc leakCost', result.leakCost);
        console.log('estimateMethodPRVCalc steamUnitCost', result.steamUnitCost);
        try {
            return {
                leakRate: result.leakRate,
                steamLoss: result.steamLoss,
                energyLoss: result.energyLoss,
                leakCost: result.leakCost,
            };
        } finally {
            result.delete();
            instance.delete();
        }
    }

    estimateMethodTurbineCalc(leakRate: number, turbineEfficiency: number, surveyInput?: Partial<SteamLeakApiInput>): SteamLeakApiResult {
        const instance = this.createSurveyInstance(surveyInput);
        const result = instance.estimateMethodTurbineCalc(leakRate, turbineEfficiency);
        console.log('estimateMethodTurbineCalc leakRate', result.leakRate);
        console.log('estimateMethodTurbineCalc steamLoss', result.steamLoss);
        console.log('estimateMethodTurbineCalc energyLoss', result.energyLoss);
        console.log('estimateMethodTurbineCalc leakCost', result.leakCost);
        console.log('estimateMethodTurbineCalc steamUnitCost', result.steamUnitCost);
        try {
            return {
                leakRate: result.leakRate,
                steamLoss: result.steamLoss,
                energyLoss: result.energyLoss,
                leakCost: result.leakCost,
            };
        } finally {
            result.delete();
            instance.delete();
        }
    }

    orificeMethodCalc(turbineEfficiency: number, holeSize: number, dischargeCoef: number, atmPressure: number, surveyInput?: Partial<SteamLeakApiInput>): SteamLeakApiResult {
        const instance = this.createSurveyInstance(surveyInput);
        const result = instance.orificeMethodCalc(turbineEfficiency, holeSize, dischargeCoef, atmPressure);
        console.log('orificeMethodCalc leakRate', result.leakRate);
        console.log('orificeMethodCalc steamLoss', result.steamLoss);
        console.log('orificeMethodCalc energyLoss', result.energyLoss);
        console.log('orificeMethodCalc leakCost', result.leakCost);
        console.log('orificeMethodCalc steamUnitCost', result.steamUnitCost);
        try {
            return {
                leakRate: result.leakRate,
                steamLoss: result.steamLoss,
                energyLoss: result.energyLoss,
                leakCost: result.leakCost,
            };
        } finally {
            result.delete();
            instance.delete();
        }
    }

    plumeMethodCalc(turbineEfficiency: number, plumeLength: number, ambTemp: number, surveyInput?: Partial<SteamLeakApiInput>): SteamLeakApiResult {
        const instance = this.createSurveyInstance(surveyInput);
        const result = instance.plumeMethodCalc(turbineEfficiency, plumeLength, ambTemp);
        console.log('plumeMethodCalc leakRate', result.leakRate);
        console.log('plumeMethodCalc steamLoss', result.steamLoss);
        console.log('plumeMethodCalc energyLoss', result.energyLoss);
        console.log('plumeMethodCalc leakCost', result.leakCost);
        console.log('plumeMethodCalc steamUnitCost', result.steamUnitCost);
        try {
            return {
                leakRate: result.leakRate,
                steamLoss: result.steamLoss,
                energyLoss: result.energyLoss,
                leakCost: result.leakCost,
            };
        } finally {
            result.delete();
            instance.delete();
        }
    }

}