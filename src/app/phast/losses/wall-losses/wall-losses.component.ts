import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { WallLoss } from '../../../shared/models/losses/wallLoss';
import { Losses } from '../../../shared/models/phast';
import { WallLossesService } from './wall-losses.service';

@Component({
  selector: 'app-wall-losses',
  templateUrl: './wall-losses.component.html',
  styleUrls: ['./wall-losses.component.css']
})
export class WallLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;

  _wallLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private wallLossesService: WallLossesService) { }

  ngOnChanges(changes: SimpleChange) {
    if (!changes.isFirstChange && this._wallLosses) {
      this.saveLosses();
    }
  }

  ngOnInit() {
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    if (this.losses.wallLosses) {
      this.losses.wallLosses.forEach(loss => {
        //TODO populate with current losses
        let tmpLoss = {
          form: this.wallLossesService.getWallLossForm(loss),
          name: 'Loss #' + (this._wallLosses.length + 1),
          modifiedHeatLoss: 0.0,
          baselineHeatLoss: 0.0
        };
        this.calculateBaseline(tmpLoss);
        this.calculateModified(tmpLoss);
        this._wallLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    this._wallLosses.unshift({
      form: this.wallLossesService.initForm(),
      name: 'Loss #' + (this._wallLosses.length + 1),
      modifiedHeatLoss: 0.0,
      baselineHeatLoss: 0.0
    });
  }

  removeLoss(str: string) {
    this._wallLosses = _.remove(this._wallLosses, loss => {
      return loss.name != str;
    });
    this.renameLossess();
  }

  renameLossess() {
    let index = 1;
    this._wallLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculateModified(loss: any) {
    loss.modifiedHeatLoss = this.phastService.wallLosses(
      loss.form.value.modifiedSurfaceArea,
      loss.form.value.modifiedAmbientTemp,
      loss.form.value.modifiedAvgSurfaceTemp,
      loss.form.value.modifiedWindVelocity,
      loss.form.value.modifiedSurfaceEmissivity,
      loss.form.value.modifiedConditionFactor,
      loss.form.value.modifiedCorrectionFactor
    );
  }

  calculateBaseline(loss: any) {
    loss.baselineHeatLoss = this.phastService.wallLosses(
      loss.form.value.baselineSurfaceArea,
      loss.form.value.baselineAmbientTemp,
      loss.form.value.baselineAvgSurfaceTemp,
      loss.form.value.baselineWindVelocity,
      loss.form.value.baselineSurfaceEmissivity,
      loss.form.value.baselineConditionFactor,
      loss.form.value.baselineCorrectionFactor
    );
  }

  saveLosses() {
    let tmpWallLosses = new Array<WallLoss>();
    this._wallLosses.forEach(loss => {
      let tmpWallLoss = this.wallLossesService.getWallLossFromForm(loss.form);
      debugger
      tmpWallLosses.push(tmpWallLoss);
    })
    this.losses.wallLosses = tmpWallLosses;
  }
}
