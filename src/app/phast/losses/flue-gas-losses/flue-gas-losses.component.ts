import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { FlueGasLossesService } from './flue-gas-losses.service';
import { PhastService } from '../../phast.service';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../../shared/models/phast/losses/flueGas';
import { Losses } from '../../../shared/models/phast/phast';
import { FlueGasCompareService } from './flue-gas-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms/src/model';
@Component({
  selector: 'app-flue-gas-losses',
  templateUrl: './flue-gas-losses.component.html',
  styleUrls: ['./flue-gas-losses.component.css']
})
export class FlueGasLossesComponent implements OnInit {
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

  _flueGasLosses: Array<FlueGasObj>;
  firstChange: boolean = true;
  resultsUnit: string;

  availableHeatError: string = null;
  showError: boolean = false;
  disableType: boolean = false;
  lossesLocked: boolean = false;
  constructor(private phastService: PhastService, private flueGasLossesService: FlueGasLossesService, private flueGasCompareService: FlueGasCompareService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._flueGasLosses) {
      this._flueGasLosses = new Array();
    }
    if (this.losses.flueGasLosses) {
      this.setCompareVals();
      this.flueGasCompareService.initCompareObjects();
      this.initFlueGasses()
    }

    this.flueGasLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.flueGasLosses) {
          this._flueGasLosses.splice(lossIndex, 1);
          if (this.flueGasCompareService.differentArray && !this.isBaseline) {
            this.flueGasCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.flueGasLossesService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._flueGasLosses.push({
    //         measurementType: 'By Volume',
    //         formByVolume: this.flueGasLossesService.initFormVolume(),
    //         formByMass: this.flueGasLossesService.initFormMass(),
    //         name: 'Loss #' + (this._flueGasLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // } else {
    //   this.flueGasLossesService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._flueGasLosses.push({
    //         measurementType: 'By Volume',
    //         formByVolume: this.flueGasLossesService.initFormVolume(),
    //         formByMass: this.flueGasLossesService.initFormMass(),
    //         name: 'Loss #' + (this._flueGasLosses.length + 1),
    //         heatLoss: 0.0,
    //         collapse: false
    //       })
    //     }
    //   })
    // }
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
      this.disableForms();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
      if (changes.addLossToggle) {
        this.addLoss();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      //    this.flueGasLossesService.addLossBaselineMonitor.next(false);
      this.flueGasCompareService.baselineFlueGasLoss = null;
    } else {
      //    this.flueGasLossesService.addLossModificationMonitor.next(false);
      this.flueGasCompareService.modifiedFlueGasLoss = null;
    }
    this.flueGasLossesService.deleteLossIndex.next(null);
  }

  disableForms() {
    this._flueGasLosses.forEach(loss => {
      loss.formByMass.disable();
      loss.formByVolume.disable();
    })
  }
  initFlueGasses() {
    let lossIndex = 1;
    this.losses.flueGasLosses.forEach(loss => {
      let tmpLoss;
      if (loss.flueGasType == "By Volume") {
        tmpLoss = {
          measurementType: 'By Volume',
          formByVolume: this.flueGasLossesService.initByVolumeFormFromLoss(loss),
          formByMass: this.flueGasLossesService.initFormMass(lossIndex),
          heatLoss: 0.0,
          collapse: false
        }
      } else if (loss.flueGasType == "By Mass") {
        tmpLoss = {
          measurementType: 'By Mass',
          formByVolume: this.flueGasLossesService.initFormVolume(lossIndex),
          formByMass: this.flueGasLossesService.initByMassFormFromLoss(loss),
          availableHeat: 0.0,
          grossHeat: 0.0,
          systemLosses: 0.0,
          collapse: false
        }
      }
      if (!tmpLoss.formByVolume.controls.name.value) {
        tmpLoss.formByVolume.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      if (!tmpLoss.formByMass.controls.name.value) {
        tmpLoss.formByMass.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      this.calculate(tmpLoss);
      this._flueGasLosses.push(tmpLoss);
    })
  }

  addLoss() {
    // if (this.isLossesSetup) {
    //   this.flueGasLossesService.addLoss(this.isBaseline);
    // }
    if (this.flueGasCompareService.differentArray) {
      this.flueGasCompareService.addObject(this.flueGasCompareService.differentArray.length - 1);
    }
    this._flueGasLosses.push({
      measurementType: 'By Volume',
      formByVolume: this.flueGasLossesService.initFormVolume(this._flueGasLosses.length + 1),
      formByMass: this.flueGasLossesService.initFormMass(this._flueGasLosses.length + 1),
      availableHeat: 0.0,
      grossHeat: 0.0,
      systemLosses: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this.flueGasLossesService.setDelete(lossIndex);
  }

  collapseLoss(loss: FlueGasObj) {
    loss.collapse = !loss.collapse;
  }

  calculate(loss: FlueGasObj) {
    let sumAdditionalHeat = this.phastService.sumChargeMaterialExothermic(this.losses.chargeMaterials, this.settings);
    if (loss.measurementType == "By Volume") {
      if (loss.formByVolume.status == 'VALID') {
        let tmpLoss: FlueGas = this.flueGasLossesService.buildByVolumeLossFromForm(loss.formByVolume);
        const availableHeat = this.phastService.flueGasByVolume(tmpLoss.flueGasByVolume, this.settings);
        loss.availableHeat = availableHeat * 100;
        if (loss.availableHeat < 0 || loss.availableHeat > 100) {
          this.availableHeatError = 'Available heat is' + ' ' + loss.availableHeat.toFixed(2) + '%' + '.' + ' ' + 'Check your input fields.';
        } else {
          this.availableHeatError = null;
        }
        const sumHeat = this.phastService.sumHeatInput(this.losses, this.settings);
        loss.grossHeat = (sumHeat / availableHeat) - sumAdditionalHeat;
        loss.systemLosses = (loss.grossHeat + sumAdditionalHeat) * (1 - availableHeat);
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
      }
    } else if (loss.measurementType == "By Mass") {
      if (loss.formByMass.status == 'VALID') {
        let tmpLoss: FlueGas = this.flueGasLossesService.buildByMassLossFromForm(loss.formByMass);
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
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
      }
    }
  }

  setName(loss: FlueGasObj) {
    if (loss.measurementType == 'By Volume') {
      loss.formByMass.patchValue({
        name: loss.formByVolume.controls.name.value
      })
    } else if (loss.measurementType == 'By Mass') {
      loss.formByVolume.patchValue({
        name: loss.formByMass.controls.name.value
      })
    }
  }

  saveLosses() {
    let tmpFlueGasLosses = new Array<FlueGas>();
    let lossIndex = 1;
    this._flueGasLosses.forEach(loss => {
      if (loss.measurementType == "By Volume") {
        if (!loss.formByVolume.controls.name.value) {
          loss.formByVolume.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        let tmpVolumeLoss: FlueGas = this.flueGasLossesService.buildByVolumeLossFromForm(loss.formByVolume);
        tmpVolumeLoss.flueGasType = 'By Volume';
        tmpFlueGasLosses.push(tmpVolumeLoss);
      }
      else if (loss.measurementType == "By Mass") {
        if (!loss.formByMass.controls.name.value) {
          loss.formByMass.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        let tmpVolumeLoss: FlueGas = this.flueGasLossesService.buildByMassLossFromForm(loss.formByMass);
        tmpVolumeLoss.flueGasType = 'By Mass',
          tmpFlueGasLosses.push(tmpVolumeLoss);
      }
    })
    lossIndex++;
    this.losses.flueGasLosses = tmpFlueGasLosses;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  setError(bool: boolean) {
    this.showError = bool;
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  focusOut() {
    this.fieldChange.emit('default');
  }
  setCompareVals() {
    if (this.isBaseline) {
      this.flueGasCompareService.baselineFlueGasLoss = this.losses.flueGasLosses;
    } else {
      this.flueGasCompareService.modifiedFlueGasLoss = this.losses.flueGasLosses;
    }
    if (this.flueGasCompareService.differentArray && !this.isBaseline) {
      if (this.flueGasCompareService.differentArray.length != 0) {
        this.flueGasCompareService.checkFlueGasLosses();
      }
    }
  }
}

export interface FlueGasObj {
  measurementType: string,
  formByVolume: FormGroup,
  formByMass: FormGroup,
  availableHeat: number,
  grossHeat: number,
  systemLosses: number,
  collapse: boolean
}
