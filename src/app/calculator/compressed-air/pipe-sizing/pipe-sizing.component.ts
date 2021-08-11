import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { PipeSizingService } from './pipe-sizing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import {IndexedDbService} from '../../../indexedDb/indexed-db.service';
import {FormGroup} from '@angular/forms';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator, PipeSizingInputs} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';
import { CompressedAirAssessment } from "../../../shared/models/compressed-air-assessment"
import { CompressedAirAssessmentComponent } from '../../../compressed-air-assessment/compressed-air-assessment.component';


@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  sizingForm: FormGroup;
  currentField: string;
  pipeSize: number; //specific speed
  toggleCalculate: boolean = true;
  toggleResetData: boolean = true;
  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;




  constructor(private standaloneService: StandaloneService, private pipeSizingService: PipeSizingService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    

    //get settings if standalone
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.inAssessment) {
      this.getCalculator();
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

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
    if (!this.compressedAirAssessment) {
      this.pipeSizingService.inputs = this.pipeSizingService.getObjFromForm(this.sizingForm);
    } else if (this.inAssessment && this.calcExists) {
      this.calculator.pipeSizingInputs = this.pipeSizingService.getObjFromForm(this.sizingForm);
      this.saveCalculator();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy(){
    this.pipeSizingService.inputs = this.inputs;
  }

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = this.standaloneService.pipeSizing(inputs, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.pipeSizingInputs) {
        this.sizingForm = this.pipeSizingService.initFormFromObj(this.calculator.pipeSizingInputs);
      } else {
        this.inputs = this.pipeSizingService.inputs;
        this.calculatePipeSize(this.inputs);
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmppipeSizingInputs: PipeSizingInputs = this.pipeSizingService.getObjFromForm(this.sizingForm);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      pipeSizingInputs: tmppipeSizingInputs
    };
    return tmpCalculator;
  }

  
  saveCalculator() {
    if (!this.saving || this.calcExists) {
      if (this.calcExists) {
        this.indexedDbService.putCalculator(this.calculator).then(() => {
          this.calculatorDbService.setAll();
        });
      } else {
        this.saving = true;
        this.calculator.assessmentId = this.assessment.id;
        this.indexedDbService.addCalculator(this.calculator).then((result) => {
          this.calculatorDbService.setAll().then(() => {
            this.calculator.id = result;
            this.calcExists = true;
            this.saving = false;
          });
        });
      }
    }
  }

  btnResetData() {
    this.inputs = this.pipeSizingService.getDefaultData();
    this.calculatePipeSize(this.inputs);
    // this.toggleResetData = !this.toggleResetData;
    // this.sizingForm = this.pipeSizingService.resetForm(this.settings);
    // this.calculate();
  }

  btnGenerateExample() {
    let tempInputs: PipeSizingInput = this.pipeSizingService.getExampleData();
    this.inputs = this.pipeSizingService.convertPipeSizingExample(tempInputs, this.settings);
    this.calculatePipeSize(this.inputs);
    // this.toggleResetData = !this.toggleResetData;
    // this.sizingForm = this.pipeSizingService.initForm(this.settings);
    // this.calculate();
  }
}

