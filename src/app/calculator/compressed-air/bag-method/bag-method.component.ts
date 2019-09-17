import { Component, OnInit, ElementRef, ViewChild, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { BagMethodInput, BagMethodOutput } from "../../../shared/models/standalone";
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  //inputs: BagMethodInput;
  outputs: BagMethodOutput;

  inputsArray: Array<BagMethodInput>;
  outputsArray: Array<BagMethodOutput>;

  totalOperatingTime: number;
  showOperatingHoursModal: boolean = false;
  currentField: string = 'default';
  formWidth: number = 350;
  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService) { }

  ngOnInit() {
    this.inputsArray = this.compressedAirService.bagMethodInputs.inputsArray;
    this.totalOperatingTime = this.compressedAirService.bagMethodInputs.operatingHours;
    if (this.inputsArray.length === 0) {
      this.initBagMethodArrays();
    }
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
    this.compressedAirService.bagMethodInputs.operatingHours = this.totalOperatingTime;
  }

  btnResetData() {
    this.inputsArray = new Array<BagMethodInput>();
    this.initBagMethodArrays();
    this.totalOperatingTime = 8760;
    this.outputs = {
      flowRate: 0,
      annualConsumption: 0
    };
    this.calculateAnnualConsumption();
  }

  initBagMethodArrays() {
    let input: BagMethodInput = {
      operatingTime: 0,
      bagFillTime: 0,
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
    };
    this.inputsArray.push(input);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  calculateAnnualConsumption(inputsObject?: { inputs: BagMethodInput, index: number }) {
    if (inputsObject) {
      this.inputsArray[inputsObject.index] = inputsObject.inputs;
    }
    this.outputs.flowRate = 0;
    this.outputs.annualConsumption = 0;
    this.outputsArray = new Array<BagMethodOutput>();
    for (let i = 0; i < this.inputsArray.length; i++) {
      this.inputsArray[i].operatingTime = JSON.parse(JSON.stringify(this.totalOperatingTime));
      let outputs = this.standaloneService.bagMethod(this.inputsArray[i], this.settings);
      outputs.annualConsumption = this.totalOperatingTime * outputs.flowRate * 60;
      this.outputsArray.push(outputs);
      this.outputs.flowRate += outputs.flowRate;
      this.outputs.annualConsumption += outputs.annualConsumption;
    }
  }

  addLeakage() {
    let input: BagMethodInput = {
      operatingTime: JSON.parse(JSON.stringify(this.totalOperatingTime)),
      bagFillTime: 0,
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
    };

    let output: BagMethodOutput = {
      flowRate: 0,
      annualConsumption: 0
    };

    this.inputsArray.push(input);
    this.outputsArray.push(output);
  }

  deleteLeakage(i: number) {
    if (i === this.inputsArray.length - 1) {
      this.inputsArray.pop();
      this.outputsArray.pop();
    }
    else {
      let tempInputsArray = this.inputsArray;
      let tempOutputsArray = this.outputsArray;
      this.inputsArray = new Array<BagMethodInput>();
      this.outputsArray = new Array<BagMethodOutput>();
      for (let j = 0; j < tempInputsArray.length; j++) {
        if (j !== i) {
          this.inputsArray.push(tempInputsArray[j]);
          this.outputsArray.push(tempOutputsArray[j]);
        }
      }
    }
    this.calculateAnnualConsumption();
  }

  changeField(str: string) {
    this.currentField = str;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  updateOperatingHours(calculatedOpHrs: OperatingHours) {
    this.compressedAirService.bagMethodOperatingHours = calculatedOpHrs;
    this.totalOperatingTime = calculatedOpHrs.hoursPerYear;
    this.closeOperatingHoursModal();
    this.calculateAnnualConsumption();
  }

}
