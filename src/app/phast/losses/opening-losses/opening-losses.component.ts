import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { OpeningLossesService } from './opening-losses.service';
import { Losses } from '../../../shared/models/phast';
import { OpeningLoss } from '../../../shared/models/losses/openingLoss';

@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  lossState: any;
  @Input()
  saveClicked: boolean;
  @Input()
  addLossToggle: boolean;


  _openingLosses: Array<any>;
  firstChange: boolean = true;
  
  constructor(private phastService: PhastService, private openingLossesService: OpeningLossesService) { }


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
        this._openingLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    let tmpName = 'Opening Loss #' + (this._openingLosses.length + 1);
    this._openingLosses.unshift({
      form: this.openingLossesService.initForm(),
      name: tmpName,
      totalOpeningLosses: 0.0
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._openingLosses = _.remove(this._openingLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this._openingLosses.forEach(loss => {
      loss.name = 'Opening #' + index;
      index++;
    })
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

  saveLosses() {
    let tmpOpeningLosses = new Array<OpeningLoss>();
    this._openingLosses.forEach(loss => {
      let tmpOpeningLoss = this.openingLossesService.getLossFromForm(loss.form);
      tmpOpeningLosses.unshift(tmpOpeningLoss);
    })
    this.losses.openingLosses = tmpOpeningLosses;
    this.lossState.numLosses = this.losses.openingLosses.length;
    this.lossState.saved = true;

  }
}
