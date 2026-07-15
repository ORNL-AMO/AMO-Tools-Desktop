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
import createModule, {
    type AtmosphereGasType,
    type AtmosphereGasTypeV,
    type GasFlueGasMaterial as SuiteGasFlueGasMaterial,
    type GasFlueGasMaterialV,
    type GasLoadChargeMaterial as SuiteGasLoadChargeMaterial,
    type GasLoadChargeMaterialV,
    type LiquidLoadChargeMaterial as SuiteLiquidLoadChargeMaterial,
    type LiquidLoadChargeMaterialV,
    type MeasurToolsSuite,
    type SolidLiquidFlueGasMaterial as SuiteSolidLiquidFlueGasMaterial,
    type SolidLiquidFlueGasMaterialV,
    type SolidLoadChargeMaterial as SuiteSolidLoadChargeMaterial,
    type SolidLoadChargeMaterialV,
    type WallType,
    type WallTypeV,
} from 'measur-tools-suite';

@Injectable({
    providedIn: 'root'
})
export class ToolsSuiteApiService {
    ToolsSuiteModule: MeasurToolsSuite = null;
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

    async initializeModule(): Promise<void> {
        this.ToolsSuiteModule = await createModule({
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

    async initializeDefaultDbData(): Promise<void> {
        let globalSettings: Settings = this.settingsDbService.globalSettings;
        // suiteDbItemsInitialized - flag is just continuing to support current app init logic - settings doesn't really need to be coupled to init logic. 
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

    private async insertAtmosphereData(): Promise<void> {
        let suiteDefaultMaterials: AtmosphereGasTypeV = this.ToolsSuiteModule.getDefaultGasTypes();
        let defaultMaterials: Array<AtmosphereSpecificHeat> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            let wasmClass: AtmosphereGasType = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                substance: wasmClass.gasDescription,
                specificHeat: wasmClass.specificHeat,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await firstValueFrom(this.atmosphereDbService.insertDefaultMaterials(defaultMaterials));
    }

    private async insertFlueGasMaterials(): Promise<void> {
        let suiteDefaultMaterials: GasFlueGasMaterialV = this.ToolsSuiteModule.getDefaultGasFlueGasMaterials();
        let defaultMaterials: Array<FlueGasMaterial> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let material: SuiteGasFlueGasMaterial = suiteDefaultMaterials.get(i);
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
        suiteDefaultMaterials.delete();
        await this.flueGasMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertGasLoadMaterials(): Promise<void> {
        let suiteDefaultMaterials: GasLoadChargeMaterialV = this.ToolsSuiteModule.getDefaultGasLoadChargeMaterials();
        let defaultMaterials: Array<GasLoadChargeMaterial> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            let material: SuiteGasLoadChargeMaterial = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                specificHeatVapor: material.specificHeatVapor,
                substance: material.substance,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await this.gasLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertLiquidLoadMaterials(): Promise<void> {
        let suiteDefaultMaterials: LiquidLoadChargeMaterialV = this.ToolsSuiteModule.getDefaultLiquidLoadChargeMaterials();
        let defaultMaterials: Array<LiquidLoadChargeMaterial> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            let material: SuiteLiquidLoadChargeMaterial = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: material.latentHeat,
                specificHeatLiquid: material.specificHeat,
                specificHeatVapor: material.vaporSpecificHeat,
                vaporizationTemperature: material.boilingPoint,
                substance: material.substance,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await this.liquidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLiquidFlueGasMaterials(): Promise<void> {
        let suiteDefaultMaterials: SolidLiquidFlueGasMaterialV = this.ToolsSuiteModule.getDefaultSolidLiquidFlueGasMaterials();
        let defaultMaterials: Array<SolidLiquidFlueGasMaterial> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            //GasComposition
            let material: SuiteSolidLiquidFlueGasMaterial = suiteDefaultMaterials.get(i);
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
        suiteDefaultMaterials.delete();
        await this.solidLiquidMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertSolidLoadMaterials(): Promise<void> {
        let suiteDefaultMaterials: SolidLoadChargeMaterialV = this.ToolsSuiteModule.getDefaultSolidLoadChargeMaterials();

        let defaultMaterials: Array<SolidLoadChargeMaterial> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            let material: SuiteSolidLoadChargeMaterial = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                latentHeat: material.latentHeat,
                meltingPoint: material.meltingPoint,
                specificHeatLiquid: material.specificHeatLiquid,
                specificHeatSolid: material.specificHeatSolid,
                substance: material.substance,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await this.solidLoadMaterialDbService.insertDefaultMaterials(defaultMaterials);
    }

    private async insertWallLossSurfaces(): Promise<void> {
        let suiteDefaultMaterials: WallTypeV = this.ToolsSuiteModule.getDefaultWallTypes();
        let defaultMaterials: Array<WallLossesSurface> = [];
        for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
            let shapeFactor: WallType = suiteDefaultMaterials.get(i);
            defaultMaterials.push({
                surface: shapeFactor.wallDescription,
                conditionFactor: shapeFactor.shapeFactor,
                isDefault: true
            });
        }
        suiteDefaultMaterials.delete();
        await this.wallLossesSurfaceDbService.insertDefaultMaterials(defaultMaterials);
    }
}
