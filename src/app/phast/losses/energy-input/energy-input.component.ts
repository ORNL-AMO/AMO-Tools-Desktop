import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Losses, PHAST, PhastResults } from '../../../shared/models/phast/phast';
import { EnergyInputService } from './energy-input.service';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { PhastResultsService } from '../../phast-results.service';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-energy-input',
  templateUrl: './energy-input.component.html',
  styleUrls: ['./energy-input.component.css']
})
export class EnergyInputComponent implements OnInit {
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

  _energyInputs: Array<EnInputObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private energyInputService: EnergyInputService, private phastResultsService: PhastResultsService, private phastService: PhastService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._energyInputs = new Array();
        this.initForms();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if (this.settings.energyResultUnit !== 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }

    if (!this._energyInputs) {
      this._energyInputs = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.energyInputEAF) {
      let lossIndex = 1;
      let minElectricityRequirement: number = this.getMinElectricityRequirement();
      this.losses.energyInputEAF.forEach(loss => {
        let tmpLoss = {
          form: this.energyInputService.getFormFromLoss(loss, minElectricityRequirement),
          results: {
            energyInputHeatDelivered: 0,
            energyInputTotalChemEnergy: 0,
            grossHeatInput: 0
          },
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._energyInputs.push(tmpLoss);
      });
    }
  }

  getMinElectricityRequirement(): number {
    let minElectricityRequirement: number = this.phastResultsService.getMinElectricityInputRequirement(this.phast, this.settings);
    return minElectricityRequirement;
  }

  addLoss() {
    this._energyInputs.push({
      form: this.energyInputService.initForm(this._energyInputs.length + 1, this.settings),
      results: {
        energyInputHeatDelivered: 0,
        energyInputTotalChemEnergy: 0,
        grossHeatInput: 0
      },
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._energyInputs.splice(lossIndex, 1);
    this.saveLosses();
  }

  collapseLoss(loss: EnInputObj) {
    loss.collapse = !loss.collapse;
  }
  calculate(loss: EnInputObj) {
    if (loss.form.status === 'VALID') {
      let tmpResults: PhastResults = this.phastResultsService.getResults(this.phast, this.settings);
      loss.results = {
        energyInputHeatDelivered: tmpResults.energyInputHeatDelivered,
        energyInputTotalChemEnergy: tmpResults.energyInputTotalChemEnergy,
        grossHeatInput: tmpResults.energyInputTotal
      };
    } else {
      loss.results = {
        energyInputHeatDelivered: null,
        energyInputTotalChemEnergy: null,
        grossHeatInput: null
      };
    }
  }

  saveLosses() {
    let tmpEnergyInputs = new Array<EnergyInputEAF>();
    let lossIndex = 1;
    this._energyInputs.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpEnergyInput = this.energyInputService.getLossFromForm(loss.form);
      tmpEnergyInputs.push(tmpEnergyInput);
    });
    this.losses.energyInputEAF = tmpEnergyInputs;
    let minEnergyRequirement: number = this.getMinElectricityRequirement();
    let updatedValidators = this.energyInputService.getElectricityInputValidators(minEnergyRequirement);
    this._energyInputs.forEach(loss => {
      loss.form.controls.electricityInput.setValidators(updatedValidators);
      loss.form.controls.electricityInput.updateValueAndValidity();
    });
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

}

export interface EnInputObj {
  form: FormGroup;
  results: EnInputResultsObj;
  collapse: boolean;
}

export interface EnInputResultsObj {
  energyInputHeatDelivered: number;
  energyInputTotalChemEnergy: number;
  grossHeatInput: number;
}
