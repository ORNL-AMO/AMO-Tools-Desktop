import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';

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
  surfaceTempError1: Array<string>;
  surfaceTempError2: Array<string>;
  constructor() { }

  ngOnInit() {
    this.initData();
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes.exploreModIndex){
      if(!changes.exploreModIndex.isFirstChange()){
        this.initData();
      }
    }
  }

  initData() {
    this.showSurfaceTemp = new Array();
    this.surfaceTempError1 = new Array<string>();
    this.surfaceTempError2 = new Array<string>();
    let index: number = 0;
    this.phast.losses.wallLosses.forEach(loss => {
      let check: boolean = this.initSurfaceTemp(loss.surfaceTemperature, this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature);
      if (!this.showSurfaceTemp && check) {
        this.showWall = check;
      }
      this.showSurfaceTemp.push(check);
      this.surfaceTempError1.push(null);
      this.surfaceTempError2.push(null);
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
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleSurfaceTemp(index: number, baselineArea: number) {
    if(this.showSurfaceTemp[index] == false){
      this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].surfaceTemperature = baselineArea;      
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

  checkSurfaceTemp(num: number, surfaceTemp: number, index: number) {
    if(num == 1){
      if(surfaceTemp < this.phast.losses.wallLosses[index].ambientTemperature){
        this.surfaceTempError1[index] = 'Surface temperature lower is than ambient temperature (' +this.phast.losses.wallLosses[index].ambientTemperature+')';
      }else{
        this.surfaceTempError1[index] = null;
      }
    }else if(num ==2){
      if(surfaceTemp < this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].ambientTemperature){
        this.surfaceTempError2[index] = 'Surface temperature lower is than ambient temperature (' +this.phast.modifications[this.exploreModIndex].phast.losses.wallLosses[index].ambientTemperature+')';
      }else{
        this.surfaceTempError2[index] = null;
      }
    }
  }

  focusOut() {

  }

  calculate(){
    this.emitCalculate.emit(true)
  }

}
