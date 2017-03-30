import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { ExtendedSurface } from '../../../shared/models/losses/extendedSurface';
import { Losses } from '../../../shared/models/phast';
import { ExtendedSurfaceLossesService } from './extended-surface-losses.service';


@Component({
  selector: 'app-extended-surface-losses',
  templateUrl: './extended-surface-losses.component.html',
  styleUrls: ['./extended-surface-losses.component.css']
})
export class ExtendedSurfaceLossesComponent implements OnInit {

  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  lossState: any;

  _surfaceLosses: Array<any>;

  constructor(private phastService: PhastService, private extendedSurfaceLossesService: ExtendedSurfaceLossesService) { }

  ngOnChanges(changes: SimpleChange) {
    if (!changes.isFirstChange && this._surfaceLosses) {
      this.saveLosses();
    }
  }

  ngOnInit() {
    if (!this._surfaceLosses) {
      this._surfaceLosses = new Array();
    }
    if (this.losses.extendedSurfaces) {
      this.losses.extendedSurfaces.forEach(loss => {
        let tmpLoss = {
          form: this.extendedSurfaceLossesService.getSurfaceLossForm(loss),
          name: 'Loss #' + (this._surfaceLosses.length + 1),
          heatLoss: 0.0
        };
        this.calculate(tmpLoss);
        this._surfaceLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    this._surfaceLosses.unshift({
      form: this.extendedSurfaceLossesService.initForm(),
      name: 'Loss #' + (this._surfaceLosses.length + 1),
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._surfaceLosses = _.remove(this._surfaceLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLossess();
  }

  renameLossess() {
    let index = 1;
    this._surfaceLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    //EXTENDED SURFACE LOSS = WALL LOSS WITH ASSUMPTIONS:
    //windVelocity = 5
    //correctionFactor = 1
    //conditionFactor = 1
    loss.heatLoss = this.phastService.wallLosses(
      loss.form.value.surfaceArea,
      loss.form.value.ambientTemp,
      loss.form.value.avgSurfaceTemp,
      5,
      loss.form.value.surfaceEmissivity,
      1,
      1
    );

  }

  saveLosses() {
    let tmpSurfaceLosses = new Array<ExtendedSurface>();
    this._surfaceLosses.forEach(loss => {
      let tmpSurfaceLoss = this.extendedSurfaceLossesService.getSurfaceLossFromForm(loss.form);
      tmpSurfaceLosses.unshift(tmpSurfaceLoss);
    })
    this.losses.extendedSurfaces = tmpSurfaceLosses;
    this.lossState.numLosses = this.losses.extendedSurfaces.length;
    this.lossState.saved = true;
  }
}
