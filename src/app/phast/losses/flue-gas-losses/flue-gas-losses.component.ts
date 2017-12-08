import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { FlueGasLossesService } from './flue-gas-losses.service';
import { PhastService } from '../../phast.service';
import { FlueGas, FlueGasByMass, FlueGasByVolume } from '../../../shared/models/phast/losses/flueGas';
import { Losses } from '../../../shared/models/phast/phast';
import { FlueGasCompareService } from './flue-gas-compare.service';
import { Settings } from '../../../shared/models/settings';
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
  
  _flueGasLosses: Array<any>;
  firstChange: boolean = true;
  resultsUnit: string;
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
        }
      }
    })
    if (this.isBaseline) {
      this.flueGasLossesService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._flueGasLosses.push({
            measurementType: 'By Volume',
            formByVolume: this.flueGasLossesService.initFormVolume(),
            formByMass: this.flueGasLossesService.initFormMass(),
            name: 'Loss #' + (this._flueGasLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    } else {
      this.flueGasLossesService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._flueGasLosses.push({
            measurementType: 'By Volume',
            formByVolume: this.flueGasLossesService.initFormVolume(),
            formByMass: this.flueGasLossesService.initFormMass(),
            name: 'Loss #' + (this._flueGasLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
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
      this.flueGasLossesService.addLossBaselineMonitor.next(false);
      this.flueGasCompareService.baselineFlueGasLoss = null;
    } else {
      this.flueGasLossesService.addLossModificationMonitor.next(false);
      this.flueGasCompareService.modifiedFlueGasLoss = null;
    }
    this.flueGasLossesService.deleteLossIndex.next(null);
  }

  initFlueGasses() {
    this.losses.flueGasLosses.forEach(loss => {
      if (loss.flueGasType == "By Volume") {
        let tmpLoss = {
          measurementType: 'By Volume',
          formByVolume: this.flueGasLossesService.initByVolumeFormFromLoss(loss),
          formByMass: this.flueGasLossesService.initFormMass(),
          name: 'Loss #' + (this._flueGasLosses.length + 1),
          heatLoss: 0.0
        }
        this.calculate(tmpLoss);
        this._flueGasLosses.push(tmpLoss);
      } else if (loss.flueGasType == "By Mass") {
        let tmpLoss = {
          measurementType: 'By Mass',
          formByVolume: this.flueGasLossesService.initFormVolume(),
          formByMass: this.flueGasLossesService.initByMassFormFromLoss(loss),
          name: 'Loss #' + (this._flueGasLosses.length + 1),
          availableHeat: 0.0,
          grossHeat: 0.0,
          systemLosses: 0.0
        }
        this.calculate(tmpLoss);
        this._flueGasLosses.push(tmpLoss);
      }
    })
  }

  addLoss() {
    if (this.isLossesSetup) {
      this.flueGasLossesService.addLoss(this.isBaseline);
    }
    if (this.flueGasCompareService.differentArray) {
      this.flueGasCompareService.addObject(this.flueGasCompareService.differentArray.length - 1);
    }
    this._flueGasLosses.push({
      measurementType: 'By Volume',
      formByVolume: this.flueGasLossesService.initFormVolume(),
      formByMass: this.flueGasLossesService.initFormMass(),
      name: 'Loss #' + (this._flueGasLosses.length + 1),
      availableHeat: 0.0,
      grossHeat: 0.0,
      systemLosses: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    this.flueGasLossesService.setDelete(lossIndex);
  }

  renameLoss() {
    let index = 1;
    this._flueGasLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    let sumAdditionalHeat = this.phastService.sumChargeMaterialExothermic(this.losses.chargeMaterials, this.settings);
    if (loss.measurementType == "By Volume") {
      if (loss.formByVolume.status == 'VALID') {
        let tmpLoss: FlueGasByVolume = this.flueGasLossesService.buildByVolumeLossFromForm(loss.formByVolume);
        let tmpResult = this.phastService.flueGasByVolume(tmpLoss, this.settings);
        loss.availableHeat = tmpResult * 100;
        let sumHeat = this.phastService.sumHeatInput(this.losses, this.settings);
        loss.grossHeat = (sumHeat / tmpResult) - sumAdditionalHeat;
        loss.systemLosses = loss.grossHeat * (1 - tmpResult);
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
      }
    } else if (loss.measurementType == "By Mass") {
      if (loss.formByMass.status == 'VALID') {
        let tmpLoss: FlueGasByMass = this.flueGasLossesService.buildByMassLossFromForm(loss.formByMass);
        let tmpResult = this.phastService.flueGasByMass(tmpLoss, this.settings);
        loss.availableHeat = tmpResult * 100;
        let heatInput = this.phastService.sumHeatInput(this.losses, this.settings);
        loss.grossHeat = (heatInput / tmpResult) - sumAdditionalHeat;;
        loss.systemLosses = loss.grossHeat * (1 - tmpResult);
      } else {
        loss.availableHeat = null;
        loss.grossHeat = null;
        loss.systemLosses = null;
      }
    }
  }

  saveLosses() {
    let tmpFlueGasLosses = new Array<FlueGas>();
    this._flueGasLosses.forEach(loss => {
      if (loss.measurementType == "By Volume") {
        let tmpVolumeLoss: FlueGas = {
          flueGasType: 'By Volume',
          flueGasByVolume: this.flueGasLossesService.buildByVolumeLossFromForm(loss.formByVolume)
        };
        tmpFlueGasLosses.push(tmpVolumeLoss);
      }
      else if (loss.measurementType == "By Mass") {
        let tmpVolumeLoss: FlueGas = {
          flueGasType: 'By Mass',
          flueGasByMass: this.flueGasLossesService.buildByMassLossFromForm(loss.formByMass)
        }
        tmpFlueGasLosses.push(tmpVolumeLoss);
      }
    })
    this.losses.flueGasLosses = tmpFlueGasLosses;
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

