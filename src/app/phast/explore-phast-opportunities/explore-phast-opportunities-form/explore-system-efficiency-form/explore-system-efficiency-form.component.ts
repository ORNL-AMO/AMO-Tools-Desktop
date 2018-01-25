import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-explore-system-efficiency-form',
  templateUrl: './explore-system-efficiency-form.component.html',
  styleUrls: ['./explore-system-efficiency-form.component.css']
})
export class ExploreSystemEfficiencyFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;

  showEfficiencyData: boolean = false;

  constructor() { }

  ngOnInit() {
    this.initEfficiency();
  }

  initEfficiency() {
    if (this.phast.systemEfficiency != this.phast.modifications[this.exploreModIndex].phast.systemEfficiency) {
      this.showEfficiencyData = true;
    }
  }

  toggleEfficiency() {
    if(this.showEfficiencyData == false){
      this.phast.modifications[this.exploreModIndex].phast.systemEfficiency = this.phast.systemEfficiency;
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusOut() {

  }
}
