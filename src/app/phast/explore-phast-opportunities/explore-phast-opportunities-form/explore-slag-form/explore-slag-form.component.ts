import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-explore-slag-form',
    templateUrl: './explore-slag-form.component.html',
    styleUrls: ['./explore-slag-form.component.css'],
    standalone: false
})
export class ExploreSlagFormComponent implements OnInit {
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

  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }

  initData() {
    let check = (this.phast.losses.slagLosses[0].weight !== this.phast.modifications[this.exploreModIndex].phast.losses.slagLosses[0].weight);
    this.phast.modifications[this.exploreModIndex].exploreOppsShowSlag = { hasOpportunity: check, display: 'Reduce Slag' };

  }

  toggleSlag() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowSlag.hasOpportunity === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.slagLosses[0].weight = this.phast.losses.slagLosses[0].weight;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }
}
