import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { MockPhast, MockPhastSettings } from '../examples/mockPhast';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from '../examples/mockPsat';
import { MockFsat, MockFsatSettings, MockFsatCalculator } from '../examples/mockFsat';
import { MockSsmt, MockSsmtSettings } from '../examples/mockSsmt';
import { MockTreasureHunt, MockTreasureHuntSettings } from '../examples/mockTreasureHunt';
import { MockMotorInventory } from '../examples/mockMotorInventoryData';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, ObservableInput } from 'rxjs';
import { MockWasteWater, MockWasteWaterSettings } from '../examples/mockWasteWater';
import { MockCompressedAirAssessment, MockCompressedAirAssessmentSettings } from '../examples/mockCompressedAirAssessment';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { Assessment } from '../shared/models/assessment';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { ElectronService } from '../electron/electron.service';
import { MockPumpInventory } from '../examples/mockPumpInventoryData';
import { MockWaterAssessment, MockWaterAssessmentSettings } from '../examples/mockWaterAssessment';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { MockWaterdiagram } from '../examples/mockWaterDiagram';
import { Diagram } from '../shared/models/diagram';
import { ApplicationInstanceDbService, ApplicationInstanceData } from '../indexedDb/application-instance-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
@Injectable()
export class CoreService {


  exampleDirectoryId: number;
  examplePhastId: number;
  examplePsatId: number;
  exampleFsatId: number;
  exampleSsmtId: number;
  exampleWasteWaterId: number;
  exampleTreasureHuntId: number;
  exampleMotorInventoryId: number;
  examplePumpInventoryId: number;
  exampleCompressedAirAssessmentId: number;
  exampleWaterAssessmentId: number;
  exampleWaterDiagramId: number;

  showShareDataModal: BehaviorSubject<boolean>;
  constructor(
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService,
    private inventoryDbService: InventoryDbService,
    private electronService: ElectronService,
    private diagramIdbService: DiagramIdbService,
    private applicationDataService: ApplicationInstanceDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private directoryDbService: DirectoryDbService,
    private atmosphereDbService: AtmosphereDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private gasLoadMaterialDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService) {
    this.showShareDataModal = new BehaviorSubject<boolean>(false);
  }

  getDefaultSettingsObject(): Settings {
    let defaultSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
    defaultSettings.directoryId = 1;
    delete defaultSettings.facilityInfo;
    return defaultSettings;
  }

  relaunchApp() {
    this.electronService.sendAppRelaunch();
  }

  getAllAppData() {
    let initializedAppData = {
      directories: this.directoryDbService.getAllDirectories(),
      assessments: this.assessmentDbService.getAllAssessments(),
      diagrams: this.diagramIdbService.getAllDiagrams(),
      settings: this.settingsDbService.getAllSettings(),
      calculators: this.calculatorDbService.getAllCalculators(),
      inventoryItems: this.inventoryDbService.getAllInventory(),
    };
    return forkJoin(initializedAppData);
  }

  async setNewApplicationInstanceData() {
    let newInstanceData: ApplicationInstanceData = {
      dataBackupFilePath: undefined,
      createVersionedBackups: false,
      isSurveyToastDone: false,
      isSurveyDone: false,
      subscriberId: undefined,
      isAutomaticBackupOn: false,
      doSurveyReminder: false,
      appOpenCount: 0,
      createdDate: new Date(),
      modifiedDate: new Date(),
    };
    let applicationInstanceData = await firstValueFrom(this.applicationDataService.addWithObservable(newInstanceData));
    this.applicationDataService.applicationInstanceData.next(applicationInstanceData);
  }

  async setApplicationInstanceData() {
    let existingApplicationData: Array<ApplicationInstanceData> = await firstValueFrom(this.applicationDataService.getApplicationInstanceData());
    if (existingApplicationData.length === 0) {
      await this.setNewApplicationInstanceData();
    } else {
      if (existingApplicationData[0].appOpenCount === undefined) {
        existingApplicationData[0].appOpenCount = 0;
      }
      existingApplicationData[0].appOpenCount++;
      await firstValueFrom(this.applicationDataService.updateWithObservable(existingApplicationData[0]));
      this.applicationDataService.applicationInstanceData.next(existingApplicationData[0]);
    }
  }

  async createDefaultDirectories() {
    let allAssessmentsDir: Directory = {
      name: 'All Assessments',
      createdDate: new Date(),
      modifiedDate: new Date(),
      parentDirectoryId: null,
    };
    let allDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(allAssessmentsDir));
    let exampleAssessmentsDir: Directory = {
      name: 'Examples',
      createdDate: new Date(),
      modifiedDate: new Date(),
      parentDirectoryId: allDirectory.id,
      isExample: true
    };
    let exampleDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(exampleAssessmentsDir));
    this.exampleDirectoryId = exampleDirectory.id;
  }

  async createExamples() {
    MockPhast.directoryId = this.exampleDirectoryId;
    MockPsat.directoryId = this.exampleDirectoryId;
    MockFsat.directoryId = this.exampleDirectoryId;
    MockSsmt.directoryId = this.exampleDirectoryId;
    MockTreasureHunt.directoryId = this.exampleDirectoryId;
    MockMotorInventory.directoryId = this.exampleDirectoryId;
    MockPumpInventory.directoryId = this.exampleDirectoryId;
    MockWasteWater.directoryId = this.exampleDirectoryId;
    MockCompressedAirAssessment.directoryId = this.exampleDirectoryId;
    MockWaterAssessment.directoryId = this.exampleDirectoryId;
    MockWaterdiagram.directoryId = this.exampleDirectoryId;

    let examplePhast: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPhast));
    let exampleSsmt: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockSsmt));
    let exampleTreasureHunt: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockTreasureHunt));
    let exampleMotorInventory: Assessment = await firstValueFrom(this.inventoryDbService.addWithObservable(MockMotorInventory));
    let examplePumpInventory: Assessment = await firstValueFrom(this.inventoryDbService.addWithObservable(MockPumpInventory));
    let exampleWasteWater: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockWasteWater));
    let exampleCompressedAirAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockCompressedAirAssessment));
    let examplePsat: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPsat));
    let exampleFsat: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockFsat));

    let exampleWaterDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(MockWaterdiagram));
    MockWaterAssessment.diagramId = exampleWaterDiagram.id;
    let exampleWaterAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockWaterAssessment));
    exampleWaterDiagram.assessmentId = exampleWaterAssessment.id;
    await firstValueFrom(this.diagramIdbService.updateWithObservable(exampleWaterDiagram));


    this.examplePhastId = examplePhast.id;
    this.exampleSsmtId = exampleSsmt.id;
    this.exampleTreasureHuntId = exampleTreasureHunt.id;
    this.exampleMotorInventoryId = exampleMotorInventory.id;
    this.examplePumpInventoryId = examplePumpInventory.id;
    this.exampleWasteWaterId = exampleWasteWater.id;
    this.exampleCompressedAirAssessmentId = exampleCompressedAirAssessment.id;
    this.exampleWaterAssessmentId = exampleWaterAssessment.id;
    this.exampleWaterDiagramId = exampleWaterDiagram.id;
    this.examplePsatId = examplePsat.id;
    this.exampleFsatId = exampleFsat.id

    MockPsatCalculator.assessmentId = this.examplePsatId;
    await firstValueFrom(this.calculatorDbService.addWithObservable(MockPsatCalculator));

    MockFsatCalculator.assessmentId = this.exampleFsatId;
    await firstValueFrom(this.calculatorDbService.addWithObservable(MockFsatCalculator));
  }

  async createDefaultProcessHeatingMaterials(): Promise<void> {
    await firstValueFrom(this.wallLossesSurfaceDbService.insertDefaultMaterials());
    await firstValueFrom(this.atmosphereDbService.insertDefaultMaterials());
    await firstValueFrom(this.solidLoadMaterialDbService.insertDefaultMaterials());
    await firstValueFrom(this.gasLoadMaterialDbService.insertDefaultMaterials());
    await firstValueFrom(this.liquidLoadMaterialDbService.insertDefaultMaterials());
    await firstValueFrom(this.flueGasMaterialDbService.insertDefaultMaterials());
    return Promise.resolve();
  }

  async createDirectorySettings() {
    // Add settings for 'All Assessments'
    let defaultSettings: Settings = this.getDefaultSettingsObject();
    await firstValueFrom(this.settingsDbService.addWithObservable(defaultSettings));

    // check default settings dir id
    // Add settings for 'Examples'
    MockPhastSettings.facilityInfo.date = new Date().toDateString();
    MockPhastSettings.directoryId = this.exampleDirectoryId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPhastSettings));

    // Add settings for PHAST
    delete MockPhastSettings.directoryId;
    MockPhastSettings.assessmentId = this.examplePhastId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPhastSettings));

    MockPsatSettings.assessmentId = this.examplePsatId;
    MockPsatSettings.facilityInfo.date = new Date().toDateString();
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));

    MockFsatSettings.assessmentId = this.exampleFsatId;
    MockFsatSettings.facilityInfo.date = new Date().toDateString();
    await firstValueFrom(this.settingsDbService.addWithObservable(MockFsatSettings));

    // No facility date?
    MockSsmtSettings.assessmentId = this.exampleSsmtId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockSsmtSettings));

    MockTreasureHuntSettings.assessmentId = this.exampleTreasureHuntId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockTreasureHuntSettings));

    delete MockPsatSettings.assessmentId;
    MockPsatSettings.inventoryId = this.exampleMotorInventoryId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));

    MockPsatSettings.inventoryId = this.examplePumpInventoryId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));

    MockWasteWaterSettings.assessmentId = this.exampleWasteWaterId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockWasteWaterSettings));

    MockCompressedAirAssessmentSettings.assessmentId = this.exampleCompressedAirAssessmentId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockCompressedAirAssessmentSettings));

    MockWaterAssessmentSettings.assessmentId = this.exampleWaterAssessmentId;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockWaterAssessmentSettings));
  }
}