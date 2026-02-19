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
        let defaultDataInstance = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
        let lightingFixtureData = defaultDataInstance.getLightingData();

        let LightingFixtureCategories: Array<LightingFixtureCategory> = [
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
        defaultDataInstance.delete();
        this.buildLightingList(lightingFixtureData, LightingFixtureCategories);

        return LightingFixtureCategories;
    }   

    buildLightingList(wasmLightingSystems, lightingFixtureCategories: Array<LightingFixtureCategory> ) {
        for (let i = 0; i < wasmLightingSystems.size(); i++) {
            let wasmClass = wasmLightingSystems.get(i);

            let lightingSystem: LightingFixtureData = this.getLightingSystemFromWASM(wasmClass);
            let category = lightingFixtureCategories.find(system => system.label === lightingSystem.category);
            if (category) {
                category.fixturesData.push(lightingSystem);
            } else {
                console.error('No matching category found for lighting system:', lightingSystem);
            }
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
    category: string,
    type: string,
    lampsPerFixture: number,
    wattsPerLamp: number,
    lumensPerLamp: number,
    lampLife: number,
    coefficientOfUtilization: number,
    ballastFactor: number,
    lumenDegradationFactor: number
}

export interface LightingFixtureCategory {
    category: number,
    label: string,
    fixturesData: Array<LightingFixtureData>
}
