import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { OtherLossesCompareService } from '../other-losses-compare.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-other-losses-form',
  templateUrl: './other-losses-form.component.html',
  styleUrls: ['./other-losses-form.component.css']
})
export class OtherLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  firstChange: boolean = true;
  resultsUnit: string;
  constructor(private windowRefService: WindowRefService, private otherLossesCompareService: OtherLossesCompareService) { }

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
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }
  disableForm() {
    this.lossesForm.disable();
  }
  enableForm() {
    this.lossesForm.enable();
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  canCompare() {
    if (this.otherLossesCompareService.baselineOtherLoss && this.otherLossesCompareService.modifiedOtherLoss) {
      return true;
    } else {
      return false;
    }
  }
  compareDescription(): boolean {
    if (this.canCompare()) {
      return this.otherLossesCompareService.compareDescription(this.lossIndex);
    } else {
      return false;
    }
  }

  compareHeatLoss(): boolean {
    if (this.canCompare()) {
      return this.otherLossesCompareService.compareHeatLoss(this.lossIndex);
    } else {
      return false;
    }
  }

}
