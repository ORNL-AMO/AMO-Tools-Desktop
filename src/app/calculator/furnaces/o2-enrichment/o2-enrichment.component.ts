import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { EnrichmentInput } from '../../../shared/models/phast/o2Enrichment';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2EnrichmentService } from './o2-enrichment.service';
import { Assessment } from '../../../shared/models/assessment';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  currentField: string = 'default';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  originalCalculator: Calculator;
  o2Form: FormGroup;
  toggleResetData: boolean = true;
  toggleExampleData: boolean = false;

  currentFieldSub: Subscription;
  enrichmentInputs: Array<EnrichmentInput>;
  enrichmentInputsSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, private o2EnrichmentService: O2EnrichmentService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
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
    if(!this.enrichmentInputs) {
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
    this.currentFieldSub.unsubscribe();
    this.enrichmentInputsSub.unsubscribe();
  }

  initSubscriptions() {
    this.currentFieldSub = this.o2EnrichmentService.currentField.subscribe(val => {
      this.currentField = val;
    });
    this.enrichmentInputsSub = this.o2EnrichmentService.enrichmentInputs.subscribe(value => {
      this.enrichmentInputs = value;
      this.calculate();
    })
  }

  calculate() {
    this.o2EnrichmentService.calculate(this.settings);

    if (!this.inAssessment) {
      // Need to set BheaveSub from calculator props if in assessment
      // this.o2EnrichmentService.o2Enrichment = this.o2Enrichment;
      // this.o2EnrichmentService.lines = this.lines;
    } else if (this.calcExists) {
      // let inputs: Array<EnrichmentInput> = this.o2EnrichmentService.enrichmentInputs.getValue();
      // let tmpO2Enrichment: EnrichmentInput = inputs[0];
      // this.calculator.o2Enrichment = tmpO2Enrichment
      // this.saveCalculator();
    }
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    console.log('calculator', this.calculator);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.o2Enrichment) {
        // TODO Set input objects from stored calculator
        // this.o2Form = this.o2EnrichmentService.initFormFromObj(this.settings, this.calculator.o2Enrichment);
      } else {
        // TODO Is new form - set calculator O2
        // this.calculator.o2Enrichment = tmpO2Enrichment;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    // TODO set new calculator to O2 enrichment
    let inputs: Array<EnrichmentInput> = this.o2EnrichmentService.enrichmentInputs.getValue();
    let tmpO2Enrichment: EnrichmentInput = inputs[0];
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      // o2Enrichment: tmpO2Enrichment
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

  btnGenerateExample() {
    this.o2EnrichmentService.generateExample(this.settings);
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
