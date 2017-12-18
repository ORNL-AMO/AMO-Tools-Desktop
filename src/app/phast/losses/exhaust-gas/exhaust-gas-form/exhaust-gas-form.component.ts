import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ExhaustGasCompareService } from '../exhaust-gas-compare.service';
import { FormControl, Validators } from '@angular/forms'
import * as _ from 'lodash';
//used for other loss monitoring
import { ExhaustGasService } from '../exhaust-gas.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-exhaust-gas-form',
  templateUrl: './exhaust-gas-form.component.html',
  styleUrls: ['./exhaust-gas-form.component.css']
})
export class ExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: any;
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

  //different for other losses monitoring
  @Input()
  isBaseline: boolean;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;

  // otherLossArray: Array<number>;
  constructor(private windowRefService: WindowRefService, private exhaustGasCompareService: ExhaustGasCompareService, private exhaustGasService: ExhaustGasService) { }

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
    if (this.exhaustGasCompareService.baselineExhaustGasLosses && this.exhaustGasCompareService.modifiedExhaustGasLosses && this.exhaustGasCompareService.differentArray.length != 0) {
      if (this.exhaustGasCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //cycleTime
        // this.exhaustGasCompareService.differentArray[this.lossIndex].different.cycleTime.subscribe((val) => {
        //   let cycleTimeElements = doc.getElementsByName('cycleTime_' + this.lossIndex);
        //   cycleTimeElements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //offGasTemp
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.offGasTemp.subscribe((val) => {
          let offGasTempElements = doc.getElementsByName('offGasTemp_' + this.lossIndex);
          offGasTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //CO
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.CO.subscribe((val) => {
          let COElements = doc.getElementsByName('CO_' + this.lossIndex);
          COElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //O2
        // this.exhaustGasCompareService.differentArray[this.lossIndex].different.O2.subscribe((val) => {
        //   let O2Elements = doc.getElementsByName('O2_' + this.lossIndex);
        //   O2Elements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //H2
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.H2.subscribe((val) => {
          let H2Elements = doc.getElementsByName('H2_' + this.lossIndex);
          H2Elements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //CO2
        // this.exhaustGasCompareService.differentArray[this.lossIndex].different.CO2.subscribe((val) => {
        //   let CO2Elements = doc.getElementsByName('CO2_' + this.lossIndex);
        //   CO2Elements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //combustibleGases
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.combustibleGases.subscribe((val) => {
          let combustibleGasesElements = doc.getElementsByName('combustibleGases_' + this.lossIndex);
          combustibleGasesElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //vfr
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.vfr.subscribe((val) => {
          let vfrElements = doc.getElementsByName('vfr_' + this.lossIndex);
          vfrElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //dustLoading
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.dustLoading.subscribe((val) => {
          let dustLoadingElements = doc.getElementsByName('dustLoading_' + this.lossIndex);
          dustLoadingElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }

  }

}

