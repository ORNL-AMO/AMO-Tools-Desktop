import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses, PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { EnergyInputExhaustGasLoss } from '../../../shared/models/phast/losses/energyInputExhaustGasLosses';
import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { EnergyInputWarnings, PhastResultsService } from '../../phast-results.service';
import { EnergyExhaustGasOutput } from '../../../tools-suite-api/process-heating-api.service';

@Component({
    selector: 'app-energy-input-exhaust-gas-losses',
    templateUrl: './energy-input-exhaust-gas-losses.component.html',
    styleUrls: ['./energy-input-exhaust-gas-losses.component.css'],
    standalone: false
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
  energyExhaustGasOutput: EnergyExhaustGasOutput;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  showError: boolean = false;
  warnings: EnergyInputWarnings = {energyInputHeatDelivered: null };
  constructor(private phastService: PhastService, 
    private energyInputExhaustGasService: EnergyInputExhaustGasService, 
    private phastResultsService: PhastResultsService
    ) { }

  ngOnInit() {
    this.energyExhaustGasOutput = {
      fuelHeatDelivered: 0,
      exhaustGasLosses: 0,
      availableHeat: 0,
      electricalEfficiency: 0,
      electricalHeaterLosses: 0,
      phastElectricalHeatDelivered: 0,
      phastEnergyInputTotal: 0
    }
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
        let lossDisplay: EnInputExGasObj = {
          form: this.energyInputExhaustGasService.getFormFromLoss(loss),
          collapse: false,
        };
        if (!lossDisplay.form.controls.name.value) {
          lossDisplay.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }    
        lossIndex++;
        this.calculate(lossDisplay);
        this._exhaustGasLosses.push(lossDisplay);
      });
    }
  }

  addLoss() {
    this._exhaustGasLosses.push({
      form: this.energyInputExhaustGasService.initForm(this._exhaustGasLosses.length + 1),
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._exhaustGasLosses.splice(lossIndex, 1);
    this.saveLosses();
  }


  calculate(lossDisplay: EnInputExGasObj) {
    this.energyExhaustGasOutput = {
      fuelHeatDelivered: 0,
      exhaustGasLosses: 0,
      availableHeat: 0,
      electricalEfficiency: 0,
      electricalHeaterLosses: 0,
      phastElectricalHeatDelivered: 0,
      phastEnergyInputTotal: 0
    }
    if (lossDisplay.form.status === 'VALID') {
      let phastResults: PhastResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.energyExhaustGasOutput.fuelHeatDelivered = phastResults.energyInputHeatDelivered;
      this.energyExhaustGasOutput.exhaustGasLosses = phastResults.totalExhaustGas;
      this.energyExhaustGasOutput.electricalHeaterLosses = phastResults.electricalHeaterLosses;
      this.energyExhaustGasOutput.phastElectricalHeatDelivered = phastResults.electricalHeatDelivered;
      this.energyExhaustGasOutput.phastEnergyInputTotal = phastResults.grossHeatInput;
      this.warnings.energyInputHeatDelivered = this.energyInputExhaustGasService.checkEnergyInputHeatDelivered(this.energyExhaustGasOutput.phastElectricalHeatDelivered);
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
  form: UntypedFormGroup;
  collapse: boolean;
}
