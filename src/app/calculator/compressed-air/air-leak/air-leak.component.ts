import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { AirLeakService } from './air-leak.service';
import { AirLeakSurveyInput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { firstValueFrom, Subscription } from 'rxjs';
import { AirLeakSurveyTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
 
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';

@Component({
  selector: 'app-air-leak',
  templateUrl: './air-leak.component.html',
  styleUrls: ['./air-leak.component.css']
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
  currentFieldSub: Subscription;

  tabSelect: string = 'results';
  containerHeight: number;
  editMode: boolean = false;
  modificationExists: boolean;

  airLeakInput: AirLeakSurveyInput;
  airLeakInputSub: Subscription;

  saving: boolean;
  assessmentCalculator: Calculator;

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('panelHeader', { static: false }) panelHeader: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  constructor(private airLeakService: AirLeakService, private calculatorDbService: CalculatorDbService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
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
    this.currentFieldSub.unsubscribe();
    this.airLeakInputSub.unsubscribe();
  }

  initSubscriptions() {
    this.currentFieldSub = this.airLeakService.currentField.subscribe(val => {
      this.currentField = val;
    });
    this.airLeakInputSub = this.airLeakService.airLeakInput.subscribe(value => {
      this.airLeakInput = value;
      this.calculate();
    })
  }
  
  calculate() {
    this.airLeakService.calculate(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.airLeakInput = this.airLeakService.airLeakInput.getValue();;
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  
  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.airLeakInput) {
        this.airLeakService.airLeakInput.next(this.assessmentCalculator.airLeakInput);
      } else {
        this.assessmentCalculator.airLeakInput = this.airLeakService.airLeakInput.getValue();
      }
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
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
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  btnResetData() {
   this.airLeakService.initDefaultEmptyInputs(this.settings);
   this.airLeakService.currentLeakIndex.next(0);
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

}
