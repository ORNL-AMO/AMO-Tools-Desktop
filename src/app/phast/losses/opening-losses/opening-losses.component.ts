import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast/phast';
import { OpeningLoss, QuadOpeningLoss, CircularOpeningLoss } from '../../../shared/models/phast/losses/openingLoss';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OpeningFormService } from '../../../calculator/furnaces/opening/opening-form.service';
import { OpeningService } from '../../../calculator/furnaces/opening/opening.service';

@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {
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

  showError: boolean = false;
  _openingLosses: Array<OpeningLossObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  total: number;
  constructor(private phastService: PhastService, private openingLossesService: OpeningService, private openingFormService: OpeningFormService) {}


  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
        this._openingLosses = new Array();
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

    if (!this._openingLosses) {
      this._openingLosses = new Array();
    }
    this.initForms();
    if (this.inSetup && this.modExists) {
         this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.openingLosses) {
      let lossIndex = 1;
      this.losses.openingLosses.forEach(loss => {
        let tmpLoss = {
          form: this.openingFormService.getFormFromLoss(loss),
          totalOpeningLosses: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._openingLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  addLoss() {
    this._openingLosses.push({
      form: this.openingFormService.initForm(this._openingLosses.length + 1),
      totalOpeningLosses: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  collapseLoss(loss: OpeningLossObj) {
    loss.collapse = !loss.collapse;
  }

  removeLoss(lossIndex: number) {
    this._openingLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  calculate(loss: OpeningLossObj) {
    if (loss.form.status === 'VALID') {
      if (loss.form.controls.openingType.value === 'Rectangular (or Square)' && loss.form.controls.heightOfOpening.value !== '') {
        let tmpLoss: QuadOpeningLoss = this.openingFormService.getQuadLossFromForm(loss.form);
        let lossAmount = this.phastService.openingLossesQuad(tmpLoss, this.settings);
        loss.totalOpeningLosses = loss.form.controls.numberOfOpenings.value * lossAmount;
      } else if (loss.form.controls.openingType.value === 'Round') {
        let tmpLoss: CircularOpeningLoss = this.openingFormService.getCircularLossFromForm(loss.form);
        let lossAmount = this.phastService.openingLossesCircular(tmpLoss, this.settings);
        loss.totalOpeningLosses = loss.form.controls.numberOfOpenings.value * lossAmount;
      } else {
        loss.totalOpeningLosses = null;
      }
    } else {
      loss.totalOpeningLosses = null;
    }
    this.total = this.getTotal();
  }

  saveLosses() {
    let tmpOpeningLosses = new Array<OpeningLoss>();
    let lossIndex = 1;
    this._openingLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpOpeningLoss = this.openingFormService.getLossFromForm(loss.form);
      tmpOpeningLoss.heatLoss = loss.totalOpeningLosses;
      tmpOpeningLosses.push(tmpOpeningLoss);
    });
    this.losses.openingLosses = tmpOpeningLosses;
    this.savedLoss.emit(true);
  }
  changeField(str: string) {
    this.fieldChange.emit(str);
  }


  setError(bool: boolean) {
    this.showError = bool;
  }
  getTotal() {
    return _.sumBy(this._openingLosses, 'totalOpeningLosses');
  }
}

export interface OpeningLossObj {
  form: FormGroup;
  totalOpeningLosses: number;
  collapse: boolean;
}
