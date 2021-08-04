import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';
import { WallFormService, WallLossWarnings } from '../../../../calculator/furnaces/wall/wall-form.service';

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
  baselineWarnings: Array<WallLossWarnings>;
  modificationWarnings: Array<WallLossWarnings>;
  constructor(private wallFormService: WallFormService) { }

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
    this.showSurfaceTemp = new Array();
    this.baselineWarnings = new Array<WallLossWarnings>();
    this.modificationWarnings = new Array<WallLossWarnings>();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowWall = { hasOpportunity: false, display: 'Add / Improve Wall Insulation' };
    
    let index: number = 0;
    this.phast.losses.wallLosses.forEach(loss => {
      let check: boolean = this.initSurfaceTemp(loss.surfaceTemperature, this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowWall.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowWall = { hasOpportunity: check, display: 'Add / Improve Wall Insulation' };
      }
      this.showSurfaceTemp.push(check);
      let tmpWarnings: WallLossWarnings = this.wallFormService.checkWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.wallFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index]);
      this.modificationWarnings.push(tmpWarnings);
      index++;
    });
  }


  initSurfaceTemp(temp1: number, temp2: number) {
    if (temp1 !== temp2) {
      return true;
    } else {
      return false;
    }
  }

  toggleWall() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowWall.hasOpportunity === false) {
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
    if (this.showSurfaceTemp[index] === false) {
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
    });
  }

  checkModificationWarnings(index: number) {
    let tmpWarnings: WallLossWarnings = this.wallFormService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index]);
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkBaselineWarnings(index: number) {
    let tmpWarnings: WallLossWarnings = this.wallFormService.checkWarnings(this.phast.losses.wallLosses[index]);
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

}
