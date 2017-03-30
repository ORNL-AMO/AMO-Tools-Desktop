import { Component, OnInit, Input, SimpleChange } from '@angular/core';
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
  @Input()
  lossState: any;

  _wallLosses: Array<any>;
  _adjustments: Array<any>;

  constructor(private phastService: PhastService, private wallLossesService: WallLossesService) { }

  ngOnChanges(changes: SimpleChange) {
    if (!changes.isFirstChange && this._wallLosses) {
      this.saveLosses();
    }
  }

  ngOnInit() {
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    if (!this._adjustments) {
      this._adjustments = new Array();
    }
    if (this.losses.wallLosses) {
      this.losses.wallLosses.forEach(loss => {
        let tmpLoss = {
          form: this.wallLossesService.getWallLossForm(loss),
          name: 'Loss #' + (this._wallLosses.length + 1),
          heatLoss: 0.0
        };
        this.calculate(tmpLoss);
        this._wallLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    this._wallLosses.unshift({
      form: this.wallLossesService.initForm(),
      name: 'Loss #' + (this._wallLosses.length + 1),
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._wallLosses = _.remove(this._wallLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLossess();
  }

  renameLossess() {
    let index = 1;
    this._wallLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  addAdjustment() {
    let tmpArray = new Array();
    this._wallLosses.forEach(loss => {
      tmpArray.push({
        form: loss.form,
        name: loss.name,
        heatLoss: loss.heatLoss
      })
    })
    this._adjustments.push({
      losses: tmpArray,
      name: 'Adjustment'
    })
  }

  calculate(loss: any) {
    loss.heatLoss = this.phastService.wallLosses(
      loss.form.value.surfaceArea,
      loss.form.value.ambientTemp,
      loss.form.value.avgSurfaceTemp,
      loss.form.value.windVelocity,
      loss.form.value.surfaceEmissivity,
      loss.form.value.conditionFactor,
      loss.form.value.correctionFactor
    );
  }

  saveLosses() {
    let tmpWallLosses = new Array<WallLoss>();
    this._wallLosses.forEach(loss => {
      let tmpWallLoss = this.wallLossesService.getWallLossFromForm(loss.form);
      tmpWallLosses.unshift(tmpWallLoss);
    })
    this.losses.wallLosses = tmpWallLosses;
    this.lossState.numLosses = this.losses.wallLosses.length;
    this.lossState.saved = true;
  }
}
