import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ChargeMaterial, SolidChargeMaterial, GasChargeMaterial, LiquidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { ChargeMaterialService } from './charge-material.service';
import { ChargeMaterialCompareService } from './charge-material-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;
  @Input()
  isLossesSetup: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modExists: boolean;

  _chargeMaterial: Array<ChargeMaterialObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  disableType: boolean = false;
  lossesLocked: boolean = false;

  showError: boolean = false;
  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private chargeMaterialService: ChargeMaterialService, private chargeMaterialCompareService: ChargeMaterialCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
      if (changes.addLossToggle) {
        this.addMaterial();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._chargeMaterial) {
      this._chargeMaterial = new Array();
    }
    if (this.losses.chargeMaterials) {
      this.setCompareVals();
      this.chargeMaterialCompareService.initCompareObjects();
      this.initChargeMaterial();
    }

    this.chargeMaterialService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.chargeMaterials) {
          this._chargeMaterial.splice(lossIndex, 1);
          if (this.chargeMaterialCompareService.differentArray && !this.isBaseline) {
            this.chargeMaterialCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.chargeMaterialService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._chargeMaterial.push({
    //         chargeMaterialType: 'Solid',
    //         solidForm: this.chargeMaterialService.initSolidForm(),
    //         liquidForm: this.chargeMaterialService.initLiquidForm(),
    //         gasForm: this.chargeMaterialService.initGasForm(),
    //         name: 'Material #' + (this._chargeMaterial.length + 1),
    //         heatRequired: 0.0,
    //         modifiedHeatRequired: 0.0,
    //         collapse: false
    //       });
    //     }
    //   })
    // } else {
    //   this.chargeMaterialService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._chargeMaterial.push({
    //         chargeMaterialType: 'Solid',
    //         solidForm: this.chargeMaterialService.initSolidForm(),
    //         liquidForm: this.chargeMaterialService.initLiquidForm(),
    //         gasForm: this.chargeMaterialService.initGasForm(),
    //         name: 'Material #' + (this._chargeMaterial.length + 1),
    //         heatRequired: 0.0,
    //         modifiedHeatRequired: 0.0,
    //         collapse: false
    //       });
    //     }
    //   })
    // }
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.chargeMaterialCompareService.baselineMaterials = null;
      //  this.chargeMaterialService.addLossBaselineMonitor.next(false);
    } else {
      this.chargeMaterialCompareService.modifiedMaterials = null;
      // this.chargeMaterialService.addLossModificationMonitor.next(false);
    }
    this.chargeMaterialService.deleteLossIndex.next(null);
  }
  disableForms() {
    this._chargeMaterial.forEach(loss => {
      loss.solidForm.disable();
      loss.liquidForm.disable();
      loss.gasForm.disable();
    })
  }
  initChargeMaterial() {
    let lossIndex = 1;
    this.losses.chargeMaterials.forEach(loss => {
      if (!loss.name) {
        loss.name = 'Loss #' + lossIndex;
      }
      let tmpLoss: ChargeMaterialObj;
      if (loss.chargeMaterialType == 'Gas') {
        tmpLoss = {
          chargeMaterialType: 'Gas',
          solidForm: this.chargeMaterialService.initSolidForm(lossIndex),
          liquidForm: this.chargeMaterialService.initLiquidForm(lossIndex),
          gasForm: this.chargeMaterialService.getGasChargeMaterialForm(loss),
          heatRequired: loss.gasChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.gasChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.gasChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      else if (loss.chargeMaterialType == 'Solid') {
        tmpLoss = {
          chargeMaterialType: 'Solid',
          solidForm: this.chargeMaterialService.getSolidChargeMaterialForm(loss),
          liquidForm: this.chargeMaterialService.initLiquidForm(lossIndex),
          gasForm: this.chargeMaterialService.initGasForm(lossIndex),
          heatRequired: loss.solidChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.solidChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.solidChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      else if (loss.chargeMaterialType == 'Liquid') {
        tmpLoss = {
          chargeMaterialType: 'Liquid',
          solidForm: this.chargeMaterialService.initSolidForm(lossIndex),
          liquidForm: this.chargeMaterialService.getLiquidChargeMaterialForm(loss),
          gasForm: this.chargeMaterialService.initGasForm(lossIndex),
          heatRequired: loss.liquidChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.liquidChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.liquidChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      this.calculate(tmpLoss);
      this._chargeMaterial.push(tmpLoss);
    })
  }

  addMaterial() {
    // if (this.isLossesSetup) {
    //   this.chargeMaterialService.addLoss(this.isBaseline);
    // }
    if (this.chargeMaterialCompareService.differentArray) {
      this.chargeMaterialCompareService.addObject(this.chargeMaterialCompareService.differentArray.length - 1);
    }
    this._chargeMaterial.push({
      chargeMaterialType: 'Solid',
      solidForm: this.chargeMaterialService.initSolidForm(this._chargeMaterial.length + 1),
      liquidForm: this.chargeMaterialService.initLiquidForm(this._chargeMaterial.length + 1),
      gasForm: this.chargeMaterialService.initGasForm(this._chargeMaterial.length + 1),
      heatRequired: 0.0,
      netHeatLoss: 0.0,
      endoExoHeat: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeMaterial(lossIndex: number) {
    this.chargeMaterialService.setDelete(lossIndex);
  }

  collapseLoss(loss: ChargeMaterialObj) {
    loss.collapse = !loss.collapse;
  }

  calculate(loss: ChargeMaterialObj) {
    if (loss.chargeMaterialType == 'Solid') {
      if (loss.solidForm.status == 'VALID') {
        let tmpMaterial: ChargeMaterial = this.chargeMaterialService.buildSolidChargeMaterial(loss.solidForm);
        const results = this.phastService.solidLoadChargeMaterial(tmpMaterial.solidChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType == 'Liquid') {
      if (loss.liquidForm.status == 'VALID') {
        let tmpMaterial: ChargeMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(loss.liquidForm);
        const results = this.phastService.liquidLoadChargeMaterial(tmpMaterial.liquidChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType == 'Gas') {
      if (loss.gasForm.status == 'VALID') {
        let tmpMaterial: ChargeMaterial = this.chargeMaterialService.buildGasChargeMaterial(loss.gasForm);
        const results = this.phastService.gasLoadChargeMaterial(tmpMaterial.gasChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    }
  }

  saveLosses() {
    let tmpChargeMaterials = new Array<ChargeMaterial>();
    let lossIndex = 1;
    this._chargeMaterial.forEach(material => {
      let tmpMaterial: ChargeMaterial;
      if (material.chargeMaterialType == 'Gas') {
        if (!material.gasForm.controls.name.value) {
          material.gasForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.chargeMaterialService.buildGasChargeMaterial(material.gasForm);
        tmpMaterial.gasChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Gas';
      } else if (material.chargeMaterialType == 'Solid') {
        if (!material.solidForm.controls.name.value) {
          material.solidForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.chargeMaterialService.buildSolidChargeMaterial(material.solidForm);
        tmpMaterial.solidChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Solid';
      } else if (material.chargeMaterialType == 'Liquid') {
        if (!material.liquidForm.controls.name.value) {
          material.liquidForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(material.liquidForm);
        tmpMaterial.liquidChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Liquid';
      }
      tmpChargeMaterials.push(tmpMaterial);
    });
    this.losses.chargeMaterials = tmpChargeMaterials;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  setName(material: any) {
    if (material.chargeMaterialType == 'Solid') {
      material.liquidForm.patchValue({
        name: material.solidForm.controls.name.value
      })
      material.gasForm.patchValue({
        name: material.solidForm.controls.name.value
      })
    } else if (material.chargeMaterialType == 'Liquid') {
      material.gasForm.patchValue({
        name: material.liquidForm.controls.name.value
      })
      material.solidForm.patchValue({
        name: material.liquidForm.controls.name.value
      })
    } else if (material.chargeMaterialType == 'Gas') {
      material.liquidForm.patchValue({
        name: material.gasForm.controls.name.value
      })
      material.solidForm.patchValue({
        name: material.gasForm.controls.name.value
      })
    }
  }


  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  focusOut() {
    this.fieldChange.emit('default');
  }
  setCompareVals() {
    if (this.isBaseline) {
      this.chargeMaterialCompareService.baselineMaterials = this.losses.chargeMaterials;
    } else {
      this.chargeMaterialCompareService.modifiedMaterials = this.losses.chargeMaterials;
    }
    if (this.chargeMaterialCompareService.differentArray && !this.isBaseline) {
      if (this.chargeMaterialCompareService.differentArray.length != 0) {
        this.chargeMaterialCompareService.checkChargeMaterials();
      }
    }
  }

  setError(bool: boolean){
    this.showError = bool;
  }
}


export interface ChargeMaterialObj {
  chargeMaterialType: string,
  solidForm: FormGroup,
  liquidForm: FormGroup,
  gasForm: FormGroup,
  heatRequired: number,
  netHeatLoss: number,
  endoExoHeat: number,
  collapse: boolean
}
