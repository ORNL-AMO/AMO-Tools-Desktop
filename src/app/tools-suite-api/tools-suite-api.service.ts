import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ToolsSuiteApiService {
    ToolsSuiteModule: any = null;
    constructor() { }

    async initializeModule(): Promise<any> {
        // Dynamically import the Emscripten modularized JS glue code
        const moduleFactory = await import('measur-tools-suite/bin/client.js');
        // Initialize the module, specifying where to find the WASM file
        this.ToolsSuiteModule = await moduleFactory.default({
            locateFile: (path: string) => `/${path}`
        });
        console.log('=== Tools Suite Module initialized');
        // var inletTemperature = 100.0
        // var outletTemperature = 1400.0;
        // var flowRate = 1200.0;
        // var correctionFactor = 1.0;
        // var specificHeat = 0.02;

        // let atmosphere = new this.ToolsSuiteModule.Atmosphere(inletTemperature, outletTemperature, flowRate, correctionFactor, specificHeat);
        // let heatLoss = atmosphere.getTotalHeat();
        return;
    }
}