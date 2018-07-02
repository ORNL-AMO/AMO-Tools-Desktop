import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  exploreModIndex: number;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  showSizeMargin: boolean;
  counter: any;

  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.checkOptimized();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate(str?: string) {
    if (str == 'fixedSpecificSpeed') {
      this.focusField('fixedSpecificSpeed');
    }
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    this.emitSave.emit(true);
  }

  toggleOptimized() {
    this.calculate();
    if (!this.psat.modifications[this.exploreModIndex].psat.inputs.optimize_calculation) {
      this.psat.modifications[this.exploreModIndex].psat.inputs.fixed_speed = 0;
      this.psat.modifications[this.exploreModIndex].psat.inputs.margin = 0;
      this.showSizeMargin = false;
    }
  }

  checkOptimized() {
    if (this.psat.modifications[this.exploreModIndex].psat.inputs.optimize_calculation) {
      if (this.psat.modifications[this.exploreModIndex].psat.inputs.margin != 0) {
        this.showSizeMargin = true;
      }
    }
  }

}
