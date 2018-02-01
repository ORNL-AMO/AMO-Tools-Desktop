import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { EnergyInputService } from './energy-input.service';
import { EnergyInputEAF } from '../../../shared/models/phast/losses/energyInputEAF';
import { EnergyInputCompareService } from './energy-input-compare.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-energy-input',
  templateUrl: './energy-input.component.html',
  styleUrls: ['./energy-input.component.css']
})
export class EnergyInputComponent implements OnInit {
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

  _energyInputs: Array<EnInputObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  constructor(private energyInputService: EnergyInputService, private phastService: PhastService, private energyInputCompareService: EnergyInputCompareService) { }

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

    if (!this._energyInputs) {
      this._energyInputs = new Array();
    }
    if (this.losses.energyInputEAF) {
      this.setCompareVals();
      this.energyInputCompareService.initCompareObjects();
      let lossIndex = 1;
      this.losses.energyInputEAF.forEach(loss => {
        let tmpLoss = {
          form: this.energyInputService.getFormFromLoss(loss),
          results: {
            heatDelivered: 0,
            totalChemicalEnergyInput: 0
          },
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          })
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._energyInputs.push(tmpLoss);
      })
    }
    this.energyInputService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        if (this.losses.energyInputEAF) {
          this._energyInputs.splice(lossIndex, 1);
          if (this.energyInputCompareService.differentArray && !this.isBaseline) {
            this.energyInputCompareService.differentArray.splice(lossIndex, 1);
          }
          this.saveLosses();
        }
      }
    })
    // if (this.isBaseline) {
    //   this.energyInputService.addLossBaselineMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._energyInputs.push({
    //         form: this.energyInputService.initForm(),
    //         name: 'Loss #' + (this._energyInputs.length + 1),
    //         results: {
    //           heatDelivered: 0,
    //           kwhCycle: 0,
    //           totalKwhCycle: 0
    //         },
    //         collapse: false
    //       });
    //     }
    //   })
    // } else {
    //   this.energyInputService.addLossModificationMonitor.subscribe((val) => {
    //     if (val == true) {
    //       this._energyInputs.push({
    //         form: this.energyInputService.initForm(),
    //         name: 'Loss #' + (this._energyInputs.length + 1),
    //         results: {
    //           heatDelivered: 0,
    //           kwhCycle: 0,
    //           totalKwhCycle: 0
    //         },
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

  ngOnDestroy() {
    if (this.isBaseline) {
      //  this.energyInputService.addLossBaselineMonitor.next(false);
      this.energyInputCompareService.baselineEnergyInput = null;
    } else {
      this.energyInputCompareService.modifiedEnergyInput = null;
      //  this.energyInputService.addLossModificationMonitor.next(false);
    }
    this.energyInputService.deleteLossIndex.next(null);
  }

  disableForms() {
    this._energyInputs.forEach(loss => {
      loss.form.disable();
    })
  }
  addLoss() {
    // if (this.isLossesSetup) {
    //   this.energyInputService.addLoss(this.isBaseline);
    // }
    if (this.energyInputCompareService.differentArray) {
      this.energyInputCompareService.addObject(this.energyInputCompareService.differentArray.length - 1);
    }
    this._energyInputs.push({
      form: this.energyInputService.initForm(this._energyInputs.length + 1),
      results: {
        heatDelivered: 0,
        totalChemicalEnergyInput: 0
      },
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this.energyInputService.setDelete(lossIndex);
  }

  collapseLoss(loss: EnInputObj) {
    loss.collapse = !loss.collapse;
  }
  calculate(loss: EnInputObj) {
    if (loss.form.status == 'VALID') {
      let tmpLoss: EnergyInputEAF = this.energyInputService.getLossFromForm(loss.form);
      let calculation = this.phastService.energyInputEAF(tmpLoss, this.settings);
      loss.results = {
        heatDelivered: calculation.heatDelivered,
        totalChemicalEnergyInput: calculation.totalChemicalEnergyInput
      }
    } else {
      loss.results = {
        heatDelivered: null,
        totalChemicalEnergyInput: null
      }
    }
  }

  saveLosses() {
    let tmpEnergyInputs = new Array<EnergyInputEAF>();
    let lossIndex = 1;
    this._energyInputs.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        })
      }
      lossIndex++;
      let tmpEnergyInput = this.energyInputService.getLossFromForm(loss.form);
      tmpEnergyInputs.push(tmpEnergyInput);
    })
    this.losses.energyInputEAF = tmpEnergyInputs;
    this.setCompareVals();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.energyInputCompareService.baselineEnergyInput = this.losses.energyInputEAF;
    } else {
      this.energyInputCompareService.modifiedEnergyInput = this.losses.energyInputEAF;
    }
    if (this.energyInputCompareService.differentArray && !this.isBaseline) {
      if (this.energyInputCompareService.differentArray.length != 0) {
        this.energyInputCompareService.checkEnergyInputs();
      }
    }
  }
}

export interface EnInputObj {
  form: FormGroup,
  results: EnInputResultsObj
  collapse: boolean
}

export interface EnInputResultsObj {
  heatDelivered: number,
  totalChemicalEnergyInput: number
}