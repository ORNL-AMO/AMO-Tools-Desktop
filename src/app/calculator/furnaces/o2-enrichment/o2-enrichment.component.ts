import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../shared/models/phast/o2Enrichment';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { O2EnrichmentService } from './o2-enrichment.service';
import { Assessment } from '../../../shared/models/assessment';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-o2-enrichment',
  templateUrl: './o2-enrichment.component.html',
  styleUrls: ['./o2-enrichment.component.css']
})
export class O2EnrichmentComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  inAssessment: boolean;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  o2Enrichment: O2Enrichment;

  o2EnrichmentOutput: O2EnrichmentOutput = {
    availableHeatEnriched: 0.0,
    availableHeatInput: 0.0,
    fuelConsumptionEnriched: 0.0,
    fuelSavingsEnriched: 0.0
  };

  lines = [];
  tabSelect: string = 'results';
  currentField: string = 'default';
  calcExists: boolean;
  saving: boolean;
  calculator: Calculator;
  o2Form: FormGroup;
  constructor(private phastService: PhastService, private settingsDbService: SettingsDbService, private o2EnrichmentService: O2EnrichmentService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.inAssessment) {
      this.getCalculator();
    } else {
      this.initForm();
    }
    this.calculate();

    if (this.o2EnrichmentService.lines) {
      this.lines = this.o2EnrichmentService.lines;
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
    this.o2Enrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
    if (this.o2Form.status == 'VALID') {
      this.o2EnrichmentOutput = this.phastService.o2Enrichment(this.o2Enrichment, this.settings);
    } else {
      this.o2EnrichmentOutput = {
        availableHeatEnriched: 0.0,
        availableHeatInput: 0.0,
        fuelConsumptionEnriched: 0.0,
        fuelSavingsEnriched: 0.0
      };
    }
    if (!this.inAssessment) {
      this.o2EnrichmentService.o2Enrichment = this.o2Enrichment;
      this.o2EnrichmentService.lines = this.lines;
    } else if (this.calcExists) {
      this.calculator.o2Enrichment = this.o2Enrichment;
      this.saveCalculator();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getCalculator() {
    this.calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.calculator) {
      this.calcExists = true;
      if (this.calculator.nemaInputs) {
        this.o2Form = this.o2EnrichmentService.initFormFromObj(this.settings, this.calculator.o2Enrichment)
      } else {
        this.o2Form = this.o2EnrichmentService.initForm(this.settings);
        let tmpO2Enrichment: O2Enrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
        this.calculator.o2Enrichment = tmpO2Enrichment;
        this.saveCalculator();
      }
    } else {
      this.calculator = this.initCalculator();
      this.saveCalculator();
    }
  }

  initCalculator(): Calculator {
    this.o2Form = this.o2EnrichmentService.initForm(this.settings);
    let tmpO2Enrichment: O2Enrichment = this.o2EnrichmentService.getObjFromForm(this.o2Form);
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      o2Enrichment: tmpO2Enrichment
    }
    return tmpCalculator;
  }

  initForm() {
    if (this.o2EnrichmentService.o2Enrichment) {
      this.o2Form = this.o2EnrichmentService.initFormFromObj(this.settings, this.o2EnrichmentService.o2Enrichment);
    } else {
      this.o2Form = this.o2EnrichmentService.initForm(this.settings);
    }
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
