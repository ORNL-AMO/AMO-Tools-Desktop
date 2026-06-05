import { Component, OnInit, Output, EventEmitter, viewChild, ElementRef, inject, Signal, input, effect, computed } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { CompressedAirReductionService } from './compressed-air-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CompressedAirReductionData, CompressedAirReductionResults } from '../../../shared/models/standalone';
import { CompressedAirReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-compressed-air-reduction',
  templateUrl: './compressed-air-reduction.component.html',
  styleUrls: ['./compressed-air-reduction.component.css'],
  standalone: false,
  host: { '(window:resize)': 'onResize($event)' }
})
export class CompressedAirReductionComponent implements OnInit {
  @Output('emitSave')
  emitSave = new EventEmitter<CompressedAirReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();

  // Signal inputs replace @Input() decorators for Angular v20+ reactivity
  inTreasureHunt: Signal<boolean> = input<boolean>(false);
  settings = input<Settings>();
  operatingHours: Signal<OperatingHours> = input<OperatingHours>();

  private settingsDbService: SettingsDbService = inject(SettingsDbService);
  private compressedAirReductionService: CompressedAirReductionService = inject(CompressedAirReductionService);
  private analyticsService: AnalyticsService = inject(AnalyticsService);

  // Derive signal view of service state so templates and effects are reactive
  focusedPanel: Signal<'baseline' | 'modification'> = toSignal(this.compressedAirReductionService.focusedPanel);
  baselineData: Signal<Array<CompressedAirReductionData>> = toSignal(this.compressedAirReductionService.baselineData);
  modificationData: Signal<Array<CompressedAirReductionData>> = toSignal(this.compressedAirReductionService.modificationData);

  // Falls back to global settings when no settings input is provided (standalone usage)
  effectiveSettings = computed(() => this.settings() ?? this.settingsDbService.globalSettings);

  modificationExists: Signal<boolean> = computed(() => this.modificationData().length > 0);

  // Signal-based ViewChild references for resize calculations
  leftPanelHeader = viewChild<ElementRef>('leftPanelHeader');
  contentContainer = viewChild<ElementRef>('contentContainer');
  smallTabSelect = viewChild<ElementRef>('smallTabSelect');

  headerHeight: number;
  containerHeight: number;
  tabSelect: 'results' | 'help' = 'results';
  smallScreenTab: 'baseline' | 'modification' | 'details' = 'baseline';

  constructor() {
    // Initialize baseline with one default item when data is empty and settings are available
    effect(() => {
      const baselineData = this.baselineData();
      const settings = this.effectiveSettings();
      if ((!baselineData || baselineData.length === 0) && settings) {
        // Default utility type is 1 (electricity) to match legacy behavior
        const tmpObj = this.compressedAirReductionService.initObject(0, settings, this.operatingHours(), 1);
        this.compressedAirReductionService.baselineData.next([tmpObj]);
      }
    });

    // Recalculate results reactively whenever baseline, modification, or settings change
    effect(() => {
      const baselineData = this.baselineData();
      const modificationData = this.modificationData();
      const settings = this.effectiveSettings();
      if (baselineData && baselineData.length > 0 && settings) {
        const results: CompressedAirReductionResults = this.compressedAirReductionService.getResults(
          settings,
          baselineData,
          modificationData
        );
        this.compressedAirReductionService.results.next(results);
      }
    });
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-reduction');
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab as 'results' | 'help';
    }
  }

  ngAfterViewInit() {
    setTimeout(() => { this.resizeTabs(); }, 100);
  }

  ngOnDestroy() {
    // Clear service state when used inside treasure hunt so data does not leak between opportunities
    if (this.inTreasureHunt()) {
      this.compressedAirReductionService.baselineData.next([]);
      this.compressedAirReductionService.modificationData.next([]);
    }
  }

  onResize(_event: unknown) {
    setTimeout(() => { this.resizeTabs(); }, 100);
  }

  resizeTabs() {
    const leftPanelHeader = this.leftPanelHeader();
    const contentContainer = this.contentContainer();
    if (leftPanelHeader) {
      this.containerHeight = contentContainer.nativeElement.offsetHeight - leftPanelHeader.nativeElement.offsetHeight;
      const smallTabSelect = this.smallTabSelect();
      if (smallTabSelect?.nativeElement) {
        this.containerHeight = this.containerHeight - smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: 'results' | 'help') {
    this.tabSelect = str;
  }

  setSmallScreenTab(str: 'baseline' | 'modification' | 'details') {
    this.smallScreenTab = str;
  }

  setFocusedPanel(panel: 'baseline' | 'modification') {
    this.compressedAirReductionService.focusedPanel.next(panel);
  }

  // --- Baseline equipment management ---

  addBaselineEquipment() {
    const baselineData = this.baselineData();
    // New equipment inherits the utility type of the first item so all items stay in sync
    const utilityType = baselineData.length > 0 ? baselineData[0].utilityType : 1;
    const tmpObj = this.compressedAirReductionService.initObject(
      baselineData.length, this.effectiveSettings(), this.operatingHours(), utilityType
    );
    this.compressedAirReductionService.baselineData.next([...baselineData, tmpObj]);

    // Keep baseline and modification arrays in 1-1 sync
    const modificationData = this.modificationData();
    if (modificationData.length > 0) {
      const modObj = this.compressedAirReductionService.initObject(
        modificationData.length, this.effectiveSettings(), this.operatingHours(), utilityType
      );
      modObj.isBaseline = false;
      this.compressedAirReductionService.modificationData.next([...modificationData, modObj]);
    }
  }

  removeBaselineEquipment(i: number) {
    const baselineData = this.baselineData();
    baselineData.splice(i, 1);
    this.compressedAirReductionService.baselineData.next([...baselineData]);

    // Remove the paired modification item to maintain 1-1 relationship
    const modificationData = this.modificationData();
    if (modificationData.length > 1 && modificationData[i]) {
      modificationData.splice(i, 1);
      this.compressedAirReductionService.modificationData.next([...modificationData]);
    }
  }

  // --- Modification equipment management ---

  createModification() {
    const baselineData = this.baselineData();
    // Deep-copy baseline so modification starts as an independent snapshot
    const modificationData: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(baselineData));
    modificationData.forEach(item => { item.isBaseline = false; });
    this.compressedAirReductionService.modificationData.next(modificationData);
    this.setFocusedPanel('modification');
  }

  addModificationEquipment() {
    const modificationData = this.modificationData();
    const nextIndex = modificationData.length;
    const baselineData = this.baselineData();

    // Ensure there is a paired baseline item before adding a modification item
    if (!baselineData[nextIndex]) {
      this.addBaselineEquipment();
    }

    const utilityType = baselineData.length > 0 ? baselineData[0].utilityType : 1;
    const tmpObj = this.compressedAirReductionService.initObject(
      nextIndex, this.effectiveSettings(), this.operatingHours(), utilityType
    );
    tmpObj.isBaseline = false;
    // Copy baseline compressor electricity values so the modification starts from the same compressor
    const pairedBaselineIndex = nextIndex > 0 ? nextIndex - 1 : 0;
    tmpObj.compressorElectricityData = { ...baselineData[pairedBaselineIndex].compressorElectricityData };
    this.compressedAirReductionService.modificationData.next([...modificationData, tmpObj]);
  }

  removeModificationEquipment(i: number) {
    const modificationData = this.modificationData();
    modificationData.splice(i, 1);
    this.compressedAirReductionService.modificationData.next([...modificationData]);
  }

  // --- Actions ---

  btnResetData() {
    const settings = this.effectiveSettings();
    const tmpObj = this.compressedAirReductionService.initObject(0, settings, this.operatingHours(), 1);
    this.compressedAirReductionService.baselineData.next([tmpObj]);
    this.compressedAirReductionService.modificationData.next([]);
  }

  generateExample() {
    const settings = this.effectiveSettings();
    const tmpBaselineObj = this.compressedAirReductionService.generateExample(settings, true);
    const tmpModificationObj = this.compressedAirReductionService.generateExample(settings, false);
    this.compressedAirReductionService.baselineData.next([tmpBaselineObj]);
    this.compressedAirReductionService.modificationData.next([tmpModificationObj]);
    this.setFocusedPanel('baseline');
  }

  save() {
    this.emitSave.emit({
      baseline: this.baselineData(),
      modification: this.modificationData(),
      opportunityType: Treasure.compressedAir
    });
  }

  cancel() {
    this.emitCancel.emit(true);
  }
}
