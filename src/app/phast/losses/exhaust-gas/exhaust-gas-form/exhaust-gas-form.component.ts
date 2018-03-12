import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ExhaustGasCompareService } from '../exhaust-gas-compare.service';
import * as _ from 'lodash';
//used for other loss monitoring
import { ExhaustGasService } from '../exhaust-gas.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-exhaust-gas-form',
  templateUrl: './exhaust-gas-form.component.html',
  styleUrls: ['./exhaust-gas-form.component.css']
})
export class ExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: FormGroup;
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
    this.exhaustGasForm.disable();
  }

  enableForm() {
    this.exhaustGasForm.enable();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }

  initDifferenceMonitor() {
    if (this.exhaustGasCompareService.baselineExhaustGasLosses && this.exhaustGasCompareService.modifiedExhaustGasLosses && this.exhaustGasCompareService.differentArray.length != 0) {
      if (this.exhaustGasCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
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
        //H2
        this.exhaustGasCompareService.differentArray[this.lossIndex].different.H2.subscribe((val) => {
          let H2Elements = doc.getElementsByName('H2_' + this.lossIndex);
          H2Elements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
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

