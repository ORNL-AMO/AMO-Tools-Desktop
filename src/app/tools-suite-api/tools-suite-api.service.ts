import { Injectable } from '@angular/core';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Settings } from '../shared/models/settings';
import { AtmosphereSpecificHeat, FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, WallLossesSurface } from '../shared/models/materials';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { firstValueFrom } from 'rxjs';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { ElectronService } from '../electron/electron.service';

@Injectable({
    providedIn: 'root'
})
export class ToolsSuiteApiService {
    ToolsSuiteModule: any = null;
    constructor(private settingsDbService: SettingsDbService,
        private atmosphereDbService: AtmosphereDbService,
        private flueGasMaterialDbService: FlueGasMaterialDbService,
        private gasLoadMaterialDbService: GasLoadMaterialDbService,
        private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
        private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
        private solidLoadMaterialDbService: SolidLoadMaterialDbService,
        private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
        private electronService: ElectronService
    ) { }

    async initializeModule(): Promise<any> {
        // Dynamically import the Emscripten modularized JS glue code
        const moduleFactory = await import('measur-tools-suite/bin/client.js');
        // Initialize the module, specifying where to find the WASM file
        this.ToolsSuiteModule = await moduleFactory.default({
            locateFile: (path: string) => {
                if (this.electronService.isElectron) {
                    return `${path}`
                } else {
                    return `/${path}`
                }
            }
        });
        console.log('=== Tools Suite Module initialized ===');
        return;
    }

    async initializeDefaultDbData() {
        let globalSettings: Settings = this.settingsDbService.globalSettings;
        if (!globalSettings.suiteDbItemsInitialized) {
            console.log('==== Initializing default database items');
            // Initialize default data here
            await this.insertAtmosphereData();
            await this.insertFlueGasMaterials();
            await this.insertGasLoadMaterials();
            await this.insertLiquidLoadMaterials();
            await this.insertSolidLiquidFlueGasMaterials();
            await this.insertSolidLoadMaterials();
            await this.insertWallLossSurfaces();
            globalSettings.suiteDbItemsInitialized = true;
            this.settingsDbService.globalSettings = await firstValueFrom(this.settingsDbService.updateWithObservable(globalSettings));
            let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
            this.settingsDbService.setAll(updatedSettings);
        }
    }

    private async insertAtmosphereData() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultGasTypes();
        let defaultMaterials: Array<AtmosphereSpecificHeat> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: wasmClass.gasDescription,
                specificHeat: wasmClass.specificHeat,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await firstValueFrom(this.atmosphereDbService.insertDefaultMaterials(defaultMaterials));
    }

    private async insertFlueGasMaterials() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultGasFlueGasMaterials();
        let defaultMaterials: Array<FlueGasMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let material = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: material.substance,
                C2H6: material.C2H6,
                C3H8: material.C3H8,
                C4H10_CnH2n: material.C4H10_CnH2n,
                CH4: material.CH4,
                CO: material.CO,
                CO2: material.CO2,
                H2: material.H2,
                H2O: material.H2O,
                N2: material.N2,
                O2: material.O2,
                SO2: material.SO2,
                heatingValue: material.heatingValue,
                heatingValueVolume: material.heatingValueVolume,
                specificGravity: material.specificGravity,
                isDefault: true
            });
        }
        await this.flueGasMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertGasLoadMaterials() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultGasLoadChargeMaterials();
        let defaultMaterials: Array<GasLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let material = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                specificHeatVapor: material.specificHeatVapor,
                substance: material.substance,
                isDefault: true
            });
        }
        await this.gasLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertLiquidLoadMaterials() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultLiquidLoadChargeMaterials();
        let defaultMaterials: Array<LiquidLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let material = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: material.latentHeat,
                specificHeatLiquid: material.specificHeatLiquid,
                specificHeatVapor: material.specificHeatVapor,
                vaporizationTemperature: material.vaporizationTemperature,
                substance: material.substance,
                isDefault: true
            });
        }
        await this.liquidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLiquidFlueGasMaterials() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultSolidLiquidFlueGasMaterials();
        let defaultMaterials: Array<SolidLiquidFlueGasMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let material = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: material.substance,
                carbon: material.carbon,
                hydrogen: material.hydrogen,
                inertAsh: material.inertAsh,
                moisture: material.moisture,
                nitrogen: material.nitrogen,
                o2: material.oxygen,
                sulphur: material.sulphur,
                heatingValue: this.ToolsSuiteModule.calculateHeatingValueFuel(material.carbon, material.hydrogen, material.sulphur, material.inertAsh, material.oxygen, material.moisture, material.nitrogen),
                isDefault: true
            });
        }
        await this.solidLiquidMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLoadMaterials() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultSolidLoadChargeMaterials();

        let defaultMaterials: Array<SolidLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let material = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: material.latentHeat,
                meltingPoint: material.meltingPoint,
                specificHeatLiquid: material.specificHeatLiquid,
                specificHeatSolid: material.specificHeatSolid,
                substance: material.substance,
                isDefault: true
            });
        }
        await this.solidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertWallLossSurfaces() {
        let suiteDefaultMaterials = this.ToolsSuiteModule.getDefaultWallTypes();
        let defaultMaterials: Array<WallLossesSurface> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let shapeFactor = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                surface: shapeFactor.wallDescription,
                conditionFactor: shapeFactor.shapeFactor,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await this.wallLossesSurfaceDbService.insertDefaultMaterials(defaultMaterials);
    }

    //quick test module works
    // private testModule() {
    //     var inletTemperature = 100.0
    //     var outletTemperature = 1400.0;
    //     var flowRate = 1200.0;
    //     var correctionFactor = 1.0;
    //     var specificHeat = 0.02;

    //     let atmosphere = new this.ToolsSuiteModule.Atmosphere(inletTemperature, outletTemperature, flowRate, correctionFactor, specificHeat);
    //     let heatLoss = atmosphere.getTotalHeat();
    // }
}