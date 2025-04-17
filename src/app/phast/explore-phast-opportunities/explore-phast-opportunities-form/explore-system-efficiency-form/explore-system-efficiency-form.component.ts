import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';

@Component({
    selector: 'app-explore-system-efficiency-form',
    templateUrl: './explore-system-efficiency-form.component.html',
    styleUrls: ['./explore-system-efficiency-form.component.css'],
    standalone: false
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
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();

  constructor() { }

  ngOnInit() {
    this.initEfficiency();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initEfficiency();
      }
    }
  }
  initEfficiency() {
    if (this.phast.systemEfficiency !== this.phast.modifications[this.exploreModIndex].phast.systemEfficiency) {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowEfficiencyData = { hasOpportunity: true, display: 'Improve Furnace Efficiency' };
    } else {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowEfficiencyData = { hasOpportunity: false, display: 'Improve Furnace Efficiency' };
    }
  }

  toggleEfficiency() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowEfficiencyData.hasOpportunity === false) {
      this.phast.modifications[this.exploreModIndex].phast.systemEfficiency = this.phast.systemEfficiency;
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Heat System Efficiency',
      step: 1,
      componentStr: 'heat-system-efficiency'
    });
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusOut() {
    this.changeField.emit('default');
  }
}
