import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SlagCompareService } from '../slag-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-slag-form',
  templateUrl: './slag-form.component.html',
  styleUrls: ['./slag-form.component.css']
})
export class SlagFormComponent implements OnInit {
  @Input()
  slagLossForm: UntypedFormGroup;
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

  firstChange: boolean = true;
  idString: string;
  constructor(private slagCompareService: SlagCompareService) { }

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
    if (this.slagCompareService.baselineSlag && this.slagCompareService.modifiedSlag && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareWeight(): boolean {
    if (this.canCompare()) {
      return this.slagCompareService.compareWeight(this.lossIndex);
    } else {
      return false;
    }
  }

  compareInletTemperature(): boolean {
    if (this.canCompare()) {
      return this.slagCompareService.compareInletTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOutletTemperature(): boolean {
    if (this.canCompare()) {
      return this.slagCompareService.compareOutletTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSpecificHeat(): boolean {
    if (this.canCompare()) {
      return this.slagCompareService.compareSpecificHeat(this.lossIndex);
    } else {
      return false;
    }
  }
  compareCorrectionFactor(): boolean {
    if (this.canCompare()) {
      return this.slagCompareService.compareCorrectionFactor(this.lossIndex);
    } else {
      return false;
    }
  }
}
