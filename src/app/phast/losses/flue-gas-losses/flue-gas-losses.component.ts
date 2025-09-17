import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FlueGas, FlueGasByVolumeSuiteResults, MaterialInputProperties } from '../../../shared/models/phast/losses/flueGas';
import { Losses } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { FlueGasFormService } from '../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { FlueGasCompareService } from './flue-gas-compare.service';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';
@Component({
  selector: 'app-flue-gas-losses',
  templateUrl: './flue-gas-losses.component.html',
  styleUrls: ['./flue-gas-losses.component.css'],
  standalone: false
})
export class FlueGasLossesComponent implements OnInit {
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

  _flueGasLosses: Array<FlueGasObj>;
  firstChange: boolean = true;
  resultsUnit: string;

  availableHeatError: string = null;
  showError: boolean = false;
  disableType: boolean = false;
  lossesLocked: boolean = false;
  idString: string;
  constructor(private phastService: PhastService,
    private flueGasFormService: FlueGasFormService,
    private cd: ChangeDetectorRef,
    private flueGasCompareService: FlueGasCompareService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService) { }

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
    if (!this._flueGasLosses) {
      this._flueGasLosses = new Array();
    }
    this.initFlueGasses();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._flueGasLosses = new Array();
        this.initFlueGasses();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  initFlueGasses() {
    if (this.losses.flueGasLosses) {
      let lossIndex = 1;
      this.losses.flueGasLosses.forEach(loss => {
        let tmpLoss;
        if (loss.flueGasType === "By Volume") {
          tmpLoss = {
            measurementType: 'By Volume',
            formByVolume: this.flueGasFormService.initByVolumeFormFromLoss(loss),
            formByMass: this.flueGasFormService.initEmptyMassForm(this.settings, lossIndex),
            heatLoss: 0.0,
            collapse: false
          };
        } else if (loss.flueGasType === "By Mass") {
          tmpLoss = {
            measurementType: 'By Mass',
            formByVolume: this.flueGasFormService.initEmptyVolumeForm(this.settings, lossIndex),
            formByMass: this.flueGasFormService.initByMassFormFromLoss(loss),
            availableHeat: 0.0,
            grossHeat: 0.0,
            systemLosses: 0.0,
            collapse: false
          };
        }
        if (!tmpLoss.formByVolume.controls.name.value) {
          tmpLoss.formByVolume.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        if (!tmpLoss.formByMass.controls.name.value) {
          tmpLoss.formByMass.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._flueGasLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._flueGasLosses.push({
      measurementType: 'By Volume',
      formByVolume: this.flueGasFormService.initEmptyVolumeForm(this.settings, this._flueGasLosses.length + 1),
      formByMass: this.flueGasFormService.initEmptyMassForm(this.settings, this._flueGasLosses.length + 1),
      availableHeat: 0.0,
      grossHeat: 0.0,
      systemLosses: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._flueGasLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  collapseLoss(loss: FlueGasObj) {
    loss.collapse = !loss.collapse;
  }

  calculate(loss: FlueGasObj) {
    let sumAdditionalHeat = this.phastService.sumChargeMaterialExothermic(this.losses.chargeMaterials, this.settings);
    if (loss.measurementType === "By Volume") {
      if (loss.formByVolume.status === 'VALID') {
        let tmpLoss: FlueGas = this.flueGasFormService.buildByVolumeLossFromForm(loss.formByVolume);
        let flueGasLossesResults: FlueGasByVolumeSuiteResults = this.phastService.flueGasByVolume(tmpLoss.flueGasByVolume, this.settings);
        loss.availableHeat = flueGasLossesResults.availableHeat * 100;
        loss.calculatedFlueGasO2 = flueGasLossesResults.flueGasO2 * 100;
        loss.calculatedExcessAir = flueGasLossesResults.excessAir * 100;
        if (loss.availableHeat < 0 || loss.availableHeat > 100) {
          this.availableHeatError = 'Available heat is' + ' ' + loss.availableHeat.toFixed(2) + '%' + '.' + ' ' + 'Check your input fields.';
        } else {
          this.availableHeatError = null;
        }
        const sumHeat = this.phastService.sumHeatInput(this.losses, this.settings);
        loss.grossHeat = (sumHeat / flueGasLossesResults.availableHeat) - sumAdditionalHeat;
        loss.systemLosses = (loss.grossHeat + sumAdditionalHeat) * (1 - flueGasLossesResults.availableHeat);
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
        loss.calculatedExcessAir = null;
        loss.calculatedFlueGasO2 = null;
      }
    } else if (loss.measurementType === "By Mass") {
      if (loss.formByMass.status === 'VALID') {
        let tmpLoss: FlueGas = this.flueGasFormService.buildByMassLossFromForm(loss.formByMass);
        const availableHeat = this.phastService.flueGasByMass(tmpLoss.flueGasByMass, this.settings);
        loss.availableHeat = availableHeat * 100;
        if (loss.availableHeat < 0 || loss.availableHeat > 100) {
          this.availableHeatError = 'Available heat is' + ' ' + loss.availableHeat.toFixed(2) + '%' + '.' + ' ' + 'Check your input fields.';
        } else {
          this.availableHeatError = null;
        }
        const heatInput = this.phastService.sumHeatInput(this.losses, this.settings);
        loss.grossHeat = (heatInput / availableHeat) - sumAdditionalHeat;
        loss.systemLosses = (loss.grossHeat + sumAdditionalHeat) * (1 - availableHeat);

        let selectedGas: SolidLiquidFlueGasMaterial = this.solidLiquidMaterialDbService.getById(tmpLoss.flueGasByMass.gasTypeId);
        if (tmpLoss.flueGasByMass.oxygenCalculationMethod == 'Excess Air' && selectedGas) {
          loss.calculatedExcessAir = tmpLoss.flueGasByMass.excessAirPercentage;
          let fluGasCo2Inputs: MaterialInputProperties = {
            carbon: selectedGas.carbon,
            hydrogen: selectedGas.hydrogen,
            sulphur: selectedGas.sulphur,
            inertAsh: selectedGas.inertAsh,
            o2: selectedGas.o2,
            moisture: selectedGas.moisture,
            nitrogen: selectedGas.nitrogen,
            excessAir: tmpLoss.flueGasByMass.excessAirPercentage,
            moistureInAirCombustion: tmpLoss.flueGasByMass.moistureInAirCombustion
          }
          loss.calculatedFlueGasO2 = this.phastService.flueGasByMassCalculateO2(fluGasCo2Inputs);
        } else if (tmpLoss.flueGasByMass.oxygenCalculationMethod == 'Oxygen in Flue Gas' && selectedGas) {
          loss.calculatedFlueGasO2 = tmpLoss.flueGasByMass.o2InFlueGas;
          let fluGasCo2Inputs: MaterialInputProperties = {
            carbon: selectedGas.carbon,
            hydrogen: selectedGas.hydrogen,
            sulphur: selectedGas.sulphur,
            inertAsh: selectedGas.inertAsh,
            o2: selectedGas.o2,
            moisture: selectedGas.moisture,
            nitrogen: selectedGas.nitrogen,
            o2InFlueGas: tmpLoss.flueGasByMass.o2InFlueGas,
            moistureInAirCombustion: tmpLoss.flueGasByMass.moistureInAirCombustion
          }
          loss.calculatedExcessAir = this.phastService.flueGasByMassCalculateExcessAir(fluGasCo2Inputs);
        }
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
        loss.calculatedExcessAir = null;
        loss.calculatedFlueGasO2 = null;
      }
    }
    this.cd.detectChanges();
  }

  setName(loss: FlueGasObj) {
    if (loss.measurementType === 'By Volume') {
      loss.formByMass.patchValue({
        name: loss.formByVolume.controls.name.value
      });
    } else if (loss.measurementType === 'By Mass') {
      loss.formByVolume.patchValue({
        name: loss.formByMass.controls.name.value
      });
    }
  }

  saveLosses() {
    let tmpFlueGasLosses = new Array<FlueGas>();
    let lossIndex = 1;
    this._flueGasLosses.forEach(loss => {
      if (loss.measurementType === "By Volume") {
        if (!loss.formByVolume.controls.name.value) {
          loss.formByVolume.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        let tmpVolumeLoss: FlueGas = this.flueGasFormService.buildByVolumeLossFromForm(loss.formByVolume);
        tmpVolumeLoss.flueGasType = 'By Volume';
        tmpFlueGasLosses.push(tmpVolumeLoss);
      }
      else if (loss.measurementType === "By Mass") {
        if (!loss.formByMass.controls.name.value) {
          loss.formByMass.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        let tmpVolumeLoss: FlueGas = this.flueGasFormService.buildByMassLossFromForm(loss.formByMass);
        tmpVolumeLoss.flueGasType = 'By Mass',
          tmpFlueGasLosses.push(tmpVolumeLoss);
      }
    });
    lossIndex++;
    this.losses.flueGasLosses = tmpFlueGasLosses;
    this.savedLoss.emit(true);
  }

  setError(bool: boolean) {
    this.showError = bool;
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
    this.cd.detectChanges();
  }
  focusOut() {
    this.fieldChange.emit('default');
  }

  compareLossType(lossIndex: number) {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss) {
      return this.flueGasCompareService.compareLossType(lossIndex);
    } else {
      return false;
    }
  }
}

export interface FlueGasObj {
  measurementType: string;
  formByVolume: UntypedFormGroup;
  formByMass: UntypedFormGroup;
  calculatedExcessAir?: number;
  calculatedFlueGasO2?: number;
  availableHeat: number;
  grossHeat: number;
  systemLosses: number;
  collapse: boolean;
}
