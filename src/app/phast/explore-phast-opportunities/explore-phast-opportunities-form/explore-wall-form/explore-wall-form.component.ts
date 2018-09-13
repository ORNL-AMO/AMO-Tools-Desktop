import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';
import { WallLossWarnings, WallLossesService } from '../../../losses/wall-losses/wall-losses.service';

@Component({
  selector: 'app-explore-wall-form',
  templateUrl: './explore-wall-form.component.html',
  styleUrls: ['./explore-wall-form.component.css']
})
export class ExploreWallFormComponent implements OnInit {
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

  showSurfaceTemp: Array<boolean>;
  showWall: boolean = false;
  baselineWarnings: Array<WallLossWarnings>;
  modificationWarnings: Array<WallLossWarnings>;
  constructor(private wallLossesService: WallLossesService) { }

  ngOnInit() {
    this.initData();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showWall = false;
        this.initData();
      }
    }
  }

  initData() {
    this.showSurfaceTemp = new Array();
    this.baselineWarnings = new Array<WallLossWarnings>();
    this.modificationWarnings = new Array<WallLossWarnings>();
    let index: number = 0;
    this.phast.losses.wallLosses.forEach(loss => {
      let check: boolean = this.initSurfaceTemp(loss.surfaceTemperature, this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature);
      if (!this.showWall && check) {
        this.showWall = check;
      }
      this.showSurfaceTemp.push(check);
      let tmpWarnings: WallLossWarnings = this.wallLossesService.checkWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.wallLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index])
      this.modificationWarnings.push(tmpWarnings);
      index++;
    })
  }


  initSurfaceTemp(temp1: number, temp2: number) {
    if (temp1 != temp2) {
      return true;
    } else {
      return false;
    }
  }

  toggleWall() {
    if (this.showWall == false) {
      let index: number = 0;
      this.phast.losses.wallLosses.forEach(loss => {
        let baselineTemp: number = loss.surfaceTemperature;
        this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature = baselineTemp;
        this.checkModificationWarnings(index);
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleSurfaceTemp(index: number, baselineArea: number) {
    if (this.showSurfaceTemp[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature = baselineArea;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Wall',
      step: 3,
      componentStr: 'wall-losses',
    })
  }

  checkModificationWarnings(index: number) {
    let tmpWarnings: WallLossWarnings = this.wallLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index])
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkBaselineWarnings(index: number) {
    let tmpWarnings: WallLossWarnings = this.wallLossesService.checkWarnings(this.phast.losses.wallLosses[index])
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true)
  }

}
