import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';
import { EnergyInputExhaustGasCompareService } from './energy-input-exhaust-gas-compare.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-energy-input-exhaust-gas-losses',
  templateUrl: './energy-input-exhaust-gas-losses.component.html',
  styleUrls: ['./energy-input-exhaust-gas-losses.component.css']
})
export class EnergyInputExhaustGasLossesComponent implements OnInit {
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

  _exhaustGasLosses: Array<any>;
  firstChange: boolean = true;
  availableHeat: number = 0;
  resultsUnit: string;
  constructor(private phastService: PhastService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService) { }

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

  ngOnInit() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._exhaustGasLosses) {
      this._exhaustGasLosses = new Array();
    }
    if (this.losses.energyInputExhaustGasLoss) {
      this.setCompareVals();
      this.energyInputExhaustGasCompareService.initCompareObjects();
      this.losses.energyInputExhaustGasLoss.forEach(loss => {
        let tmpLoss = {
          form: this.energyInputExhaustGasService.getFormFromLoss(loss),
          name: 'Loss #' + (this._exhaustGasLosses.length + 1),
          heatLoss: 0.0,
          collapse: false
        };
        this.calculate(tmpLoss);
        this._exhaustGasLosses.push(tmpLoss);
      })
    }

    this.energyInputExhaustGasService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.energyInputExhaustGasLoss) {
          this._exhaustGasLosses.splice(lossIndex, 1);
          if (this.energyInputExhaustGasCompareService.differentArray && !this.isBaseline) {
            this.energyInputExhaustGasCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })
    if (this.isBaseline) {
      this.energyInputExhaustGasService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._exhaustGasLosses.push({
            form: this.energyInputExhaustGasService.initForm(),
            name: 'Loss #' + (this._exhaustGasLosses.length + 1),
            heatLoss: 0.0,
            collapse: false
          })
        }
      })
    } else {
      this.energyInputExhaustGasService.addLossModificationMonitor.subscribe((val) => {
        if (val == true) {
          this._exhaustGasLosses.push({
            form: this.energyInputExhaustGasService.initForm(),
            name: 'Loss #' + (this._exhaustGasLosses.length + 1),
            heatLoss: 0.0,
            collapse: false
          })
        }
      })
    }
    if(this.inSetup && this.modExists){
      this.disableForms();
    }
  }

  ngOnDestroy() {
    if (this.isBaseline) {
      this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses = null;
      this.energyInputExhaustGasService.addLossBaselineMonitor.next(false);
    } else {
      this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses = null;
      this.energyInputExhaustGasService.addLossModificationMonitor.next(false);
    }
    this.energyInputExhaustGasService.deleteLossIndex.next(null);
  }
  
  disableForms(){
    this._exhaustGasLosses.forEach(loss => {
      loss.form.disable();
    })
  }

  addLoss() {
    if (this.isLossesSetup) {
      this.energyInputExhaustGasService.addLoss(this.isBaseline);
    }
    if (this.energyInputExhaustGasCompareService.differentArray) {
      this.energyInputExhaustGasCompareService.addObject(this.energyInputExhaustGasCompareService.differentArray.length - 1);
    }
    this._exhaustGasLosses.push({
      form: this.energyInputExhaustGasService.initForm(),
      name: 'Loss #' + (this._exhaustGasLosses.length + 1),
      heatLoss: 0.0,
      exhaustGas: 0.0,
      collapse: false
    });
  }

  removeLoss(lossIndex: number) {
    this.energyInputExhaustGasService.setDelete(lossIndex);
  }

  renameLossess() {
    let index = 1;
    this._exhaustGasLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    let tmpLoss = this.energyInputExhaustGasService.getLossFromForm(loss.form);
    this.availableHeat = this.phastService.availableHeat(tmpLoss, this.settings);
    tmpLoss.availableHeat = this.availableHeat;
    if (loss.form.status == 'VALID') {
      let results = this.phastService.energyInputExhaustGasLosses(tmpLoss, this.settings);
      loss.heatLoss = results.heatDelivered;
      loss.exhaustGas = results.exhaustGasLosses;
    } else {
      loss.heatLoss = 0;
      loss.exhaustGas = 0;
    }
  }

  collapseLoss(loss: any){
    loss.collapse = !loss.collapse;
  }
  
  saveLosses() {
    let tmpExhaustGases = new Array<EnergyInputExhaustGasLoss>();
    this._exhaustGasLosses.forEach(loss => {
      let tmpExhaustGas = this.energyInputExhaustGasService.getLossFromForm(loss.form);
      tmpExhaustGases.push(tmpExhaustGas);
    })
    this.losses.energyInputExhaustGasLoss = tmpExhaustGases;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses = this.losses.energyInputExhaustGasLoss;
    } else {
      this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses = this.losses.energyInputExhaustGasLoss;
    }
    if (this.energyInputExhaustGasCompareService.differentArray && !this.isBaseline) {
      if (this.energyInputExhaustGasCompareService.differentArray.length != 0) {
        this.energyInputExhaustGasCompareService.checkExhaustGasLosses();
      }
    }
  }
}
