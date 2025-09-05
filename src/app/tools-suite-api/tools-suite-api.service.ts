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
        console.log('=== Tools Suite Module initialized');
        return;
    }

    async initializeDefaultDbData() {
        let globalSettings: Settings = this.settingsDbService.globalSettings;
        if (!globalSettings.suiteDbItemsInitialized) {
            console.log('==== Initializing default database items');
            // Initialize default data here
            let DefaultData = new this.ToolsSuiteModule.DefaultData();
            await this.insertAtmosphereData(DefaultData);
            await this.insertFlueGasMaterials(DefaultData);
            await this.insertGasLoadMaterials(DefaultData);
            await this.insertLiquidLoadMaterials(DefaultData);
            await this.insertSolidLiquidFlueGasMaterials(DefaultData);
            await this.insertSolidLoadMaterials(DefaultData);
            await this.insertWallLossSurfaces(DefaultData);
            DefaultData.delete();
            globalSettings.suiteDbItemsInitialized = true;
            this.settingsDbService.globalSettings = await firstValueFrom(this.settingsDbService.updateWithObservable(globalSettings));
            let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
            this.settingsDbService.setAll(updatedSettings);
        }
    }

    private async insertAtmosphereData(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getAtmosphereSpecificHeat();
        let defaultMaterials: Array<AtmosphereSpecificHeat> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: wasmClass.getSubstance(),
                specificHeat: wasmClass.getSpecificHeat(),
                isDefault: true
            });
            wasmClass.delete();
        }
        suiteDefaultMaterials.delete();
        await firstValueFrom(this.atmosphereDbService.insertDefaultMaterials(defaultMaterials));
    }

    private async insertFlueGasMaterials(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getGasFlueGasMaterials();
        let defaultMaterials: Array<FlueGasMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: wasmClass.getSubstance(),
                C2H6: wasmClass.getGasByVol("C2H6"),
                C3H8: wasmClass.getGasByVol("C3H8"),
                C4H10_CnH2n: wasmClass.getGasByVol("C4H10_CnH2n"),
                CH4: wasmClass.getGasByVol("CH4"),
                CO: wasmClass.getGasByVol("CO"),
                CO2: wasmClass.getGasByVol("CO2"),
                H2: wasmClass.getGasByVol("H2"),
                H2O: wasmClass.getGasByVol("H2O"),
                N2: wasmClass.getGasByVol("N2"),
                O2: wasmClass.getGasByVol("O2"),
                SO2: wasmClass.getGasByVol("SO2"),
                heatingValue: wasmClass.getHeatingValue(),
                heatingValueVolume: wasmClass.getHeatingValueVolume(),
                specificGravity: wasmClass.getSpecificGravity(),
                isDefault: true
            });
            wasmClass.delete();
        }
        suiteDefaultMaterials.delete();
        await this.flueGasMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertGasLoadMaterials(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getGasLoadChargeMaterials();
        let defaultMaterials: Array<GasLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                specificHeatVapor: wasmClass.getSpecificHeatVapor(),
                substance: wasmClass.getSubstance(),
                isDefault: true
            });
            wasmClass.delete();
        }
        await this.gasLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertLiquidLoadMaterials(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getLiquidLoadChargeMaterials();

        let defaultMaterials: Array<LiquidLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: wasmClass.getLatentHeat(),
                specificHeatLiquid: wasmClass.getSpecificHeatLiquid(),
                specificHeatVapor: wasmClass.getSpecificHeatVapor(),
                vaporizationTemperature: wasmClass.getVaporizingTemperature(),
                substance: wasmClass.getSubstance(),
                isDefault: true
            });
            wasmClass.delete();
        }
        suiteDefaultMaterials.delete();
        await this.liquidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLiquidFlueGasMaterials(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getSolidLiquidFlueGasMaterials();
        let defaultMaterials: Array<SolidLiquidFlueGasMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: wasmClass.getSubstance(),
                carbon: wasmClass.getCarbon(),
                hydrogen: wasmClass.getHydrogen(),
                inertAsh: wasmClass.getInertAsh(),
                moisture: wasmClass.getMoisture(),
                nitrogen: wasmClass.getNitrogen(),
                o2: wasmClass.getO2(),
                sulphur: wasmClass.getSulphur(),
                heatingValue: wasmClass.getHeatingValueFuel(),
                isDefault: true
            });
            wasmClass.delete();
        }
        suiteDefaultMaterials.delete();
        await this.solidLiquidMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLoadMaterials(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getSolidLoadChargeMaterials();

        let defaultMaterials: Array<SolidLoadChargeMaterial> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: wasmClass.getLatentHeat(),
                meltingPoint: wasmClass.getMeltingPoint(),
                specificHeatLiquid: wasmClass.getSpecificHeatLiquid(),
                specificHeatSolid: wasmClass.getSpecificHeatSolid(),
                substance: wasmClass.getSubstance(),
                isDefault: true
            });
            wasmClass.delete();
        }
        suiteDefaultMaterials.delete();
        await this.solidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertWallLossSurfaces(DefaultData: any) {
        let suiteDefaultMaterials = DefaultData.getWallLossesSurface();

        let defaultMaterials: Array<WallLossesSurface> = [];
        for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                surface: wasmClass.surfaceDescription(),
                conditionFactor: wasmClass.shapeFactor(),
                isDefault: true
            });
            wasmClass.delete();
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