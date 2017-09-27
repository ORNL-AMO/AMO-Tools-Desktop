import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
@Component({
  selector: 'app-water-cooling-losses-form',
  templateUrl: './water-cooling-losses-form.component.html',
  styleUrls: ['./water-cooling-losses-form.component.css']
})
export class WaterCoolingLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
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
  constructor(private windowRefService: WindowRefService, private coolingLossesCompareService: CoolingLossesCompareService) { }

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
    this.calculate.emit(true)
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
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses && this.coolingLossesCompareService.differentArray.length != 0) {
      if (this.coolingLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //liquidFlow
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.waterCoolingLossDifferent.flowRate.subscribe((val) => {
          let liquidFlowElements = doc.getElementsByName('liquidFlow_' + this.lossIndex);
          liquidFlowElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //inletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.waterCoolingLossDifferent.initialTemperature.subscribe((val) => {
          let inletTempElements = doc.getElementsByName('inletTemp_' + this.lossIndex);
          inletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //outletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.waterCoolingLossDifferent.outletTemperature.subscribe((val) => {
          let outletTempElements = doc.getElementsByName('outletTemp_' + this.lossIndex);
          outletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.waterCoolingLossDifferent.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
