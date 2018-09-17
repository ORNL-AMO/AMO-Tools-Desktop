import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PreAssessment } from './pre-assessment';
import * as _ from 'lodash';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { ConvertPhastService } from '../../../phast/convert-phast.service';
import { Calculator } from '../../../shared/models/calculators';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PreAssessmentService } from './pre-assessment.service';
import { Assessment } from '../../../shared/models/assessment';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';

@Component({
  selector: 'app-pre-assessment',
  templateUrl: './pre-assessment.component.html',
  styleUrls: ['./pre-assessment.component.css'],
})
export class PreAssessmentComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  height: number;
  @Input()
  inModal: boolean;
  @Input()
  calculator: Calculator;
  @Input()
  inAssessment: boolean;
  @Input()
  assessment: Assessment;

  showName: boolean = false;

  @ViewChild('container') container: ElementRef;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getHeight();
  }

  headerHeight: number;

  preAssessments: Array<PreAssessment>;
  tabSelect: string = 'results';
  currentField: string;
  results: Array<any>;
  currentEnergySourceType: string = 'Electricity';
  currentAssessmentType: string = 'Metered';
  nameIndex: number = 1;
  assessmentGraphColors: Array<string>;
  showAdd: boolean = true;
  toggleCalculate: boolean = false;
  contentHeight: number = 0;
  type: string = 'furnace';
  calcExists: boolean;
  saving: boolean;
  constructor(private preAssessmentService: PreAssessmentService, private convertPhastService: ConvertPhastService, private settingsDbService: SettingsDbService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
      this.initAssessments();
    } else {
      this.initAssessments();
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    this.getHeight();
  }

  ngOnDestroy() {
    if (!this.inModal && !this.inAssessment) {
      this.preAssessmentService.standaloneInputData = this.preAssessments;
    }
  }

  getHeight() {
    setTimeout(() => {
      if (this.container.nativeElement) {
        this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
        this.height = this.container.nativeElement.clientHeight;
        this.contentHeight = this.height - this.headerHeight;
      }
    }, 200);
  }

  initAssessments() {
    this.assessmentGraphColors = graphColors;
    this.results = new Array<any>();
    if (!this.calculator) {
      if (!this.inModal && !this.inAssessment && this.preAssessmentService.standaloneInputData) {
        this.preAssessments = this.preAssessmentService.standaloneInputData;
      } else {
        if (this.inAssessment) {
          this.getCalculator();
        } else {
          this.preAssessments = new Array<PreAssessment>();
          this.addPreAssessment();
        }
      }
    } else {
      if (!this.calculator.name) {
        this.showName = true;
      }
      if (!this.calculator.type) {
        this.calculator.type = 'furnace';
      }
      this.type = this.calculator.type;
      if (this.calculator.preAssessments) {
        if (this.calculator.preAssessments.length != 0) {
          this.nameIndex = this.calculator.preAssessments.length;
          this.preAssessments = this.calculator.preAssessments;
        } else {
          this.calculator.preAssessments = new Array<PreAssessment>();
          this.preAssessments = new Array<PreAssessment>();
          this.addPreAssessment();
        }
      } else {
        this.calculator.preAssessments = new Array<PreAssessment>();
        this.preAssessments = new Array<PreAssessment>();
        this.addPreAssessment();
      }
      this.calculate();
    }
  }

  setType(str: string) {
    this.calculator.type = str;
    this.type = str;
    if (this.type == 'pump') {
      this.calculator.preAssessments.length == 1;
      this.calculator.preAssessments[0].settings.energySourceType = 'Electricity';
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setEnergySourceType(str: string) {
    if (str != this.currentEnergySourceType) {
      this.currentEnergySourceType = str;
    }
  }

  setAssessmentType(str: string) {
    if (str != this.currentAssessmentType) {
      this.currentAssessmentType = str;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setUnitsOfMeasure(str: string) {
    if (this.settings.unitsOfMeasure != str) {
      this.convertData();
      this.settings.unitsOfMeasure = str;
    }
  }

  calculate() {
    if (this.calculator) {
      this.calculator.preAssessments = this.preAssessments;
      //save in assessment, in modal button needs to be clicked to save
      if(this.inAssessment){
        this.saveCalculator();
      }
    }
    //this is fired when forms change
    this.toggleCalculate = !this.toggleCalculate;
  }

  addPreAssessment() {
    let tmpSettings: Settings = JSON.parse(JSON.stringify(this.settings));
    this.preAssessments.unshift({
      type: 'Metered',
      name: 'Unit ' + this.nameIndex,
      settings: tmpSettings,
      collapsed: false,
      collapsedState: 'open',
      borderColor: this.assessmentGraphColors[this.preAssessments.length],
      electric: true
    });

    this.nameIndex++;
    if (this.preAssessments.length >= 20) {
      this.showAdd = false;
    }
    this.calculate();
  }


  deletePreAssessment(assessment: PreAssessment, index: number) {
    this.assessmentGraphColors.push(assessment.borderColor);
    this.preAssessments.splice(index, 1);
    this.calculate();
  }

  collapsePreAssessment(assessment: PreAssessment) {
    assessment.collapsed = !assessment.collapsed;
    if (assessment.collapsed) {
      assessment.collapsedState = 'closed';
    } else {
      assessment.collapsedState = 'open';
    }
  }

  convertData() {
    this.preAssessments.forEach(assessment => {
      if (this.settings.unitsOfMeasure == 'Metric') {
        let oldSettings: Settings = {
          unitsOfMeasure: 'Imperial'
        };
        if (assessment.type == 'Metered') {
          assessment.meteredEnergy = this.convertPhastService.convertMeteredEnergy(assessment.meteredEnergy, oldSettings, this.settings);
        } else if (assessment.type == 'Designed') {
          assessment.designedEnergy = this.convertPhastService.convertDesignedEnergy(assessment.designedEnergy, oldSettings, this.settings);
        }
      } else if (this.settings.unitsOfMeasure == 'Imperial') {
        let oldSettings: Settings = {
          unitsOfMeasure: 'Metric'
        };
        if (assessment.type == 'Metered') {
          assessment.meteredEnergy = this.convertPhastService.convertMeteredEnergy(assessment.meteredEnergy, oldSettings, this.settings);
        } else if (assessment.type == 'Designed') {
          assessment.designedEnergy = this.convertPhastService.convertDesignedEnergy(assessment.designedEnergy, oldSettings, this.settings);
        }
      }
    });
  }

  setName() {
    this.showName = false;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.preAssessments) {
        this.preAssessments = this.calculator.preAssessments;
      } else {
        this.calculator.preAssessments = new Array<PreAssessment>();
        this.preAssessments = this.calculator.preAssessments
        this.addPreAssessment();
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.preAssessments = this.calculator.preAssessments;
      this.addPreAssessment();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    let tmpPreAssessments: Array<PreAssessment> = new Array<PreAssessment>();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      preAssessments: tmpPreAssessments
    }
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
          })
        });
      }
    }
  }
}