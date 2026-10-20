import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { AltitudeCorrectionService } from '../../utilities/altitude-correction/altitude-correction.service';
import { CompressorReplacementService, CompressorReplacementData, CompressorReplacementResults, CompressorUnits, ScenarioInputErrors, ScenarioInputWarnings } from './compressor-replacement.service';

@Component({
  selector: 'app-compressor-replacement',
  templateUrl: './compressor-replacement.component.html',
  styleUrls: ['./compressor-replacement.component.css'],
  standalone: false
})
export class CompressorReplacementComponent implements OnInit {
  @Input() settings: Settings;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event']) onResize(event) { setTimeout(() => this.resizeTabs(), 100); }

  headerHeight: number; containerHeight: number; currentField: string;
  tabSelect: string = 'results'; smallScreenTab: string = 'baseline';
  baselineSelected: boolean = true; modificationExists: boolean = false;
  baselineData: Array<CompressorReplacementData>; modificationData: Array<CompressorReplacementData>;
  baselineElectricityCost: number = 0; modificationElectricityCost: number = 0;
  baselineAtmosphericPressure: number; baselineTotalAirStorage: number;
  modificationAtmosphericPressure: number; modificationTotalAirStorage: number;
  baselineElevation: number; modificationElevation: number;
  baselineAtmosphericPressureKnown: boolean = true;
  modificationAtmosphericPressureKnown: boolean = true;
  plotRefresh: number = 0;
  results: CompressorReplacementResults;
  baselineErrors: ScenarioInputErrors;
  modificationErrors: ScenarioInputErrors;
  baselineWarnings: ScenarioInputWarnings;
  modificationWarnings: ScenarioInputWarnings;
  baselineRows: Array<CompressorReplacementData>; modificationRows: Array<CompressorReplacementData>;

  constructor(
    private settingsDbService: SettingsDbService,
    private compressorReplacementService: CompressorReplacementService,
    private altitudeCorrectionService: AltitudeCorrectionService,
    private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-CA-compressor-replacement');
    if (!this.settings) { this.settings = this.settingsDbService.globalSettings; }
    this.initData();
    this.getResults();
  }

  ngAfterViewInit(): void { setTimeout(() => this.resizeTabs(), 100); }

  ngOnDestroy(): void {
    const service = this.compressorReplacementService;
    service.baselineData = this.baselineData;
    service.modificationData = this.modificationData;
    service.baselineElectricityCost = this.baselineElectricityCost;
    service.modificationElectricityCost = this.modificationElectricityCost;
    service.baselineAtmosphericPressure = this.baselineAtmosphericPressure;
    service.modificationAtmosphericPressure = this.modificationAtmosphericPressure;
    service.baselineTotalAirStorage = this.baselineTotalAirStorage;
    service.modificationTotalAirStorage = this.modificationTotalAirStorage;
  }

  get units(): CompressorUnits { return this.compressorReplacementService.getUnits(this.settings); }

  get isMetric(): boolean { return this.compressorReplacementService.isMetric(this.settings); }

  get defaultAtmosphericPressure(): number {
    return this.compressorReplacementService.getDefaultAtmosphericPressure(this.settings);
  }

  initData(): void {
    const service = this.compressorReplacementService;
    this.baselineAtmosphericPressure = service.baselineAtmosphericPressure ?? this.defaultAtmosphericPressure;
    this.modificationAtmosphericPressure = service.modificationAtmosphericPressure ?? this.defaultAtmosphericPressure;
    this.baselineTotalAirStorage = service.baselineTotalAirStorage;
    this.modificationTotalAirStorage = service.modificationTotalAirStorage;
    if (service.baselineData) { this.baselineData = service.baselineData; }
    else { this.baselineData = [service.initObject(0, this.settings)]; }
    if (service.modificationData) {
      this.modificationData = service.modificationData;
      this.modificationExists = this.modificationData.length !== 0;
    }
    this.ensureCompressorIds(this.baselineData);
    this.ensureCompressorIds(this.modificationData);
    this.baselineElectricityCost = service.baselineElectricityCost ?? this.settings.electricityCost ?? 0;
    this.modificationElectricityCost = service.modificationElectricityCost ?? this.settings.electricityCost ?? 0;
  }

  resizeTabs(): void {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string): void { this.tabSelect = str; }
  focusField(str: string): void { this.currentField = str; }

  toggleBaselinePressureKnown(): void { this.baselineAtmosphericPressureKnown = !this.baselineAtmosphericPressureKnown; }
  setBaselineAtmosphericPressure(): void {
    const pressure: number = this.altitudeCorrectionService.calculatePressureGivenAltitude(this.baselineElevation, this.settings);
    this.baselineAtmosphericPressure = Number(pressure.toFixed(2));
    this.getResults();
  }
  toggleModificationPressureKnown(): void { this.modificationAtmosphericPressureKnown = !this.modificationAtmosphericPressureKnown; }
  setModificationAtmosphericPressure(): void {
    const pressure: number = this.altitudeCorrectionService.calculatePressureGivenAltitude(this.modificationElevation, this.settings);
    this.modificationAtmosphericPressure = Number(pressure.toFixed(2));
    this.getResults();
  }

  addBaselineCompressor(): void {
    this.baselineData.push(this.compressorReplacementService.initObject(this.baselineData.length, this.settings));
    this.getResults();
  }
  removeBaselineCompressor(index: number): void {
    this.baselineData.splice(index, 1);
    this.clearDanglingLinks();
    this.getResults();
  }

  /**
   * Baseline rows a modification row can take its average power from. Filtered on power-input mode
   * only so options don't disappear while the baseline values are being typed.
   */
  get averagePowerLinkTargets(): Array<CompressorReplacementData> {
    return (this.baselineData || []).filter(data => data.powerInputType === 'averagePower' && !!data.compressorId);
  }

  /** Rows restored from an earlier visit may not have ids yet. */
  private ensureCompressorIds(dataArray: Array<CompressorReplacementData>): void {
    (dataArray || []).forEach(data => {
      if (!data.compressorId) { data.compressorId = this.compressorReplacementService.createCompressorId(); }
    });
  }

  /** Clear links to baseline rows that were deleted. */
  private clearDanglingLinks(): void {
    const availableIds: Array<string> = (this.baselineData || []).map(data => data.compressorId);
    (this.modificationData || []).forEach(data => {
      if (data.linkedCompressorId && availableIds.indexOf(data.linkedCompressorId) < 0) {
        data.linkedCompressorId = '';
      }
    });
  }
  createModification(): void {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    // Copies get their own ids and start unlinked.
    this.modificationData.forEach(data => {
      data.compressorId = this.compressorReplacementService.createCompressorId();
      data.linkedCompressorId = '';
    });
    this.modificationExists = true;
    this.setModificationSelected();
    this.getResults();
  }
  addModificationCompressor(): void {
    this.modificationData.push(this.compressorReplacementService.initObject(this.modificationData.length, this.settings));
    this.getResults();
  }
  removeModificationCompressor(index: number): void {
    this.modificationData.splice(index, 1);
    if (this.modificationData.length === 0) { this.modificationExists = false; }
    this.getResults();
  }

  updateBaselineData(data: CompressorReplacementData, index: number): void {
    this.assignData(this.baselineData[index], data);
    this.getResults();
  }
  updateModificationData(data: CompressorReplacementData, index: number): void {
    this.assignData(this.modificationData[index], data);
    this.getResults();
  }

  /** Copy onto the existing object so the form isn't rebuilt and the input keeps focus. */
  private assignData(target: CompressorReplacementData, source: CompressorReplacementData): void {
    target.compressorId = source.compressorId;
    target.linkedCompressorId = source.linkedCompressorId;
    target.name = source.name;
    target.averageDutyFactor = source.averageDutyFactor;
    target.totalOperatingHours = source.totalOperatingHours;
    target.lookupType = source.lookupType;
    target.ratedCapacity = source.ratedCapacity;
    target.powerInputType = source.powerInputType;
    target.fullLoadPower = source.fullLoadPower;
    target.zeroFlowPower = source.zeroFlowPower;
    target.averagePower = source.averagePower;
    target.searchModelTerm = source.searchModelTerm;
    target.capacityRequirement = source.capacityRequirement;
    target.capacityRange = source.capacityRange;
    target.pressureRequirement = source.pressureRequirement;
    target.pressureRange = source.pressureRange;
    target.vsdOnly = source.vsdOnly;
    target.includeWaterCooled = source.includeWaterCooled;
    target.oilFree = source.oilFree;
    target.brand = source.brand;
    target.selectedManufacturer = source.selectedManufacturer;
    target.selectedModelNumber = source.selectedModelNumber;
    target.maxCapacity = source.maxCapacity;
    target.capacity4 = source.capacity4;
    target.capacity3 = source.capacity3;
    target.capacity2 = source.capacity2;
    target.capacity1 = source.capacity1;
    target.minCapacity = source.minCapacity;
    target.powerAtMaxCapacity = source.powerAtMaxCapacity;
    target.powerAtCapacity4 = source.powerAtCapacity4;
    target.powerAtCapacity3 = source.powerAtCapacity3;
    target.powerAtCapacity2 = source.powerAtCapacity2;
    target.powerAtCapacity1 = source.powerAtCapacity1;
    target.powerAtMinCapacity = source.powerAtMinCapacity;
    target.cagiType = source.cagiType;
    target.numberOfStages = source.numberOfStages;
    target.compressorOilFree = source.compressorOilFree;
    target.fullLoadPressure = source.fullLoadPressure;
    target.maxFullFlowPressure = source.maxFullFlowPressure;
    target.operatingPressure = source.operatingPressure;
    target.controlType = source.controlType;
    target.blowdownTime = source.blowdownTime;
    target.unloadSumpPressure = source.unloadSumpPressure;
    target.unloadPointCapacity = source.unloadPointCapacity;
    target.noLoadPowerFM = source.noLoadPowerFM;
    target.turndownRung = source.turndownRung;
    target.midTurndownRung = source.midTurndownRung;
    target.turndownCapacity = source.turndownCapacity;
    target.turndownPower = source.turndownPower;
    target.midTurndownCapacity = source.midTurndownCapacity;
    target.midTurndownPower = source.midTurndownPower;
  }

  getResults(): void {
    const service = this.compressorReplacementService;
    this.baselineErrors = service.checkScenarioErrors(this.baselineElectricityCost, this.baselineAtmosphericPressure, this.baselineTotalAirStorage);
    this.modificationErrors = service.checkScenarioErrors(this.modificationElectricityCost, this.modificationAtmosphericPressure, this.modificationTotalAirStorage);
    this.baselineWarnings = service.checkScenarioWarnings(this.baselineAtmosphericPressure, this.settings);
    this.modificationWarnings = service.checkScenarioWarnings(this.modificationAtmosphericPressure, this.settings);
    const output = service.getResults(
      this.baselineData, this.modificationData,
      this.baselineElectricityCost, this.modificationElectricityCost,
      this.baselineAtmosphericPressure, this.modificationAtmosphericPressure, this.settings);
    this.results = output.results;
    this.baselineRows = output.baselineRows;
    this.modificationRows = output.modificationRows;
    this.plotRefresh++;
  }

  btnResetData(): void {
    this.baselineData = [this.compressorReplacementService.initObject(0, this.settings)];
    this.modificationData = [];
    this.modificationExists = false;
    this.getResults();
  }

  btnGenerateExample(): void {
    this.baselineData = [this.compressorReplacementService.generateExample(this.settings)];
    this.modificationData = [this.compressorReplacementService.generateExample(this.settings)];
    this.modificationData[0].fullLoadPower = 165;
    this.modificationExists = true;
    this.baselineElectricityCost = 0.066;
    this.modificationElectricityCost = 0.066;
    this.getResults();
  }

  setBaselineSelected(): void { this.baselineSelected = true; }
  setModificationSelected(): void { this.baselineSelected = false; }
  setSmallScreenTab(selectedTab: string): void {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') { this.baselineSelected = true; }
    else if (this.smallScreenTab === 'modification') { this.baselineSelected = false; }
  }
}
