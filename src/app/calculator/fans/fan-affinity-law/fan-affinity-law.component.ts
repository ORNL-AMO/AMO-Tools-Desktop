import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FanAffinityLawService } from './fan-affinity-law.service';
import { FanAffinityLawsInput, FanAffinityLawsOutput } from '../../../shared/models/standalone';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { FanAffinityLawTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

@Component({
    selector: 'app-fan-affinity-law',
    templateUrl: './fan-affinity-law.component.html',
    styleUrls: ['./fan-affinity-law.component.css'],
    standalone: false
})
export class FanAffinityLawComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FanAffinityLawTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;

  smallScreenTab: string = 'form';

  fanAffinityLawForm: UntypedFormGroup;
  fanAffinityLawResults: FanAffinityLawsOutput;

  assessmentCalculator: Calculator;

  constructor(private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService,
    private fanAffinityLawService: FanAffinityLawService, private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-FAN-affinity-law');
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
      this.initForm();
      this.getResults();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.fanAffinityLawService.fanAffinityLawInputs = this.fanAffinityLawService.getObjFromForm(this.fanAffinityLawForm);
    } else {
      this.fanAffinityLawService.fanAffinityLawInputs = undefined;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  initForm() {
    if (this.fanAffinityLawService.fanAffinityLawInputs) {
      this.fanAffinityLawForm = this.fanAffinityLawService.getFormFromObj(this.fanAffinityLawService.fanAffinityLawInputs);
    } else {
      this.fanAffinityLawForm = this.fanAffinityLawService.getFormFromObj(this.fanAffinityLawService.initObject(this.settings));
    }
    // console.log(this.fanAffinityLawService.fanAffinityLawInputs);
  }

  async getResults() {
    let inputs: FanAffinityLawsInput = this.fanAffinityLawService.getObjFromForm(this.fanAffinityLawForm);
    if (this.fanAffinityLawForm.valid) {
      this.fanAffinityLawResults = this.fanAffinityLawService.getResults(inputs, this.settings, this.modificationExists);
    } else {
      this.fanAffinityLawResults = { annualEnergyBaseline: 0, annualEnergyNew: 0, annualCostSavings: 0 };
    }
    if (this.assessmentCalculator) {
      this.assessmentCalculator.affinityLawInputs = inputs;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.affinityLawInputs) {
        this.fanAffinityLawForm = this.fanAffinityLawService.getFormFromObj(this.assessmentCalculator.affinityLawInputs);
      } else {
        this.initForm();
        this.assessmentCalculator.affinityLawInputs = this.fanAffinityLawService.getObjFromForm(this.fanAffinityLawForm);
      }
      this.getResults();
    } else {
      this.initForm();
      this.assessmentCalculator = {
        assessmentId: this.assessment.id,
        affinityLawInputs: this.fanAffinityLawService.getObjFromForm(this.fanAffinityLawForm)
      };
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  btnResetData() {
    this.fanAffinityLawForm = this.fanAffinityLawService.getFormFromObj(this.fanAffinityLawService.initObject(this.settings));
    this.modificationExists = false;
    this.getResults();
  }

  btnGenerateExample() {
    this.fanAffinityLawForm = this.fanAffinityLawService.getFormFromObj(this.fanAffinityLawService.generateExample(this.settings));
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
    this.getResults();
  }

  createModification() {
    this.modificationExists = true;
    this.getResults();
    this.setModificationSelected();
  }

    // New Fan Diameter must exceed the baseline Fan Diameter; that threshold moves whenever
  // Fan Diameter changes, and the validator itself is only (re)applied when Change Fan Size
  // is toggled, so both need to refresh validators before recalculating.
  refreshValidators() {
    this.fanAffinityLawService.setValidators(this.fanAffinityLawForm);
    this.getResults();
  }

  save() {
    this.emitSave.emit({
      inputData: this.fanAffinityLawService.getObjFromForm(this.fanAffinityLawForm),
      opportunityType: Treasure.fanAffinityLaw,
    });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
      this.modifiedSelected = true;
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
