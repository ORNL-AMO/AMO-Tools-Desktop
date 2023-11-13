import { Component, OnInit, Input, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Fan203Inputs } from '../../../shared/models/fans';
import { FanAnalysisService } from './fan-analysis.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { PlaneDataFormService } from './fan-analysis-form/plane-data-form/plane-data-form.service';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { GasDensityFormService } from './fan-analysis-form/gas-density-form/gas-density-form.service';
import { FanShaftPowerFormService } from './fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';
import { FanInfoFormService } from './fan-analysis-form/fan-info-form/fan-info-form.service';
import { ConvertFanAnalysisService } from './convert-fan-analysis.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
@Component({
  selector: 'app-fan-analysis',
  templateUrl: './fan-analysis.component.html',
  styleUrls: ['./fan-analysis.component.css']
})
export class FanAnalysisComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;

  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  // inputs: Fan203Inputs;
  smallScreenTab: string = 'form';
  containerHeight: number;
  footerWidth: number;
  stepTabs: Array<string> = ['fan-info', 'gas-density', 'plane-data', 'fan-shaft-power', 'fan-analysis-results'];
  planeStepTabs: Array<string>;
  planeStepIndex: number = 0;
  stepIndex: number = 0;
  stepTabSubscription: Subscription;
  planeTabSubscription: Subscription;
  getResultsSubscription: Subscription;
  modalOpenSub: Subscription;

  isModalOpen: boolean;
  saving: boolean;
  calcExists: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  setupDone: boolean = false;
  constructor(private settingsDbService: SettingsDbService, private fanAnalysisService: FanAnalysisService, private convertFanAnalysisService: ConvertFanAnalysisService,
    private planeDataFormService: PlaneDataFormService, private calculatorDbService: CalculatorDbService,
    private fanInfoFormService: FanInfoFormService, private gasDensityFormService: GasDensityFormService, private fanShaftPowerFormService: FanShaftPowerFormService,
     private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-fan-analysis');
    this.calculatorDbService.isSaving = false;
    this.fanAnalysisService.inAssessmentModal = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    if (this.assessment) {
      this.getCalculator();
      this.originalCalculator = this.calculator;
    } else if (this.fanAnalysisService.inputData === undefined) {
      this.fanAnalysisService.inputData = this.fanAnalysisService.getDefaultData();
      this.fanAnalysisService.inputData = this.convertFanAnalysisService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);
    }

    this.setPlaneStepTabs();
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.setStepTabIndex(val);
    });
    this.planeTabSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.setPlaneTabIndex(val);
    });

    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(async(val) => {
      this.checkSetupDone();
      this.setPlaneStepTabs();
      if (this.planeStepTabs[this.planeStepIndex] == '3b' && this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 1) {
        this.setPlaneTabIndex('3a');
      }
      if (this.planeStepTabs[this.planeStepIndex] == '3c' && this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes != 3) {
        this.setPlaneTabIndex('3a');
      }
      if(this.assessment){
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    });

    this.modalOpenSub = this.fanAnalysisService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    })

  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
    this.planeTabSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
    this.modalOpenSub.unsubscribe();
    if (this.assessment && this.calcExists) {
      this.resetAndSaveCalculator();
    }
  }

  async resetAndSaveCalculator() {
    this.calculator.fan203Inputs = this.fanAnalysisService.inputData;
    await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 500)
  }

  setExample(){
    this.fanAnalysisService.inputData = this.fanAnalysisService.getExampleData();
    this.fanAnalysisService.inputData = this.convertFanAnalysisService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);
    this.fanAnalysisService.resetForms.next(true);
    this.fanAnalysisService.resetForms.next(false);
    this.fanAnalysisService.mainTab.next('fan-setup');
    this.fanAnalysisService.stepTab.next('fan-info');
    this.fanAnalysisService.getResults.next(true);
  }

  resetDefaults(){
    this.fanAnalysisService.inputData = this.fanAnalysisService.getDefaultData();
    this.fanAnalysisService.inputData = this.convertFanAnalysisService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);
    this.fanAnalysisService.resetForms.next(true);
    this.fanAnalysisService.resetForms.next(false);
    this.fanAnalysisService.velocityResults.next(undefined);
    this.fanAnalysisService.fanShaftPowerResults.next(undefined);
    this.fanAnalysisService.mainTab.next('fan-setup');
    this.fanAnalysisService.stepTab.next('fan-info');
    this.fanAnalysisService.getResults.next(true);
  }


  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.fan203Inputs) {
        this.fanAnalysisService.inputData = this.calculator.fan203Inputs;
      } else {
        let tmpFans203Inputs: Fan203Inputs = this.fanAnalysisService.getDefaultData();
        tmpFans203Inputs = this.convertFanAnalysisService.convertFan203Inputs(tmpFans203Inputs, this.settings);
        this.calculator.fan203Inputs = tmpFans203Inputs;
        this.fanAnalysisService.inputData = this.calculator.fan203Inputs;
        this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);

      }
    } else {
      this.calculator = this.initCalculator();
      this.fanAnalysisService.inputData = this.calculator.fan203Inputs;
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);

    }
  }

  initCalculator(): Calculator {
    let tmpFans203Inputs: Fan203Inputs = this.fanAnalysisService.getDefaultData();
    tmpFans203Inputs = this.convertFanAnalysisService.convertFan203Inputs(tmpFans203Inputs, this.settings);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      fan203Inputs: tmpFans203Inputs
    };
    return tmpCalculator;
  }

  getContainerHeight() {
    if (this.content) {
      this.footerWidth = this.content.nativeElement.clientWidth;
      let contentHeight = this.content.nativeElement.offsetHeight;
      let headerHeight = this.header.nativeElement.offsetHeight;
      let footerHeight = 0;
      if (this.footer) {
        footerHeight = this.footer.nativeElement.clientHeight;
      }
      this.containerHeight = contentHeight - headerHeight - footerHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setPlaneStepTabs() {
    if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 1) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '4', '5'];
    } else if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 2) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '3b', '4', '5'];
    } else if (this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes == 3) {
      this.planeStepTabs = ['plane-info', '1', '2', '3a', '3b', '3c', '4', '5'];
    }
  }

  setStepTabIndex(stepTab: string) {
    this.stepIndex = _.findIndex(this.stepTabs, (tab) => { return tab == stepTab });
  }

  setPlaneTabIndex(stepTab: string) {
    this.planeStepIndex = _.findIndex(this.planeStepTabs, (tab) => { return tab == stepTab });
  }

  next() {
    if (this.stepTabs[this.stepIndex] == 'plane-data') {
      let nextPlaneStep: string = this.planeStepTabs[this.planeStepIndex + 1];
      if (nextPlaneStep != undefined) {
        this.planeDataFormService.planeStep.next(nextPlaneStep);
      } else {
        let nextStep: string = this.stepTabs[this.stepIndex + 1];
        this.fanAnalysisService.stepTab.next(nextStep);
      }
    } else {
      let nextStep: string = this.stepTabs[this.stepIndex + 1];
      this.fanAnalysisService.stepTab.next(nextStep);
    }
  }

  back() {
    if (this.stepTabs[this.stepIndex] == 'plane-data') {
      if (this.planeStepIndex != 0) {
        let nextPlaneStep: string = this.planeStepTabs[this.planeStepIndex - 1];
        this.planeDataFormService.planeStep.next(nextPlaneStep);
      } else {
        let nextStep: string = this.stepTabs[this.stepIndex - 1];
        this.fanAnalysisService.stepTab.next(nextStep);
      }
    } else {
      let nextStep: string = this.stepTabs[this.stepIndex - 1];
      this.fanAnalysisService.stepTab.next(nextStep);
    }
  }


  checkSetupDone(){
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
    let shaftPowerDone: boolean = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower).valid;
    this.setupDone = planeDataDone && basicsDone && gasDone && shaftPowerDone;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  changeTabNextOrBack(str: string) {
    if (str === 'next') {
      this.next();
    }
    if (str === 'back') {
      this.back();
    }
  }
}
