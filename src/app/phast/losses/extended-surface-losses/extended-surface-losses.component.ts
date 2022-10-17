import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { ExtendedSurface } from '../../../shared/models/phast/losses/extendedSurface';
import { Losses } from '../../../shared/models/phast/phast';
import { ExtendedSurfaceLossesService } from './extended-surface-losses.service';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
@Component({
  selector: 'app-extended-surface-losses',
  templateUrl: './extended-surface-losses.component.html',
  styleUrls: ['./extended-surface-losses.component.css']
})
export class ExtendedSurfaceLossesComponent implements OnInit {
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
  _surfaceLosses: Array<ExtSurfaceObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  total: number;
  constructor(private phastService: PhastService, private extendedSurfaceLossesService: ExtendedSurfaceLossesService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._surfaceLosses = new Array();
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

    if (!this._surfaceLosses) {
      this._surfaceLosses = new Array();
    }
    this.initForms();
    
    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    if (this.losses.extendedSurfaces) {
      let lossIndex = 1;
      this.losses.extendedSurfaces.forEach(loss => {
        let tmpLoss = {
          form: this.extendedSurfaceLossesService.getSurfaceLossForm(loss),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        this.calculate(tmpLoss);
        this._surfaceLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  addLoss() {
    this._surfaceLosses.push({
      form: this.extendedSurfaceLossesService.initForm(this._surfaceLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });
    this.saveLosses();
  }

  removeLoss(lossIndex: number) {
    this._surfaceLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  calculate(loss: any) {
    if (loss.form.status === 'VALID') {
      //EXTENDED SURFACE LOSS = WALL LOSS WITH ASSUMPTIONS:
      //windVelocity = 5
      //correctionFactor = 1
      //conditionFactor = 1
      let tmpLoss: ExtendedSurface = this.extendedSurfaceLossesService.getSurfaceLossFromForm(loss.form);
      let tmpWallLoss: WallLoss = {
        surfaceArea: tmpLoss.surfaceArea,
        ambientTemperature: tmpLoss.ambientTemperature,
        surfaceTemperature: tmpLoss.surfaceTemperature,
        windVelocity: 5,
        surfaceEmissivity: tmpLoss.surfaceEmissivity,
        conditionFactor: 1,
        correctionFactor: 1,
      };
      loss.heatLoss = this.phastService.wallLosses(tmpWallLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
    this.total = this.getTotal();
  }

  collapseLoss(loss: any) {
    loss.collapse = !loss.collapse;
  }

  saveLosses() {
    let tmpSurfaceLosses = new Array<ExtendedSurface>();
    this._surfaceLosses.forEach(loss => {
      let lossIndex = 1;
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpSurfaceLoss = this.extendedSurfaceLossesService.getSurfaceLossFromForm(loss.form);
      tmpSurfaceLoss.heatLoss = loss.heatLoss;
      tmpSurfaceLosses.push(tmpSurfaceLoss);
    });
    this.losses.extendedSurfaces = tmpSurfaceLosses;
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  setError(bool: boolean) {
    this.showError = bool;
  }

  getTotal() {
    return _.sumBy(this._surfaceLosses, 'heatLoss');
  }
}

export interface ExtSurfaceObj {
  form: UntypedFormGroup;
  heatLoss: number;
  collapse: boolean;
}
