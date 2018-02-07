import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SlagCompareService } from '../slag-compare.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-slag-form',
  templateUrl: './slag-form.component.html',
  styleUrls: ['./slag-form.component.css']
})
export class SlagFormComponent implements OnInit {
  @Input()
  slagLossForm: FormGroup;
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

  firstChange: boolean = true;
  counter: any;
  constructor(private windowRefService: WindowRefService, private slagCompareService: SlagCompareService) { }

  ngOnInit() {
  }

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

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  disableForm() {
    this.slagLossForm.disable();
  }

  enableForm() {
    this.slagLossForm.enable();
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
    this.emitSave();
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
