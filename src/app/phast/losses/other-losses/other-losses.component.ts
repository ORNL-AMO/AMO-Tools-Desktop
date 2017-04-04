import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { OtherLossesService } from './other-losses.service';
import { Losses } from '../../../shared/models/phast';
import { OtherLoss } from '../../../shared/models/losses/otherLoss';

@Component({
  selector: 'app-other-losses',
  templateUrl: './other-losses.component.html',
  styleUrls: ['./other-losses.component.css']
})
export class OtherLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  lossState: any;
  @Input()
  addLossToggle: boolean;
  
  _otherLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private otherLossesService: OtherLossesService) { }

 
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
    if (!this._otherLosses) {
      this._otherLosses = new Array();
    }
    if (this.losses.otherLosses) {
      this.losses.otherLosses.forEach(loss => {
        let tmpLoss = {
          form: this.otherLossesService.getFormFromLoss(loss),
          name: 'Loss #' + (this._otherLosses.length + 1),
          heatLoss: 0.0
        };
        this.calculate(tmpLoss);
        this._otherLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    this._otherLosses.push({
      form: this.otherLossesService.initForm(),
      name: 'Loss #' + (this._otherLosses.length + 1)
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._otherLosses = _.remove(this._otherLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this._otherLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = loss.form.value.heatLoss;
  }


  saveLosses() {
    let tmpLosses = new Array<OtherLoss>();
    this._otherLosses.forEach(loss => {
      let tmpLoss = this.otherLossesService.getLossFromForm(loss.form);
      tmpLosses.unshift(tmpLoss);
    })
    this.losses.otherLosses = tmpLosses;
    this.lossState.numLosses = this.losses.otherLosses.length;
    this.lossState.saved = true;
  }
}
