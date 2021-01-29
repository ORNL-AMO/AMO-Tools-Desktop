import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { ChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { LiquidMaterialFormService } from '../../../calculator/furnaces/charge-material/liquid-material-form/liquid-material-form.service';
import { GasMaterialFormService } from '../../../calculator/furnaces/charge-material/gas-material-form/gas-material-form.service';
import { SolidMaterialFormService } from '../../../calculator/furnaces/charge-material/solid-material-form/solid-material-form.service';

@Component({
  selector: 'app-charge-material',
  templateUrl: './charge-material.component.html',
  styleUrls: ['./charge-material.component.css']
})
export class ChargeMaterialComponent implements OnInit {
  @Input()
  losses: Losses;
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
  inSetup: boolean;
  @Input()
  modExists: boolean;
  @Input()
  modificationIndex: number;

  _chargeMaterial: Array<ChargeMaterialObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  disableType: boolean = false;
  lossesLocked: boolean = false;

  showError: boolean = false;
  total: {
    heatRequired: number,
    netHeatLoss: number,
    endoExoHeat: number
  };
  idString: string;
  constructor(private phastService: PhastService, 
              private liquidMaterialFormService: LiquidMaterialFormService,
              private gasMaterialFormService: GasMaterialFormService,
              private solidMaterialFormService: SolidMaterialFormService
    ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addMaterial();
      } else if (changes.modificationIndex) {
        this._chargeMaterial = new Array();
        this.initChargeMaterial();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification';
    }
    else {
      this.idString = '_baseline';
    }
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
    if (!this._chargeMaterial) {
      this._chargeMaterial = new Array();
    }
    if (this.losses.chargeMaterials) {
      this.initChargeMaterial();
    }
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }
  
  initChargeMaterial() {
    let lossIndex = 1;
    this.losses.chargeMaterials.forEach(loss => {
      if (!loss.name) {
        loss.name = 'Loss #' + lossIndex;
      }
      let tmpLoss: ChargeMaterialObj;
      if (loss.chargeMaterialType === 'Gas') {
        tmpLoss = {
          chargeMaterialType: 'Gas',
          solidForm: this.solidMaterialFormService.initSolidForm(lossIndex),
          liquidForm: this.liquidMaterialFormService.initLiquidForm(lossIndex),
          gasForm: this.gasMaterialFormService.getGasChargeMaterialForm(loss),
          heatRequired: loss.gasChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.gasChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.gasChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      else if (loss.chargeMaterialType === 'Solid') {
        tmpLoss = {
          chargeMaterialType: 'Solid',
          solidForm: this.solidMaterialFormService.getSolidChargeMaterialForm(loss),
          liquidForm: this.liquidMaterialFormService.initLiquidForm(lossIndex),
          gasForm: this.gasMaterialFormService.initGasForm(lossIndex),
          heatRequired: loss.solidChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.solidChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.solidChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      else if (loss.chargeMaterialType === 'Liquid') {
        tmpLoss = {
          chargeMaterialType: 'Liquid',
          solidForm: this.solidMaterialFormService.initSolidForm(lossIndex),
          liquidForm: this.liquidMaterialFormService.getLiquidChargeMaterialForm(loss),
          gasForm: this.gasMaterialFormService.initGasForm(lossIndex),
          heatRequired: loss.liquidChargeMaterial.heatRequired || 0.0,
          netHeatLoss: loss.liquidChargeMaterial.netHeatLoss || 0.0,
          endoExoHeat: loss.liquidChargeMaterial.endoExoHeat || 0.0,
          collapse: false
        };
      }
      this.calculate(tmpLoss);
      this._chargeMaterial.push(tmpLoss);
      this.total = this.getTotal();
    });
  }

  addMaterial() {
    this._chargeMaterial.push({
      chargeMaterialType: 'Solid',
      solidForm: this.solidMaterialFormService.initSolidForm(this._chargeMaterial.length + 1),
      liquidForm: this.liquidMaterialFormService.initLiquidForm(this._chargeMaterial.length + 1),
      gasForm: this.gasMaterialFormService.initGasForm(this._chargeMaterial.length + 1),
      heatRequired: 0.0,
      netHeatLoss: 0.0,
      endoExoHeat: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeMaterial(lossIndex: number) {
    this._chargeMaterial.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  collapseLoss(loss: ChargeMaterialObj) {
    loss.collapse = !loss.collapse;
  }

  calculate(loss: ChargeMaterialObj) {
    if (loss.chargeMaterialType === 'Solid') {
      if (loss.solidForm.status === 'VALID') {
        let tmpMaterial: ChargeMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(loss.solidForm);
        const results = this.phastService.solidLoadChargeMaterial(tmpMaterial.solidChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType === 'Liquid') {
      if (loss.liquidForm.status === 'VALID') {
        let tmpMaterial: ChargeMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(loss.liquidForm);
        const results = this.phastService.liquidLoadChargeMaterial(tmpMaterial.liquidChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    } else if (loss.chargeMaterialType === 'Gas') {
      if (loss.gasForm.status === 'VALID') {
        let tmpMaterial: ChargeMaterial = this.gasMaterialFormService.buildGasChargeMaterial(loss.gasForm);
        const results = this.phastService.gasLoadChargeMaterial(tmpMaterial.gasChargeMaterial, this.settings);
        loss.heatRequired = results.grossHeatLoss;
        loss.netHeatLoss = results.netHeatLoss;
        loss.endoExoHeat = results.endoExoHeat;
      } else {
        loss.heatRequired = null;
      }
    }
    this.total = this.getTotal();
  }

  saveLosses() {
    let tmpChargeMaterials = new Array<ChargeMaterial>();
    let lossIndex = 1;
    this._chargeMaterial.forEach(material => {
      let tmpMaterial: ChargeMaterial;
      if (material.chargeMaterialType === 'Gas') {
        if (!material.gasForm.controls.name.value) {
          material.gasForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.gasMaterialFormService.buildGasChargeMaterial(material.gasForm);
        tmpMaterial.gasChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Gas';
      } else if (material.chargeMaterialType === 'Solid') {
        if (!material.solidForm.controls.name.value) {
          material.solidForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.solidMaterialFormService.buildSolidChargeMaterial(material.solidForm);
        tmpMaterial.solidChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Solid';
      } else if (material.chargeMaterialType === 'Liquid') {
        if (!material.liquidForm.controls.name.value) {
          material.liquidForm.patchValue({
            name: 'Material #' + lossIndex
          });
        }
        lossIndex++;
        tmpMaterial = this.liquidMaterialFormService.buildLiquidChargeMaterial(material.liquidForm);
        tmpMaterial.liquidChargeMaterial.heatRequired = material.heatRequired;
        tmpMaterial.chargeMaterialType = 'Liquid';
      }
      tmpChargeMaterials.push(tmpMaterial);
    });
    this.losses.chargeMaterials = tmpChargeMaterials;
    this.savedLoss.emit(true);
  }

  getTotal() {
    let total = {
      heatRequired: _.sumBy(this._chargeMaterial, 'heatRequired'),
      netHeatLoss: _.sumBy(this._chargeMaterial, 'netHeatLoss'),
      endoExoHeat: _.sumBy(this._chargeMaterial, 'endoExoHeat')
    };
    return total;
  }

  setName(material: any) {
    if (material.chargeMaterialType === 'Solid') {
      material.liquidForm.patchValue({
        name: material.solidForm.controls.name.value
      });
      material.gasForm.patchValue({
        name: material.solidForm.controls.name.value
      });
    } else if (material.chargeMaterialType === 'Liquid') {
      material.gasForm.patchValue({
        name: material.liquidForm.controls.name.value
      });
      material.solidForm.patchValue({
        name: material.liquidForm.controls.name.value
      });
    } else if (material.chargeMaterialType === 'Gas') {
      material.liquidForm.patchValue({
        name: material.gasForm.controls.name.value
      });
      material.solidForm.patchValue({
        name: material.gasForm.controls.name.value
      });
    }
    this.saveLosses();
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  focusOut() {
    this.fieldChange.emit('default');
  }
  setError(bool: boolean) {
    this.showError = bool;
  }
}


export interface ChargeMaterialObj {
  chargeMaterialType: string;
  solidForm: FormGroup;
  liquidForm: FormGroup;
  gasForm: FormGroup;
  heatRequired: number;
  netHeatLoss: number;
  endoExoHeat: number;
  collapse: boolean;
}
