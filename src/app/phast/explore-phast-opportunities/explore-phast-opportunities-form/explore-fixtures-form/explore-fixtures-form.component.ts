import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-explore-fixtures-form',
  templateUrl: './explore-fixtures-form.component.html',
  styleUrls: ['./explore-fixtures-form.component.css']
})
export class ExploreFixturesFormComponent implements OnInit {
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

  showFeedRate: Array<boolean>;
  showChargeMaterials: boolean = false;
  feedRateError1: string = null;
  feedRateError2: string = null;
  constructor() { }

  ngOnInit() {
    this.showFeedRate = new Array();
    this.phast.losses.fixtureLosses.forEach(loss => {
      this.showFeedRate.push(false);
    })
  }


  toggleChargeMaterials() {

  }

  toggleFeedRate() {

  }

  focusField(str: string) {
    //this.changeField.emit(str);
  }

  checkFeedRate(num: number) {

  }

  focusOut(){

  }
}
