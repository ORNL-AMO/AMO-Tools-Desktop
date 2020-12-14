import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { SolidChargeMaterial, LiquidChargeMaterial, GasChargeMaterial } from '../../../../shared/models/phast/losses/chargeMaterial';
import { LossTab } from '../../../tabs';
import { ChargeMaterialService } from '../../../../calculator/furnaces/charge-material/charge-material.service';

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
  showTemp: Array<boolean>;
  baselineWarnings: Array<string>;
  modificationWarnings: Array<string>;
  constructor(private chargeMaterialService: ChargeMaterialService) { }

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
    this.showTemp = new Array();
    this.materials = new Array<ExploreMaterial>();
    this.baselineWarnings = new Array<string>();
    this.modificationWarnings = new Array<string>();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowMaterial = { hasOpportunity: false, display: 'Preheat Charge Material' }; 
    let index = 0;
    this.phast.losses.chargeMaterials.forEach(material => {
      this.baselineWarnings.push(null);
      this.modificationWarnings.push(null);
      let tmpBaseline: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
      let tmpModified: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
      if (material.chargeMaterialType === 'Solid') {
        tmpBaseline = material.solidChargeMaterial;
      } else if (material.chargeMaterialType === 'Liquid') {
        tmpBaseline = material.liquidChargeMaterial;
      } else if (material.chargeMaterialType === 'Gas') {
        tmpBaseline = material.gasChargeMaterial;
      }
      if (this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].chargeMaterialType === 'Solid') {
        tmpModified = this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].solidChargeMaterial;
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].chargeMaterialType === 'Liquid') {
        tmpModified = this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].liquidChargeMaterial;
      } else if (this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].chargeMaterialType === 'Gas') {
        tmpModified = this.phast.modifications[this.exploreModIndex].phast.losses.chargeMaterials[index].gasChargeMaterial;
      }
      let checkTemp: boolean = this.checkVal(tmpBaseline.initialTemperature, tmpModified.initialTemperature);
      this.checkBaselineWarnings(tmpBaseline, index);
      this.checkModificationWarning(tmpModified, index);
      let testVal = checkTemp;
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowMaterial.hasOpportunity && testVal) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowMaterial = { hasOpportunity: true, display: 'Preheat Charge Material' }; 
      }
      this.showTemp.push(checkTemp);
      this.materials;
      this.materials.push({
        baseline: tmpBaseline,
        modification: tmpModified,
        type: material.chargeMaterialType,
        name: material.name
      });
      index++;
    });
  }

  checkVal(val1: number, val2: number): boolean {
    if (val1 !== val2) {
      return true;
    } else {
      return false;
    }
  }

  checkBaselineWarnings(material: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial, index: number) {
    this.baselineWarnings[index] = this.chargeMaterialService.checkInitialTemp(material);
    this.calculate();
  }

  checkModificationWarning(material: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial, index: number) {
    this.modificationWarnings[index] = this.chargeMaterialService.checkInitialTemp(material);
    this.calculate();
  }

  toggleInitialTemp(index: number, material: ExploreMaterial) {
    if (this.showTemp[index] === false) {
      material.modification.initialTemperature = material.baseline.initialTemperature;
      this.modificationWarnings[index] = this.baselineWarnings[index];
      this.calculate();
    }
  }

  toggleMaterials() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowMaterial.hasOpportunity === false) {
      let index = 0;
      this.materials.forEach(material => {
        this.showTemp[index] = false;
        this.toggleInitialTemp(index, material);
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Charge Material',
      step: 1,
      next: 2,
      componentStr: 'charge-material',
      showAdd: true
    });
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }
}

export interface ExploreMaterial {
  baseline: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
  modification: SolidChargeMaterial | LiquidChargeMaterial | GasChargeMaterial;
  type: string;
  name: string;
}

