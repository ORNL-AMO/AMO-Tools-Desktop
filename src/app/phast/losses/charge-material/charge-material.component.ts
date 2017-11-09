import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ChargeMaterial, SolidChargeMaterial, GasChargeMaterial, LiquidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { ChargeMaterialService } from './charge-material.service';
import { ChargeMaterialCompareService } from './charge-material-compare.service';
import { Settings } from '../../../shared/models/settings';

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

  _chargeMaterial: Array<any>;
  firstChange: boolean = true;
  resultsUnit: string;
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
        }
      }
    })
    if (this.isBaseline) {
      this.chargeMaterialService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._chargeMaterial.push({
            chargeMaterialType: 'Solid',
            solidForm: this.chargeMaterialService.initSolidForm(),
            liquidForm: this.chargeMaterialService.initLiquidForm(),
            gasForm: this.chargeMaterialService.initGasForm(),
            name: 'Material #' + (this._chargeMaterial.length + 1),
            heatRequired: 0.0,
            modifiedHeatRequired: 0.0
          });
        }
      })
    } else {
      this.chargeMaterialService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._chargeMaterial.push({
            chargeMaterialType: 'Solid',
            solidForm: this.chargeMaterialService.initSolidForm(),
            liquidForm: this.chargeMaterialService.initLiquidForm(),
            gasForm: this.chargeMaterialService.initGasForm(),
            name: 'Material #' + (this._chargeMaterial.length + 1),
            heatRequired: 0.0,
            modifiedHeatRequired: 0.0
          });
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.chargeMaterialCompareService.baselineMaterials = null;
      this.chargeMaterialService.addLossBaselineMonitor.next(false);
    } else {
      this.chargeMaterialCompareService.modifiedMaterials = null;
      this.chargeMaterialService.addLossModificationMonitor.next(false);
    }
    this.chargeMaterialService.deleteLossIndex.next(null);
  }

  initChargeMaterial() {
    this.losses.chargeMaterials.forEach(loss => {
      if (loss.chargeMaterialType == 'Gas') {
        let tmpLoss = {
          chargeMaterialType: 'Gas',
          solidForm: this.chargeMaterialService.initSolidForm(),
          liquidForm: this.chargeMaterialService.initLiquidForm(),
          gasForm: this.chargeMaterialService.getGasChargeMaterialForm(loss.gasChargeMaterial),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.gasChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Solid') {
        let tmpLoss = {
          chargeMaterialType: 'Solid',
          solidForm: this.chargeMaterialService.getSolidChargeMaterialForm(loss.solidChargeMaterial),
          liquidForm: this.chargeMaterialService.initLiquidForm(),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.solidChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
      else if (loss.chargeMaterialType == 'Liquid') {
        let tmpLoss = {
          chargeMaterialType: 'Liquid',
          solidForm: this.chargeMaterialService.initSolidForm(),
          liquidForm: this.chargeMaterialService.getLiquidChargeMaterialForm(loss.liquidChargeMaterial),
          gasForm: this.chargeMaterialService.initGasForm(),
          name: 'Material #' + (this._chargeMaterial.length + 1),
          heatRequired: loss.liquidChargeMaterial.heatRequired || 0.0
        };
        this.calculate(tmpLoss);
        this._chargeMaterial.push(tmpLoss);
      }
    })
  }

  addMaterial() {
    if (this.isLossesSetup) {
      this.chargeMaterialService.addLoss(this.isBaseline);
    }
    if (this.chargeMaterialCompareService.differentArray) {
      this.chargeMaterialCompareService.addObject(this.chargeMaterialCompareService.differentArray.length - 1);
    }
    this._chargeMaterial.push({
      chargeMaterialType: 'Solid',
      solidForm: this.chargeMaterialService.initSolidForm(),
      liquidForm: this.chargeMaterialService.initLiquidForm(),
      gasForm: this.chargeMaterialService.initGasForm(),
      name: 'Material #' + (this._chargeMaterial.length + 1),
      heatRequired: 0.0,
      modifiedHeatRequired: 0.0
    });

  }

  removeMaterial(lossIndex: number) {
    this.chargeMaterialService.setDelete(lossIndex);
  }

  renameMaterial() {
    let index = 1;
    this._chargeMaterial.forEach(material => {
      material.name = 'Material #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    if (loss.chargeMaterialType == 'Solid') {
      if (loss.solidForm.status == 'VALID') {
        let tmpSolidMaterial: SolidChargeMaterial = this.chargeMaterialService.buildSolidChargeMaterial(loss.solidForm);
        loss.heatRequired = this.phastService.solidLoadChargeMaterial(tmpSolidMaterial, this.settings);
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType == 'Liquid') {
      if (loss.liquidForm.status == 'VALID') {
        let tmpLiquidMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(loss.liquidForm);
        loss.heatRequired = this.phastService.liquidLoadChargeMaterial(tmpLiquidMaterial, this.settings);
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType == 'Gas') {
      if (loss.gasForm.status == 'VALID') {
        let tmpGasMaterial = this.chargeMaterialService.buildGasChargeMaterial(loss.gasForm);
        loss.heatRequired = this.phastService.gasLoadChargeMaterial(tmpGasMaterial, this.settings);
      } else {
        loss.heatRequired = null
      }
    }
  }

  saveLosses() {
    let tmpChargeMaterials = new Array<ChargeMaterial>();
    this._chargeMaterial.forEach(material => {
      if (material.chargeMaterialType == 'Gas') {
        let tmpGasMaterial = this.chargeMaterialService.buildGasChargeMaterial(material.gasForm);
        tmpGasMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Gas',
          gasChargeMaterial: tmpGasMaterial
        })
      } else if (material.chargeMaterialType == 'Solid') {
        let tmpSolidMaterial = this.chargeMaterialService.buildSolidChargeMaterial(material.solidForm);
        tmpSolidMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Solid',
          solidChargeMaterial: tmpSolidMaterial
        })
      } else if (material.chargeMaterialType == 'Liquid') {
        let tmpLiquidMaterial = this.chargeMaterialService.buildLiquidChargeMaterial(material.liquidForm);
        tmpLiquidMaterial.heatRequired = material.heatRequired;
        tmpChargeMaterials.push({
          chargeMaterialType: 'Liquid',
          liquidChargeMaterial: tmpLiquidMaterial
        })
      }
    })
    this.losses.chargeMaterials = tmpChargeMaterials;
    this.setCompareVals();
    this.savedLoss.emit(true);
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
}
