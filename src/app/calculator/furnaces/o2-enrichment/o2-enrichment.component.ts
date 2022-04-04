import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { EnrichmentInput } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2EnrichmentService } from './o2-enrichment.service';
import { Assessment } from '../../../shared/models/assessment';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { O2EnrichmentFormService } from './o2-enrichment-form.service';

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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  tabSelect: string = 'results';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  o2Form: FormGroup;
  toggleResetData: boolean = true;
  toggleExampleData: boolean = false;

  enrichmentInputs: Array<EnrichmentInput>;
  enrichmentInputsSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, private o2EnrichmentService: O2EnrichmentService, private o2FormService: O2EnrichmentFormService,
   private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
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
    this.enrichmentInputsSub = this.o2EnrichmentService.enrichmentInputs.subscribe(value => {
      this.enrichmentInputs = value;
      this.o2EnrichmentService.calculate(this.settings);
      if(this.inAssessment){
        this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    })
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.o2EnrichmentInputs) {
        this.o2EnrichmentService.enrichmentInputs.next(this.calculator.o2EnrichmentInputs);
      } else {
        this.calculator.o2EnrichmentInputs = this.o2EnrichmentService.enrichmentInputs.getValue();
        this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
      }
    } else {
      this.calculator = this.initCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.calculator);
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
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


}
