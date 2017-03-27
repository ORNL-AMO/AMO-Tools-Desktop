import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { OpeningLossesService } from './opening-losses.service';
import { Losses } from '../../../shared/models/phast';

@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {
  @Input()
  losses: Losses;

  _openingLosses: Array<any>;
  editLoss: any;
  constructor(private phastService: PhastService, private openingLossesService: OpeningLossesService) { }

  ngOnInit() {
    if (!this._openingLosses) {
      this._openingLosses = new Array();
    }
    if (this.losses.openingLosses) {
      this.losses.openingLosses.forEach(loss => {
        let tmpLoss = {
          form: this.openingLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._openingLosses.length + 1),
          totalOpeningLosses: 0.0
        };
        this.calculate(tmpLoss);
        debugger;
        this._openingLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    let tmpName = 'Opening Loss #' + (this._openingLosses.length + 1);
    this._openingLosses.push({
      form: this.openingLossesService.initForm(),
      name: tmpName,
      totalOpeningLosses: 0.0
    });
  }

  removeLoss(str: string) {
    this._openingLosses = _.remove(this._openingLosses, loss => {
      return loss.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this._openingLosses.forEach(loss => {
      loss.name = 'Opening #' + index;
      index++;
    })
  }


  hideCalc(loss: any) {
    loss.showFixed = false;
    loss.showVariable = false;
  }


  calculate(loss: any) {
    if (loss.form.value.openingType == 'Rectangular (Square)') {
      let ratio = Math.min(loss.form.value.lengthOfOpening, loss.form.value.heightOfOpening) / loss.form.value.wallThickness;
      let lossAmount = this.phastService.openingLossesQuad(
        loss.form.value.emissivity,
        loss.form.value.lengthOfOpening,
        loss.form.value.heightOfOpening,
        loss.form.value.wallThickness,
        ratio,
        loss.form.value.ambientTemp,
        loss.form.value.insideTemp,
        loss.form.value.percentTimeOpen,
        loss.form.value.viewFactor
      );
      loss.totalOpeningLosses = loss.form.value.numberOfOpenings * lossAmount;
    } else if (loss.form.value.openingType == 'Round') {
      let ratio = loss.form.value.lengthOfOpening / loss.form.value.wallThickness;
      let lossAmount = this.phastService.openingLossesCircular(
        loss.form.value.emissivity,
        loss.form.value.lengthOfOpening,
        loss.form.value.wallThickness,
        ratio,
        loss.form.value.ambientTemp,
        loss.form.value.insideTemp,
        loss.form.value.percentTimeOpen,
        loss.form.value.viewFactor
      );
      loss.totalOpeningLosses = loss.form.value.numberOfOpenings * lossAmount;
    }
  }
}
