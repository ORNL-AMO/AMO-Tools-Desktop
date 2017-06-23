import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from "../../../../indexedDb/window-ref.service";
import { AtmosphereLossesCompareService } from '../atmosphere-losses-compare.service';
@Component({
  selector: 'app-atmosphere-losses-form',
  templateUrl: './atmosphere-losses-form.component.html',
  styleUrls: ['./atmosphere-losses-form.component.css']
})
export class AtmosphereLossesFormComponent implements OnInit {
  @Input()
  atmosphereLossForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;
  constructor(private windowRefService: WindowRefService, private atmosphereLossesCompareService: AtmosphereLossesCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }


  disableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.atmosphereLossForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
  }

  initDifferenceMonitor() {
    if (this.atmosphereLossesCompareService.baselineAtmosphereLosses && this.atmosphereLossesCompareService.modifiedAtmosphereLosses && this.atmosphereLossesCompareService.differentArray.length != 0) {
      let doc = this.windowRefService.getDoc();

      //atmosphereGas
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.atmosphereGas.subscribe((val) => {
        let atmosphereGasElements = doc.getElementsByName('atmosphereGas_' + this.lossIndex);
        atmosphereGasElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //specificHeat
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
        let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
        specificHeatElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //inletTemp
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.inletTemperature.subscribe((val) => {
        let inletTempElements = doc.getElementsByName('inletTemp_' + this.lossIndex);
        inletTempElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //outletTemp
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.outletTemperature.subscribe((val) => {
        let outletTempElements = doc.getElementsByName('outletTemp_' + this.lossIndex);
        outletTempElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //flowRate
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.flowRate.subscribe((val) => {
        let flowRateElements = doc.getElementsByName('flowRate_' + this.lossIndex);
        flowRateElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //correctionFactor
      this.atmosphereLossesCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
        let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
        correctionFactorElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })

    }
  }
}
