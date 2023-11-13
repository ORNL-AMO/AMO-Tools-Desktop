import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { EnrichmentInput } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2EnrichmentService } from './o2-enrichment.service';
import { Assessment } from '../../../shared/models/assessment';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { O2EnrichmentFormService } from './o2-enrichment-form.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-o2-enrichment',
  templateUrl: './o2-enrichment.component.html',
  styleUrls: ['./o2-enrichment.component.css']
})
export class O2EnrichmentComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inAssessment: boolean;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild("contentContainer", { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;

  tabSelect: string = 'results';
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  o2Form: UntypedFormGroup;
  toggleResetData: boolean = true;
  toggleExampleData: boolean = false;

  enrichmentInputs: Array<EnrichmentInput>;
  enrichmentInputsSub: Subscription;
  containerHeight: number;
  smallScreenTab: string = 'form';

  constructor(private settingsDbService: SettingsDbService, private o2EnrichmentService: O2EnrichmentService, private o2FormService: O2EnrichmentFormService,
   private calculatorDbService: CalculatorDbService,
   private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-o2-enrichment');
    this.calculatorDbService.isSaving = false;
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settings.unitsOfMeasure == 'Custom') {
      this.settings.unitsOfMeasure = 'Imperial';
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.enrichmentInputs = this.o2EnrichmentService.enrichmentInputs.value;
    if (!this.enrichmentInputs) {
      this.o2EnrichmentService.initDefaultEmptyInputs(this.settings);
    }
    if (this.inAssessment) {
      this.getCalculator();
      this.originalCalculator = this.calculator;
    }

    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.enrichmentInputsSub.unsubscribe();
  }

  initSubscriptions() {
    // TODO - medium confidence level on the async designator here. not much doc on awaiting inside a subscription.
    this.enrichmentInputsSub = this.o2EnrichmentService.enrichmentInputs.subscribe(async(value) => {
      this.enrichmentInputs = value;
      this.o2EnrichmentService.calculate(this.settings);
      if(this.inAssessment){
         await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    })
  }

  async getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      if (this.calculator.o2EnrichmentInputs) {
        this.o2EnrichmentService.enrichmentInputs.next(this.calculator.o2EnrichmentInputs);
      } else {
        this.calculator.o2EnrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
        await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
    }
  }

  initCalculator(): Calculator {
    let inputs: Array<EnrichmentInput> = this.o2EnrichmentService.enrichmentInputs.getValue();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      o2EnrichmentInputs: inputs
    };
    return tmpCalculator;
  }


  btnGenerateExample() {
    let exampleInputs: Array<EnrichmentInput> = this.o2FormService.generateExample(this.settings);
    this.o2EnrichmentService.enrichmentInputs.next(exampleInputs);
    this.o2EnrichmentService.currentEnrichmentIndex.next(1);
  }

  btnResetData() {
    if (this.inAssessment) {
      this.calculator = this.originalCalculator;
    }
    this.o2EnrichmentService.resetData.next(true);
    this.o2EnrichmentService.resetInputs(this.settings);
    this.o2EnrichmentService.currentEnrichmentIndex.next(0);
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
