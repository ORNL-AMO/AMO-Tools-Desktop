import { Component, OnInit, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirVelocityInput, PipeSizes } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { AirVelocityService } from './air-velocity.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';


@Component({
  selector: 'app-air-velocity',
  templateUrl: './air-velocity.component.html',
  styleUrls: ['./air-velocity.component.css']
})
export class AirVelocityComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;


  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  inputs: AirVelocityInput;
  outputs: PipeSizes;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private airVelocityService: AirVelocityService, private standaloneService: StandaloneService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if(this.assessment) {
      this.getCalculatorForAssessment();
    } else{
    this.inputs = this.airVelocityService.airVelocityInputs;
    this.getAirVelocity(this.inputs);
  }
}
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  getAirVelocity(inputs: AirVelocityInput) {
    this.outputs = this.standaloneService.airVelocity(inputs, this.settings);
     if(this.assessmentCalculator) {
       this.assessmentCalculator.airVelocityInputs = this.inputs;
       this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
     }else{
       this.airVelocityService.airVelocityInputs = this.inputs;
     }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy() {
    if(this.assessmentCalculator) {
      this.airVelocityService.airVelocityInputs = this.airVelocityService.getDefault();
    }
  }

  setField(str: string) {
    this.currentField = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.airVelocityInputs) {
        this.inputs = this.assessmentCalculator.airVelocityInputs;
        this.getAirVelocity(this.inputs);
      } else {
        this.inputs = this.airVelocityService.airVelocityInputs;
        this.assessmentCalculator.airVelocityInputs = this.inputs;
        this.getAirVelocity(this.inputs);
      }
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  initNewAssessmentCalculator(): Calculator {
    this.inputs = this.airVelocityService.airVelocityInputs;
    this.getAirVelocity(this.inputs);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      airVelocityInputs: this.inputs
    };
    return tmpCalculator;
  }


  btnResetData() {
    let defaultInputs = this.airVelocityService.getDefault();
    this.airVelocityService.airVelocityInputs = defaultInputs;
    this.inputs = defaultInputs;
    this.getAirVelocity(this.inputs);
  }

  //provide functionality to "Generate Example" button,
  //reset data function should have most of the structure already
  btnGenerateExample() {
    let tmpInputs: AirVelocityInput = this.airVelocityService.getExample();
    this.inputs = this.airVelocityService.convertAirVelocityExample(tmpInputs, this.settings);
    this.getAirVelocity(this.inputs);
  }

 
 

  
}



