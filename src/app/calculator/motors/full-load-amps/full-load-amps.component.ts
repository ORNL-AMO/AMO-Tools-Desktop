import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { FullLoadAmpsService } from './full-load-amps.service';

@Component({
  selector: 'app-full-load-amps',
  templateUrl: './full-load-amps.component.html',
  styleUrls: ['./full-load-amps.component.css']
})
export class FullLoadAmpsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inModal: boolean;
  @Output('emitFullLoadAmps')
  emitFullLoadAmps = new EventEmitter<number>();

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;  
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  
  
  containerHeight: number;
  tabSelect: string = 'help';
  headerHeight: number;

  flaInputSub: Subscription;
  flaResultSub: Subscription;
  currentField: string;
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private settingsDbService: SettingsDbService, 
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService,
    private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);

    let existingInputs = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    if(!existingInputs) {
      this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);
      this.fullLoadAmpsService.initDefualtEmptyOutputs();
    }
    this.initSubscriptions();

    if(this.assessment) {
      this.getCalculatorForAssessment();
    }
  }

  ngOnDestroy(){
    this.flaInputSub.unsubscribe();
    if (this.inModal) {
      this.flaResultSub.unsubscribe();
    }
  }

  initSubscriptions() {
    if (this.inModal) {
    this.flaResultSub = this.fullLoadAmpsService.fullLoadAmpsResult.subscribe(result => {
      if (result) {
        this.emitFullLoadAmps.emit(result); 
      }
    });
    }
    this.flaInputSub = this.fullLoadAmpsService.fullLoadAmpsInputs.subscribe(updatedInputs => {
      if (updatedInputs) {
        this.calculate();
      }
    })
  }

  calculate() {
    this.fullLoadAmpsService.estimateFullLoadAmps(this.settings);
    if (this.assessmentCalculator) {
      this.assessmentCalculator.fullLoadAmpsInput = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
      this.saveAssessmentCalculator();
     }
  }

  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.fullLoadAmpsInput) {
        this.fullLoadAmpsService.fullLoadAmpsInputs.next(this.assessmentCalculator.fullLoadAmpsInput);
      } else {
        this.assessmentCalculator.fullLoadAmpsInput = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
      }
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.saveAssessmentCalculator();
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let inputs = this.fullLoadAmpsService.fullLoadAmpsInputs.getValue();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      fullLoadAmpsInput: inputs
    };
    return tmpCalculator;
  }

  saveAssessmentCalculator(){
    if (!this.saving) {
      if (this.assessmentCalculator.id) {
        this.indexedDbService.putCalculator(this.assessmentCalculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.assessmentCalculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.assessmentCalculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.assessmentCalculator.id = result;
            this.saving = false;
          });
        });
      }
    }
  }

  
  btnResetData() {
    this.fullLoadAmpsService.initDefualtEmptyInputs(this.settings);
    this.fullLoadAmpsService.resetData.next(true);
  }

  btnGenerateExample() {
    this.fullLoadAmpsService.generateExampleData(this.settings);
    this.fullLoadAmpsService.generateExample.next(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.offsetHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }
}
