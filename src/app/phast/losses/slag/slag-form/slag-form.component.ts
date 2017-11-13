import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SlagCompareService } from '../slag-compare.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-slag-form',
  templateUrl: './slag-form.component.html',
  styleUrls: ['./slag-form.component.css']
})
export class SlagFormComponent implements OnInit {
  @Input()
  slagLossForm: any;
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
  @Input()
  settings: Settings;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;
  constructor(private windowRefService: WindowRefService, private slagCompareService: SlagCompareService) { }

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

  ngOnInit() {
  }

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
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
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
    if (this.slagCompareService.baselineSlag && this.slagCompareService.modifiedSlag && this.slagCompareService.differentArray.length != 0) {
      if (this.slagCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //weight
        this.slagCompareService.differentArray[this.lossIndex].different.weight.subscribe((val) => {
          let weightElements = doc.getElementsByName('weight_' + this.lossIndex);
          weightElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //inletTemperature
        this.slagCompareService.differentArray[this.lossIndex].different.inletTemperature.subscribe((val) => {
          let inletTemperatureElements = doc.getElementsByName('inletTemperature_' + this.lossIndex);
          inletTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //outletTemperature
        this.slagCompareService.differentArray[this.lossIndex].different.outletTemperature.subscribe((val) => {
          let outletTemperatureElements = doc.getElementsByName('outletTemperature_' + this.lossIndex);
          outletTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificHeat
        this.slagCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
          let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
          specificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.slagCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
