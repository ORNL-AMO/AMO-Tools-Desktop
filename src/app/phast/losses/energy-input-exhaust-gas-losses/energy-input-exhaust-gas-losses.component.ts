import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses, PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { EnergyInputWarnings, PhastResultsService } from '../../phast-results.service';

@Component({
  selector: 'app-energy-input-exhaust-gas-losses',
  templateUrl: './energy-input-exhaust-gas-losses.component.html',
  styleUrls: ['./energy-input-exhaust-gas-losses.component.css']
})
export class EnergyInputExhaustGasLossesComponent implements OnInit {
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
  @Input()
  phast: PHAST;

  _exhaustGasLosses: Array<EnInputExGasObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  showError: boolean = false;
  electricalHeatDelivered: number = 0;
  energyInputTotal: number = 0;
  warnings: EnergyInputWarnings = {energyInputHeatDelivered: null};
  constructor(private phastService: PhastService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._exhaustGasLosses) {
      this._exhaustGasLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._exhaustGasLosses = new Array();
        this.initForms();
      }
    }
    else {
      this.firstChange = false;
    }
  }


  initForms() {
    if (this.losses.energyInputExhaustGasLoss) {
      let lossIndex = 1;
      this.losses.energyInputExhaustGasLoss.forEach(loss => {
        if (!loss.availableHeat) {
          loss.availableHeat = 100;
        }  
        let tmpLoss = {
          form: this.energyInputExhaustGasService.getFormFromLoss(loss),
          heatLoss: 0.0,
          collapse: false,
          exhaustGas: 0.0
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }    
        lossIndex++;
        this.calculate(tmpLoss);
        this._exhaustGasLosses.push(tmpLoss);
      });
    }
  }

  addLoss() {
    this._exhaustGasLosses.push({
      form: this.energyInputExhaustGasService.initForm(this._exhaustGasLosses.length + 1),
      heatLoss: 0.0,
      exhaustGas: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._exhaustGasLosses.splice(lossIndex, 1);
    this.saveLosses();
  }

  calculate(loss: EnInputExGasObj) {
    let tmpLoss = this.energyInputExhaustGasService.getLossFromForm(loss.form);
    if (loss.form.status === 'VALID') {
      let results = this.phastService.energyInputExhaustGasLosses(tmpLoss, this.settings);
      loss.heatLoss = results.heatDelivered;
      loss.exhaustGas = results.exhaustGasLosses;
      let tmpResults: PhastResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.energyInputTotal = tmpResults.grossHeatInput;
      this.electricalHeatDelivered = this.energyInputTotal - loss.heatLoss - loss.exhaustGas;
      this.warnings.energyInputHeatDelivered = this.phastResultsService.checkEnergyInputWarnings(this.electricalHeatDelivered);
    } else {
      loss.heatLoss = 0;
      loss.exhaustGas = 0;
      this.energyInputTotal = 0;
      this.electricalHeatDelivered = 0;
    }
  }

  collapseLoss(loss: EnInputExGasObj) {
    loss.collapse = !loss.collapse;
  }

  saveLosses() {
    let tmpExhaustGases = new Array<EnergyInputExhaustGasLoss>();
    let lossIndex = 1;
    this._exhaustGasLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpExhaustGas = this.energyInputExhaustGasService.getLossFromForm(loss.form);
      tmpExhaustGases.push(tmpExhaustGas);
    });
    this.losses.energyInputExhaustGasLoss = tmpExhaustGases;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }


  setError(bool: boolean) {
    this.showError = bool;
  }
}

export interface EnInputExGasObj {
  form: FormGroup;
  heatLoss: number;
  exhaustGas: number;
  collapse: boolean;
}
