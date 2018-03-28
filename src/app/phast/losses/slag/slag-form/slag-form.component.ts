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
  constructor(private slagCompareService: SlagCompareService) { }

  ngOnInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
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

  disableForm() {
    this.slagLossForm.disable();
  }

  enableForm() {
    this.slagLossForm.enable();
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
    if (this.slagCompareService.baselineSlag && this.slagCompareService.modifiedSlag) {
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
