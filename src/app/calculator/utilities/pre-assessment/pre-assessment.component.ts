import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PreAssessment } from './pre-assessment';
import * as _ from 'lodash';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { Calculator } from '../../../shared/models/calculators';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PreAssessmentService } from './pre-assessment.service';
import { Assessment } from '../../../shared/models/assessment';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-pre-assessment',
    templateUrl: './pre-assessment.component.html',
    styleUrls: ['./pre-assessment.component.css'],
    standalone: false
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

  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getHeight();
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;

  preAssessments: Array<PreAssessment>;
  tabSelect: string = 'results';
  currentField: string;
  results: Array<any>;
  currentAssessmentType: string = 'Metered';
  nameIndex: number = 1;
  showAdd: boolean = true;
  toggleCalculate: boolean = false;
  contentHeight: number = 0;
  type: string = 'furnace';
  saving: boolean;
  constructor(private preAssessmentService: PreAssessmentService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private directoryDashboardService: DirectoryDashboardService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-UTIL-pre-assessment');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      if (this.inModal) {
        let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
        if (directoryId) {
          this.settings = this.settingsDbService.getByDirectoryId(directoryId);
        }
      } else {
        this.settings = this.settingsDbService.globalSettings;
      }
    } 
    this.initAssessments();
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    this.getHeight();
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inModal && !this.inAssessment) {
      this.preAssessmentService.standaloneInputData = this.preAssessments;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.container.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
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

  btnResetData() {
    this.nameIndex = 1;
    this.initAssessments(true);
  }

  btnGenerateExample() {
    this.generateExample();
    this.calculate();
  }

  generateExample() {
    if (this.settings.unitsOfMeasure == 'Custom') {
      this.settings.unitsOfMeasure = 'Imperial';
    }
    this.results = new Array<any>();
    if (!this.calculator) {
      this.preAssessments = this.preAssessmentService.generateExample(this.settings, graphColors);
    }
  }

  initAssessments(isReset?: boolean) {
    if (this.settings.unitsOfMeasure == 'Custom') {
      this.settings.unitsOfMeasure = 'Imperial';
    }
    this.results = new Array<any>();
    if (!this.calculator) {
      if (!this.inModal && !this.inAssessment && this.preAssessmentService.standaloneInputData && !isReset) {
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
        if (this.calculator.preAssessments.length !== 0) {
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
    if (this.type === 'pump') {
      this.calculator.preAssessments.length === 1;
      this.calculator.preAssessments[0].settings.energySourceType = 'Electricity';
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setAssessmentType(str: string) {
    if (str !== this.currentAssessmentType) {
      this.currentAssessmentType = str;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  async calculate() {
    if (this.calculator) {
      this.calculator.preAssessments = this.preAssessments;
      //save in assessment, in modal button needs to be clicked to save
      if (this.inAssessment) {
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
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
      borderColor: graphColors[this.preAssessments.length],
      electric: true
    });

    this.nameIndex++;
    if (this.preAssessments.length >= 20) {
      this.showAdd = false;
    }
    this.calculate();
  }


  deletePreAssessment(assessment: PreAssessment, index: number) {
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

  setName() {
    this.showName = false;
  }

  async getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      if (this.calculator.preAssessments) {
        this.preAssessments = this.calculator.preAssessments;
      } else {
        this.calculator.preAssessments = new Array<PreAssessment>();
        this.preAssessments = this.calculator.preAssessments;
        this.addPreAssessment();
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      this.preAssessments = this.calculator.preAssessments;
      this.addPreAssessment();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  initCalculator(): Calculator {
    let tmpPreAssessments: Array<PreAssessment> = new Array<PreAssessment>();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      preAssessments: tmpPreAssessments
    };
    return tmpCalculator;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
