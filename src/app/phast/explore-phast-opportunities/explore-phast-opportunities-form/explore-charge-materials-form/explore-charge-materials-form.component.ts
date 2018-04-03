import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { SolidChargeMaterial, LiquidChargeMaterial, GasChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { LossTab } from '../../../tabs';

@Component({
  selector: 'app-explore-charge-materials-form',
  templateUrl: './explore-charge-materials-form.component.html',
  styleUrls: ['./explore-charge-materials-form.component.css']
})
export class ExploreChargeMaterialsFormComponent implements OnInit {
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

  materials: Array<ExploreMaterial>;
  showMaterial: boolean = false;
  showTemp: Array<boolean>;
  showFeedRate: Array<boolean>;
  feedRateError1: Array<string>;
  feedRateError2: Array<string>;
  constructor() { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {;
        this.initData();
      }
    }
  }
  initData(){
    this.showTemp = new Array();
    this.showFeedRate = new Array();
    this.materials = new Array<ExploreMaterial>();
    this.feedRateError1 = new Array<string>();
    this.feedRateError2 = new Array<string>();
    let index = 0;
    this.showMaterial = false;
    this.phast.losses.chargeMaterials.forEach(material => {
      let tmpBaseline: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
      let tmpModified: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
      if (material.chargeMaterialType == 'Solid') {
        tmpBaseline = material.solidChargeMaterial;
        tmpModified = this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].solidChargeMaterial;
      } else if (material.chargeMaterialType == 'Liquid') {
        tmpBaseline = material.liquidChargeMaterial;
        tmpModified = this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].liquidChargeMaterial;
      } else if (material.chargeMaterialType == 'Gas') {
        tmpBaseline = this.checkGasFeedRate(material.gasChargeMaterial);
        tmpModified = this.checkGasFeedRate(this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].gasChargeMaterial);
      }
      let checkTemp: boolean = this.checkVal(tmpBaseline.initialTemperature, tmpModified.initialTemperature);
      let checkFeedRate: boolean = this.checkVal(tmpBaseline.chargeFeedRate, tmpModified.chargeFeedRate);

      let testVal = checkTemp || checkFeedRate;
      if (!this.showMaterial && testVal) {
        this.showMaterial = true;
      }
      this.showFeedRate.push(checkFeedRate);
      this.showTemp.push(checkTemp);
      this.feedRateError1.push(null);
      this.feedRateError2.push(null);
      this.materials
      this.materials.push({
        baseline: tmpBaseline,
        modification: tmpModified,
        type: material.chargeMaterialType,
        name: material.name
      })
      index++;
    })
  }



  checkGasFeedRate(gasChargeMaterial: GasChargeMaterial) {
    if (gasChargeMaterial.feedRate != gasChargeMaterial.chargeFeedRate) {
      gasChargeMaterial.chargeFeedRate = gasChargeMaterial.feedRate;
    }
    return gasChargeMaterial;
  }


  checkVal(val1: number, val2: number): boolean {
    if (val1 != val2) {
      return true;
    } else {
      return false;
    }
  }

  checkFeedRateError(num: number, material: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial, index: number) {
    material.feedRate = material.chargeFeedRate;
    if (material.chargeFeedRate < 0) {
      if (num == 1) {
        this.feedRateError1[index] = 'Feed Reed must be greater than 0';
      } else if (num == 2) {
        this.feedRateError2[index] = 'Feed Rate must be greater than 0';
      }
    } else {
      if (num == 1) {
        this.feedRateError1[index] = null;
      } else if (num == 2) {
        this.feedRateError2[index] = null;
      }
    }
    this.calculate();
  }

  toggleFeedRate(index: number, material: ExploreMaterial) {
    if(this.showFeedRate[index] == false){
      material.modification.chargeFeedRate = material.baseline.chargeFeedRate;
      material.modification.feedRate = material.modification.chargeFeedRate;
      material.baseline.feedRate = material.baseline.chargeFeedRate;
      this.calculate();
    }
  }

  toggleInitialTemp(index: number, material: ExploreMaterial) {
    if(this.showTemp[index] == false){
      material.modification.initialTemperature = material.baseline.initialTemperature;
      this.calculate();
    }
  }

  toggleMaterials() {
    if(this.showMaterial == false){
      let index = 0;
      this.materials.forEach(material => {
        this.showTemp[index] = false;
        this.showFeedRate[index] = false;
        this.toggleFeedRate(index, material);
        this.toggleInitialTemp(index, material);
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit( {
      tabName: 'Charge Material',
      step: 1,
      next: 2,
      componentStr: 'charge-material',
      showAdd: true  
  });
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}

export interface ExploreMaterial {
  baseline: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial,
  modification: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial,
  type: string,
  name: string
}

