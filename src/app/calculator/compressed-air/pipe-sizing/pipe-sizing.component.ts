import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { PipeSizingService } from './pipe-sizing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import {IndexedDbService} from '../../../indexedDb/indexed-db.service';
import {Assessment} from '../../../shared/models/assessment';
import {Calculator} from '../../../shared/models/calculators';
import {CalculatorDbService} from '../../../indexedDb/calculator-db.service';


@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  
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
  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string;
  tabSelect: string = 'results';
  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private standaloneService: StandaloneService, private pipeSizingService: PipeSizingService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    if (this.assessment) {
      this.getCalculatorForAssessment();
    } else {
      // Set calc inputs from service defaults
      this.inputs = this.pipeSizingService.inputs;
      this.calculatePipeSize(this.inputs);
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

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = this.standaloneService.pipeSizing(inputs, this.settings);
    // Changes to inputs have been made, save them to calculator otherwise update service
    if (this.assessmentCalculator) {
      this.assessmentCalculator.pipeSizingInputs = this.inputs;
      this.saveAssessmentCalculator();
    } else {
      this.pipeSizingService.inputs = this.inputs;
    }
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  ngOnDestroy(){
    if (this.assessmentCalculator) {
      this.pipeSizingService.inputs = this.pipeSizingService.getDefaultData();
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
    if (this.assessmentCalculator && this.assessmentCalculator.pipeSizingInputs) {
        this.inputs = this.assessmentCalculator.pipeSizingInputs;
        this.calculatePipeSize(this.inputs);
    } else {
      // create new calculator obj for assessment
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.saveAssessmentCalculator();
    }
  }

 initNewAssessmentCalculator(): Calculator {
    this.inputs = this.pipeSizingService.inputs;
    this.calculatePipeSize(this.inputs);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      pipeSizingInputs: this.inputs
    };
    return tmpCalculator;
  }

  
  saveAssessmentCalculator() {
    // Saving flag incase we get user keybaord input while already saving
    if (!this.saving) {
      if (this.assessmentCalculator) {
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
    let defaultInputs = this.pipeSizingService.getDefaultData();
    this.pipeSizingService.inputs = defaultInputs;
    this.inputs = defaultInputs;
    this.calculatePipeSize(this.inputs);
  }

  btnGenerateExample() {
    let tempInputs: PipeSizingInput = this.pipeSizingService.getExampleData();
    this.inputs = this.pipeSizingService.convertPipeSizingExample(tempInputs, this.settings);
    this.calculatePipeSize(this.inputs);
  }
}


