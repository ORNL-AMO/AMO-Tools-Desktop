import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, EventEmitter, Output, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AirLeakService } from './air-leak.service';
import { AirLeakSurveyInput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { AirLeakSurveyTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
 
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-air-leak',
    templateUrl: './air-leak.component.html',
    styleUrls: ['./air-leak.component.css'],
    host: { '(window:resize)': 'onResize($event)' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AirLeakComponent implements OnInit, AfterViewInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<AirLeakSurveyTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;
  @Input()
  assessment: Assessment;
  
  currentField: string;

  tabSelect: string = 'results';
  containerHeight: number;
  editMode: boolean = false;
  modificationExists: boolean;

  airLeakInput: AirLeakSurveyInput;

  private destroyRef = inject(DestroyRef);

  saving: boolean;
  assessmentCalculator: Calculator;
  smallScreenTab: string = 'form';

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('panelHeader', { static: false }) panelHeader: ElementRef;
  onResize(event: Event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  constructor(private airLeakService: AirLeakService, private calculatorDbService: CalculatorDbService,
              private settingsDbService: SettingsDbService,
              private analyticsService: AnalyticsService,
              private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.analyticsService.sendEvent('calculator-CA-air-leak');
    this.calculatorDbService.isSaving = false;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.airLeakInput = this.airLeakService.airLeakInput.value;
    if(!this.airLeakInput) {
      this.airLeakService.initDefaultEmptyInputs(this.settings);
    }
    this.initSubscriptions();

    if(this.assessment) {
      this.getCalculatorForAssessment();
    }
  }

  ngOnDestroy() {
    this.airLeakService.currentLeakIndex.next(0);
  }

  initSubscriptions() {
    this.airLeakService.currentField
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.currentField = val;
        this.cdr.markForCheck();
      });
    this.airLeakService.airLeakInput
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.airLeakInput = value;
        this.calculate();
        this.cdr.markForCheck();
      });
  }
  
  async calculate() {
    this.airLeakService.calculate(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.airLeakInput = this.airLeakService.airLeakInput.getValue();;
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  
 async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.airLeakInput) {
        this.airLeakService.airLeakInput.next(this.assessmentCalculator.airLeakInput);
      } else {
        this.assessmentCalculator.airLeakInput = this.airLeakService.airLeakInput.getValue();
      }
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let inputs = this.airLeakService.airLeakInput.getValue();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      airLeakInput: inputs
    };
    return tmpCalculator;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.panelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.panelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  btnResetData() {
   this.airLeakService.currentLeakIndex.next(0);
   this.airLeakService.initDefaultEmptyInputs(this.settings);
   this.airLeakService.resetData.next(true);
  }

  btnGenerateExample() {
    this.airLeakService.generateExampleData(this.settings);
  }

  save() {
    this.emitSave.emit({ airLeakSurveyInput: this.airLeakService.airLeakInput.getValue(), opportunityType: Treasure.airLeak});
  }

  cancel() {
    this.emitCancel.emit(true);
  }
  
  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
