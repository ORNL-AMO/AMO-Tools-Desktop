import { Injectable } from '@angular/core';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable({
    providedIn: 'root'
})
export class LightingSuiteApiService {
    constructor(
        private toolsSuiteApiService: ToolsSuiteApiService,
    ) { }

    getLightingSystems() {
        let DefaultDataInstance = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
        let lightingFixtureData = DefaultDataInstance.getLightingData();
        let lightingSystems: Array<LightingFixtureData> = [];

        this.buildLightingList(lightingFixtureData, lightingSystems);

        LightingFixtureCategories.forEach(category => {
            const categoryFixtures = lightingSystems.filter(fixture => fixture.category === category.category);
            category.fixturesData.push(...categoryFixtures);
        });

        DefaultDataInstance.delete();
        return LightingFixtureCategories;
    }

    buildLightingList(wasmLightingSystems, lightingSystems: Array<LightingFixtureData>) {
        for (let i = 0; i < wasmLightingSystems.size(); i++) {
            let wasmClass = wasmLightingSystems.get(i);

            let lightingSystem: LightingFixtureData = this.getLightingSystemFromWASM(wasmClass);
            lightingSystems.push(lightingSystem);
            wasmClass.delete();
        }
    }

    getLightingSystemFromWASM(suiteDbLightingPointer): LightingFixtureData {
        let lightingSystem: LightingFixtureData = {
            category: suiteDbLightingPointer.category(),
            type: suiteDbLightingPointer.type(),
            lampsPerFixture: suiteDbLightingPointer.lampsPerFixture(),
            wattsPerLamp: suiteDbLightingPointer.lampWattage(),
            lumensPerLamp: suiteDbLightingPointer.lampOutput(),
            lampLife: suiteDbLightingPointer.lampLife(),
            coefficientOfUtilization: suiteDbLightingPointer.coefficientOfUtilization(),
            ballastFactor: suiteDbLightingPointer.ballastFactor(),
            lumenDegradationFactor: suiteDbLightingPointer.lumenDegradationFactor()
        };
        return lightingSystem;
    }
}

export interface LightingFixtureData {
    category: number,
    type: string,
    lampsPerFixture: number,
    wattsPerLamp: number,
    lumensPerLamp: number,
    lampLife: number,
    coefficientOfUtilization: number,
    ballastFactor: number,
    lumenDegradationFactor: number
}


export const LightingFixtureCategories: Array<{ category: number, label: string, fixturesData: Array<LightingFixtureData> }> = [
    {
        category: 0,
        label: 'Custom',
        fixturesData: []
    },
    {
        category: 1,
        label: 'Metal Halide',
        fixturesData: []
    },
    {
        category: 2,
        label: 'High Pressure Sodium',
        fixturesData: []
    },
    {
        category: 3,
        label: 'High Bay Fluorescent',
        fixturesData: []
    },
    {
        category: 4,
        label: 'Fluorescent XP Retrofit',
        fixturesData: []
    },
    {
        category: 5,
        label: 'Fluorescent 4 ft',
        fixturesData: []
    },
    {
        category: 6,
        label: 'Fluorescent 8 ft',
        fixturesData: []
    },
    {
        category: 7,
        label: 'Induction High Bay',
        fixturesData: []
    },
    {
        category: 8,
        label: 'Mercury Vapor',
        fixturesData: []
    },
    {
        category: 9,
        label: 'High Bay LED',
        fixturesData: []
    },
    {
        category: 10,
        label: 'LED Troffers',
        fixturesData: []
    }
]