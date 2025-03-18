import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ExhaustGasCompareService } from '../exhaust-gas-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-exhaust-gas-form',
    templateUrl: './exhaust-gas-form.component.html',
    styleUrls: ['./exhaust-gas-form.component.css'],
    standalone: false
})
export class ExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: UntypedFormGroup;
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
  @Input()
  isBaseline: boolean;

  idString: string;
  constructor(private exhaustGasCompareService: ExhaustGasCompareService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }

  save() {
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

