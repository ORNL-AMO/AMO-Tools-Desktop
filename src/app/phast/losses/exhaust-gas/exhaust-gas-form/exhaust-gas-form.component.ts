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
  @Input()
  inSetup: boolean;

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
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  disableForm() {
    // this.exhaustGasForm.disable();
  }

  enableForm() {
    // this.exhaustGasForm.enable();
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
  canCompare() {
    if (this.exhaustGasCompareService.baselineExhaustGasLosses && this.exhaustGasCompareService.modifiedExhaustGasLosses && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareOffGasTemp(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareOffGasTemp(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCO(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareCO(this.lossIndex);
    } else {
      return false;
    }
  }
  compareH2(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareH2(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCombustibleGases(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareCombustibleGases(this.lossIndex);
    } else {
      return false;
    }
  }
  compareVfr(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareVfr(this.lossIndex);
    } else {
      return false;
    }
  }
  compareDustLoading(): boolean {
    if (this.canCompare()) {
      return this.exhaustGasCompareService.compareDustLoading(this.lossIndex);
    } else {
      return false;
    }
  }


}

