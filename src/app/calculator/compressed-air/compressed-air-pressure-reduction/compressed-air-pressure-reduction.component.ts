import { Component, OnInit, Input, Output, EventEmitter, viewChild, ElementRef, inject, Signal, input, effect, computed } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { CompressedAirPressureReductionService } from './compressed-air-pressure-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CompressedAirPressureReductionResults, CompressedAirPressureReductionData } from '../../../shared/models/standalone';
import { CompressedAirPressureReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-compressed-air-pressure-reduction',
  templateUrl: './compressed-air-pressure-reduction.component.html',
  styleUrls: ['./compressed-air-pressure-reduction.component.css'],
  standalone: false,
  host: { '(window:resize)': 'onResize($event)' }
})
export class CompressedAirPressureReductionComponent implements OnInit {
  @Output('emitSave')
  emitSave = new EventEmitter<CompressedAirPressureReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  inTreasureHunt: Signal<boolean> = input<boolean>(false);
  settings = input<Settings>();
  operatingHours: Signal<OperatingHours> = input<OperatingHours>();
  assessment: Signal<Assessment> = input<Assessment>();


  private settingsDbService: SettingsDbService = inject(SettingsDbService);
  private calculatorDbService: CalculatorDbService = inject(CalculatorDbService);
  private compressedAirPressureReductionService: CompressedAirPressureReductionService = inject(CompressedAirPressureReductionService);
  private analyticsService: AnalyticsService = inject(AnalyticsService);

  focusedPanel: Signal<'baseline' | 'modification'> = toSignal(this.compressedAirPressureReductionService.focusedPanel);
  baselineData: Signal<Array<CompressedAirPressureReductionData>> = toSignal(this.compressedAirPressureReductionService.baselineData);
  modificationData: Signal<Array<CompressedAirPressureReductionData>> = toSignal(this.compressedAirPressureReductionService.modificationData);

  effectiveSettings = computed(() => this.settings() ?? this.settingsDbService.globalSettings);


  leftPanelHeader = viewChild<ElementRef>('leftPanelHeader');
  contentContainer = viewChild<ElementRef>('contentContainer');
  smallTabSelect = viewChild<ElementRef>('smallTabSelect');

  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  containerHeight: number;
  tabSelect: 'results' | 'help' = 'results';
  smallScreenTab: 'baseline' | 'modification' | 'details' = 'baseline';

  modificationExists: Signal<boolean> = computed(() => {
    return this.modificationData().length > 0;
  });

  private assessmentCalculator: Calculator | undefined;

  constructor() {
    //init data logic
    effect(() => {
      const baselineData = this.baselineData();
      const settings = this.effectiveSettings();
      if ((!baselineData || baselineData.length === 0) && settings) {
        let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, settings, true, this.operatingHours());
        this.compressedAirPressureReductionService.baselineData.next([tmpObj]);
      }
    });

    //save logic for assessment
    effect(() => {
      const baselineData = this.baselineData();
      const modificationData = this.modificationData();
      if (this.assessmentCalculator) {
        this.saveAssessmentData(baselineData, modificationData);
      }
    });

    //calculate results
    effect(() => {
      const baselineData = this.baselineData();
      const modificationData = this.modificationData();
      const settings = this.effectiveSettings();
      if (baselineData && settings) {
        console.log('calculate results');
        let results: CompressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(settings, baselineData, modificationData);
        this.compressedAirPressureReductionService.results.next(results);
      }
    });
  }

  private async saveAssessmentData(
    baselineData: Array<CompressedAirPressureReductionData>,
    modificationData: Array<CompressedAirPressureReductionData>
  ): Promise<void> {
    const assessment = this.assessment();
    if (this.assessmentCalculator && assessment) {
      this.assessmentCalculator.compressedAirPressureReduction = { baselineData, modificationData };
      await this.calculatorDbService.saveAssessmentCalculator(assessment, this.assessmentCalculator);
    }
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-pressure-reduction');
    this.calculatorDbService.isSaving = false;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab as 'results' | 'help';
    }
    if (this.assessment()) {
      this.initCalculatorForAssessment();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (this.inTreasureHunt()) {
      this.compressedAirPressureReductionService.baselineData.next(undefined);
      this.compressedAirPressureReductionService.modificationData.next(undefined);
    }
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

  addBaselineEquipment() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(this.baselineData.length, this.effectiveSettings(), true, this.operatingHours());
    let baselineData = this.baselineData();
    baselineData.push(tmpObj);
    this.compressedAirPressureReductionService.baselineData.next(baselineData);
    let modificationData = this.modificationData();
    if (modificationData.length > 0) {
      tmpObj.isBaseline = false;
      modificationData.push(tmpObj);
      this.compressedAirPressureReductionService.modificationData.next(modificationData);
    }
  }

  createModification() {
    const baselineData = this.baselineData();
    let modificationData = this.modificationData();
    modificationData = JSON.parse(JSON.stringify(baselineData));
    modificationData.forEach(modification => {
      modification.isBaseline = false;
    });
    this.compressedAirPressureReductionService.modificationData.next(modificationData);
    this.setFocusedPanel('modification');
  }

  async initCalculatorForAssessment() {
    let assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment().id);
    if (assessmentCalculator) {
      if (assessmentCalculator.compressedAirPressureReduction) {
        if (assessmentCalculator.compressedAirPressureReduction.baselineData) {
          this.compressedAirPressureReductionService.baselineData.next(assessmentCalculator.compressedAirPressureReduction.baselineData);
          if (assessmentCalculator.compressedAirPressureReduction.modificationData) {
            this.compressedAirPressureReductionService.modificationData.next(assessmentCalculator.compressedAirPressureReduction.modificationData);
          }
        }
      } else {
        assessmentCalculator.compressedAirPressureReduction = {
          baselineData: this.baselineData(),
          modificationData: this.modificationData()
        };
      }
    } else {
      assessmentCalculator = {
        assessmentId: this.assessment().id,
        compressedAirPressureReduction: {
          baselineData: this.baselineData(),
          modificationData: this.modificationData(),
        }
      };
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment(), assessmentCalculator);
    }
    this.assessmentCalculator = assessmentCalculator;
  }

  btnResetData() {
    const settings = this.effectiveSettings();
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, settings, true, this.operatingHours());
    this.compressedAirPressureReductionService.baselineData.next([tmpObj]);
    this.compressedAirPressureReductionService.modificationData.next([]);
  }

  generateExample() {
    const settings = this.effectiveSettings();
    let tmpBaselineObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(settings, true);
    this.compressedAirPressureReductionService.baselineData.next([tmpBaselineObj]);
    let tmpModificationData: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(settings, false);
    this.compressedAirPressureReductionService.modificationData.next([tmpModificationData]);
    this.setFocusedPanel('baseline')
  }

  save() {
    this.emitSave.emit({ baseline: this.baselineData(), modification: this.modificationData(), opportunityType: Treasure.compressedAirPressure });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setFocusedPanel(selectedTab: 'baseline' | 'modification') {
    this.compressedAirPressureReductionService.focusedPanel.next(selectedTab);
  }
}
