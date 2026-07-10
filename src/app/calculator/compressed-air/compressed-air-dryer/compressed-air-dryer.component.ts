import {
  Component, OnInit, OnDestroy, AfterViewInit,
  Input, Output, EventEmitter,
  ViewChild, ElementRef, HostListener,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { DryerOperatingCostInput, DryerOperatingCostOutput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { CompressedAirDryerService } from './compressed-air-dryer.service';

@Component({
  selector: 'app-compressed-air-dryer',
  templateUrl: './compressed-air-dryer.component.html',
  styleUrl: './compressed-air-dryer.component.css',
  standalone: false,
})
export class CompressedAirDryerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() inTreasureHunt: boolean;
  @Input() settings: Settings;
  @Input() operatingHours: OperatingHours;
  @Input() assessment: Assessment;
  @Output('emitSave') emitSave = new EventEmitter<DryerOperatingCostInput>();
  @Output('emitCancel') emitCancel = new EventEmitter<boolean>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => this.resizeTabs(), 100);
  }

  baselineForm: UntypedFormGroup;
  baselineInput: DryerOperatingCostInput;
  baselineOutput: DryerOperatingCostOutput;

  modificationForm: UntypedFormGroup;
  modificationInput: DryerOperatingCostInput;
  modificationOutput: DryerOperatingCostOutput;

  modificationExists: boolean = false;
  baselineSelected: boolean = true;

  tabSelect: string = 'results';
  currentField: string;
  smallScreenTab: string = 'baseline';
  headerHeight: number;
  containerHeight: number;

  private assessmentCalculator: Calculator | undefined;

  constructor(
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private analyticsService: AnalyticsService,
    private compressedAirDryerService: CompressedAirDryerService,
  ) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-CA-dryer');
    this.calculatorDbService.isSaving = false;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.assessment) {
      this.getCalculatorForAssessment();
    } else {
      this.initData();
      this.getResults();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeTabs(), 100);
  }

  ngOnDestroy(): void {
    if (!this.inTreasureHunt) {
      this.compressedAirDryerService.baselineInput = this.baselineInput;
      this.compressedAirDryerService.modificationInput = this.modificationExists ? this.modificationInput : undefined;
    } else {
      this.compressedAirDryerService.baselineInput = undefined;
      this.compressedAirDryerService.modificationInput = undefined;
    }
  }

  initData(): void {
    this.compressedAirDryerService.convertStoredInputsForUnitChange(this.settings);

    this.baselineInput = this.compressedAirDryerService.baselineInput ?? this.compressedAirDryerService.initObject(this.settings);
    this.baselineForm = this.compressedAirDryerService.getFormFromObj(this.baselineInput, this.settings);

    if (this.compressedAirDryerService.modificationInput) {
      this.modificationInput = this.compressedAirDryerService.modificationInput;
      this.modificationForm = this.compressedAirDryerService.getFormFromObj(this.modificationInput, this.settings);
      this.modificationExists = true;
    }

    this.compressedAirDryerService.lastUnitsOfMeasure = this.settings.unitsOfMeasure;
  }

  getResults(): void {
    this.baselineInput = this.compressedAirDryerService.getObjFromForm(this.baselineForm);
    this.baselineOutput = this.compressedAirDryerService.calculate(this.baselineInput, this.settings);
    if (this.modificationExists) {
      this.modificationInput = this.compressedAirDryerService.getObjFromForm(this.modificationForm);
      this.modificationOutput = this.compressedAirDryerService.calculate(this.modificationInput, this.settings);
    }
    if (this.assessmentCalculator) {
      this.setAssessmentCalculatorData();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  createModification(): void {
    this.modificationInput = JSON.parse(JSON.stringify(this.baselineInput));
    this.modificationForm = this.compressedAirDryerService.getFormFromObj(this.modificationInput, this.settings);
    this.modificationExists = true;
    this.baselineSelected = false;
    this.getResults();
  }

  async getCalculatorForAssessment(): Promise<void> {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.dryerOperatingCost) {
        this.compressedAirDryerService.baselineInput = this.assessmentCalculator.dryerOperatingCost.baseline;
        if (this.assessmentCalculator.dryerOperatingCost.modification) {
          this.compressedAirDryerService.modificationInput = this.assessmentCalculator.dryerOperatingCost.modification;
        }
      }
      this.initData();
      this.getResults();
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  setAssessmentCalculatorData(): void {
    this.assessmentCalculator.dryerOperatingCost = {
      baseline: this.baselineInput,
      modification: this.modificationExists ? this.modificationInput : undefined,
    };
  }

  initNewAssessmentCalculator(): Calculator {
    return {
      assessmentId: this.assessment.id,
      dryerOperatingCost: { baseline: this.baselineInput },
    };
  }

  btnResetData(): void {
    this.compressedAirDryerService.baselineInput = undefined;
    this.compressedAirDryerService.modificationInput = undefined;
    this.modificationExists = false;
    this.modificationForm = undefined;
    this.modificationOutput = undefined;
    this.initData();
    this.getResults();
  }

  btnGenerateExample(): void {
    this.baselineInput = this.compressedAirDryerService.generateExample(this.settings);
    this.baselineForm = this.compressedAirDryerService.getFormFromObj(this.baselineInput, this.settings);
    if (this.modificationExists) {
      this.modificationInput = this.compressedAirDryerService.generateExample(this.settings);
      this.modificationForm = this.compressedAirDryerService.getFormFromObj(this.modificationInput, this.settings);
    }
    this.getResults();
  }

  setTab(str: string): void {
    this.tabSelect = str;
  }

  changeField(str: string): void {
    this.currentField = str;
  }

  setBaselineSelected(): void {
    if (!this.baselineSelected) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected(): void {
    if (this.baselineSelected) {
      this.baselineSelected = false;
    }
  }

  setSmallScreenTab(selectedTab: string): void {
    this.smallScreenTab = selectedTab;
    if (selectedTab === 'baseline') {
      this.baselineSelected = true;
    } else if (selectedTab === 'modification') {
      this.baselineSelected = false;
    }
  }

  save(): void {
    this.emitSave.emit(this.baselineInput);
  }

  cancel(): void {
    this.emitCancel.emit(true);
  }

  resizeTabs(): void {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect?.nativeElement) {
        this.containerHeight -= this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }
}
