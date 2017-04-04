import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { AtmosphereLossesService } from './atmosphere-losses.service';
import { Losses } from '../../../shared/models/phast';
import { AtmosphereLoss } from '../../../shared/models/losses/atmosphereLoss';

@Component({
  selector: 'app-atmosphere-losses',
  templateUrl: './atmosphere-losses.component.html',
  styleUrls: ['./atmosphere-losses.component.css']
})
export class AtmosphereLossesComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  lossState: any;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();

  _atmosphereLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private atmosphereLossesService: AtmosphereLossesService, private phastService: PhastService) { }
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
    if (!this._atmosphereLosses) {
      this._atmosphereLosses = new Array();
    }
    if (this.losses.atmosphereLosses) {
      this.losses.atmosphereLosses.forEach(loss => {
        let tmpLoss = {
          form: this.atmosphereLossesService.getAtmosphereForm(loss),
          name: 'Loss #' + (this._atmosphereLosses.length + 1),
          heatLoss: 0.0
        };
        this.calculate(tmpLoss);
        this._atmosphereLosses.unshift(tmpLoss);
      })
    }
  }

  addLoss() {
    let tmpForm = this.atmosphereLossesService.initForm();
    let tmpName = 'Loss #' + (this._atmosphereLosses.length + 1);
    this._atmosphereLosses.unshift({
      form: tmpForm,
      name: tmpName,
      heatLoss: 0.0
    });
    this.lossState.saved = false;
  }

  removeLoss(str: string) {
    this._atmosphereLosses = _.remove(this._atmosphereLosses, loss => {
      return loss.name != str;
    });
    this.lossState.saved = false;
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this._atmosphereLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    loss.heatLoss = this.phastService.atmosphere(
      loss.form.value.inletTemp,
      loss.form.value.outletTemp,
      loss.form.value.flowRate,
      loss.form.value.correctionFactor,
      loss.form.value.specificHeat
    );
  }

  saveLosses() {
    let tmpAtmosphereLosses = new Array<AtmosphereLoss>();
    this._atmosphereLosses.forEach(loss => {
      let tmpAtmosphereLoss = this.atmosphereLossesService.getLossFromForm(loss.form);
      tmpAtmosphereLosses.unshift(tmpAtmosphereLoss);
    })
    this.losses.atmosphereLosses = tmpAtmosphereLosses;
    this.lossState.numLosses = this.losses.atmosphereLosses.length;
    this.lossState.saved = true;
    this.savedLoss.emit(true);
  }
}
