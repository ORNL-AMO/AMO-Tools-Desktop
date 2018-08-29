import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { OtherLossesCompareService } from '../other-losses-compare.service';
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
  @Input()
  inSetup: boolean;

  firstChange: boolean = true;
  resultsUnit: string;
  constructor(private otherLossesCompareService: OtherLossesCompareService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
  save() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  canCompare() {
    if (this.otherLossesCompareService.baselineOtherLoss && this.otherLossesCompareService.modifiedOtherLoss && !this.inSetup) {
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
