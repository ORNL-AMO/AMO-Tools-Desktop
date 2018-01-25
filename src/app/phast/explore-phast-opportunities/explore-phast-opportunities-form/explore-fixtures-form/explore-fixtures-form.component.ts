import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';

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
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();
  showFeedRate: Array<boolean>;
  showFixtures: boolean = false;
  feedRateError1: Array<string>;
  feedRateError2: Array<string>;
  constructor() { }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.showFeedRate = new Array();
    this.feedRateError1 = new Array<string>();
    this.feedRateError2 = new Array<string>();
    let index: number = 0;
    this.phast.losses.fixtureLosses.forEach(loss => {
      let check: boolean = this.initFeedRate(loss.feedRate, this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate);
      if (!this.showFixtures && check) {
        this.showFixtures = check;
      }
      this.showFeedRate.push(check);
      this.feedRateError1.push(null);
      this.feedRateError2.push(null);
      index++;
    })
  }


  initFeedRate(rate1: number, rate2: number) {
    if (rate1 != rate2) {
      return true;
    } else {
      return false;
    }
  }

  toggleFixtures() {
    if (this.showFixtures == false) {
      let index: number = 0;
      this.phast.losses.fixtureLosses.forEach(loss => {
        let baselineFeedRate: number = loss.feedRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleFeedRate(index: number, baselineFeedRate: number) {
    if(this.showFeedRate[index] == false){
      this.phast.modifications[this.exploreModIndex].phast.losses.fixtureLosses[index].feedRate = baselineFeedRate;
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Fixtures, Trays, etc.',
      step: 2,
      next: 3,
      back: 1,
      componentStr: 'fixture-losses',
      showAdd: true 
    })
  }

  checkFeedRate(num: number, feedRate: number, index: number) {
    if (feedRate < 0) {
      if (num == 1) {
        this.feedRateError1[index] = 'Fixture Weight feed rate must be greater than 0';
      } else if (num == 2) {
        this.feedRateError2[index] = 'Fixture Weight feed rate must be greater than 0';
      }
    } else {
      if (num == 1) {
        this.feedRateError1[index] = null;
      } else if (num == 2) {
        this.feedRateError2[index] = null;
      }
    }
  }

  focusOut() {

  }

  calculate(){
    this.emitCalculate.emit(true)
  }
}
