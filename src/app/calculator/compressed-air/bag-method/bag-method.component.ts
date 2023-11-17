import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { BagMethodInput, BagMethodOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { BagMethodService } from './bag-method.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-bag-method',
  templateUrl: './bag-method.component.html',
  styleUrls: ['./bag-method.component.css']
})
export class BagMethodComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  inputs: {
    inputsArray: Array<BagMethodInput>,
    operatingHours: number
  };
  outputs: BagMethodOutput;
  outputsArray: Array<BagMethodOutput>;

  showOperatingHoursModal: boolean = false;
  currentField: string = 'default';
  formWidth: number;
  constructor(private standaloneService: StandaloneService, private bagMethodService: BagMethodService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-CA-bag-method');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.bagMethodService.bagMethodInputs;
    this.outputs = {
      flowRate: 0,
      annualConsumption: 0
    };

    this.calculateAnnualConsumption();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.bagMethodService.bagMethodInputs = this.inputs;
  }

  btnResetData() {
    this.inputs = this.bagMethodService.getDefault();
    this.outputs = {
      flowRate: 0,
      annualConsumption: 0
    };
    this.calculateAnnualConsumption();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  calculateAnnualConsumption() {
    this.outputs.flowRate = 0;
    this.outputs.annualConsumption = 0;
    this.outputsArray = new Array<BagMethodOutput>();
    for (let i = 0; i < this.inputs.inputsArray.length; i++) {
      this.inputs.inputsArray[i].operatingTime = JSON.parse(JSON.stringify(this.inputs.operatingHours));
      let outputs = this.standaloneService.bagMethod(this.inputs.inputsArray[i], this.settings);
      outputs.annualConsumption = this.inputs.operatingHours * outputs.flowRate * 60;
      this.outputsArray.push(outputs);
      this.outputs.flowRate += outputs.flowRate;
      this.outputs.annualConsumption += outputs.annualConsumption;
    }
  }

  addLeakage() {
    let input: BagMethodInput = {
      operatingTime: JSON.parse(JSON.stringify(this.inputs.operatingHours)),
      bagFillTime: 0,
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
    };

    let output: BagMethodOutput = {
      flowRate: 0,
      annualConsumption: 0
    };
    this.inputs.inputsArray.push(input);
    this.outputsArray.push(output);
  }

  deleteLeakage(i: number) {
    this.inputs.inputsArray.splice(i, 1);
    this.outputsArray.splice(i, 1);
    this.calculateAnnualConsumption();
  }

  changeField(str: string) {
    this.currentField = str;
  }

  btnGenerateExample() {
    this.inputs = this.bagMethodService.getExample();
    this.calculateAnnualConsumption();
  }
  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(calculatedOpHrs: OperatingHours) {
    this.bagMethodService.operatingHours = calculatedOpHrs;
    this.inputs.operatingHours = calculatedOpHrs.hoursPerYear;
    this.closeOperatingHoursModal();
    this.calculateAnnualConsumption();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

}
