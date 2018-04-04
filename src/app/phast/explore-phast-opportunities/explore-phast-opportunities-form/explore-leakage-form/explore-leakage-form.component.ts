import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';

@Component({
  selector: 'app-explore-leakage-form',
  templateUrl: './explore-leakage-form.component.html',
  styleUrls: ['./explore-leakage-form.component.css']
})
export class ExploreLeakageFormComponent implements OnInit {
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


  showOpening: Array<boolean>;
  showLeakage: boolean = false;
  openingAreaError1: Array<string>;
  openingAreaError2: Array<string>;
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
    this.showOpening = new Array();
    this.openingAreaError1 = new Array<string>();
    this.openingAreaError2 = new Array<string>();
    let index: number = 0;
    this.phast.losses.leakageLosses.forEach(loss => {
      let check: boolean = this.initOpening(loss.openingArea, this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea);
      if (!this.showOpening && check) {
        this.showLeakage = check;
      }
      this.showOpening.push(check);
      this.openingAreaError1.push(null);
      this.openingAreaError2.push(null);
      index++;
    })
  }


  initOpening(area1: number, area2: number) {
    if (area1 != area2) {
      return true;
    } else {
      return false;
    }
  }

  toggleLeakage() {
    if (this.showLeakage == false) {
      let index: number = 0;
      this.phast.losses.leakageLosses.forEach(loss => {
        let baselineArea: number = loss.openingArea;
        this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea = baselineArea;
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleOpening(index: number, baselineArea: number) {
    if (this.showOpening[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea = baselineArea;
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Gas Leakage',
      step: 7,
      next: 8,
      back: 6,
      componentStr: 'gas-leakage-losses',
      showAdd: true
    })
  }

  checkOpening(num: number, openingArea: number, index: number) {
    if (openingArea < 0) {
      if (num == 1) {
        this.openingAreaError1[index] = 'Opening Area must be equal or greater than 0';
      } else if (num == 2) {
        this.openingAreaError2[index] = 'Opening Area must be equal or greater than 0';
      }
    } else {
      if (num == 1) {
        this.openingAreaError1[index] = null;
      } else if (num == 2) {
        this.openingAreaError2[index] = null;
      }
    }
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }

}
