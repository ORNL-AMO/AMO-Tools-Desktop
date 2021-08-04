import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { Losses } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WallFormService } from '../../../calculator/furnaces/wall/wall-form.service';

@Component({
  selector: 'app-wall-losses',
  templateUrl: './wall-losses.component.html',
  styleUrls: ['./wall-losses.component.css']
})
export class WallLossesComponent implements OnInit {
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

  _wallLosses: Array<WallLossObj>;
  firstChange: boolean = true;
  resultsUnit: string;
  lossesLocked: boolean = false;
  total: number = 0;
  constructor(private phastService: PhastService, private wallFormService: WallFormService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //toggle add loss adds loss
      if (changes.addLossToggle) {
        this.addLoss();
      } else if (changes.modificationIndex) {
        this._wallLosses = new Array();
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
    //initialize component data array
    //_wallLosses is array of objects that is used by wall-losses.component
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    //convert current wall losses to forms and add to component array
    this.initForms();

    if (this.inSetup && this.modExists) {
      this.lossesLocked = true;
    }
  }

  initForms() {
    //convert current wall losses to forms and add to component array
    if (this.losses.wallLosses) {
      let lossIndex = 1;
      this.losses.wallLosses.forEach(loss => {
        //create a temp loss object
        let tmpLoss = {
          form: this.wallFormService.getWallLossForm(loss, true),
          heatLoss: loss.heatLoss || 0.0,
          collapse: false
        };
        if (!tmpLoss.form.controls.name.value) {
          tmpLoss.form.patchValue({
            name: 'Loss #' + lossIndex
          });
        }
        lossIndex++;
        //attempt to calculate tmpLoss results
        this.calculate(tmpLoss);
        //add object to component data array
        this._wallLosses.push(tmpLoss);
      });
      this.total = this.getTotal();
    }
  }

  addLoss() {
    //add new empty loss to component data
    this._wallLosses.push({
      form: this.wallFormService.initForm(this._wallLosses.length + 1),
      heatLoss: 0.0,
      collapse: false
    });

    this.saveLosses();
  }

  collapseLoss(loss: WallLossObj) {
    loss.collapse = !loss.collapse;
  }

  removeLoss(lossIndex: number) {
    this._wallLosses.splice(lossIndex, 1);
    this.saveLosses();
    this.total = this.getTotal();
  }

  //calculate wall loss results
  calculate(loss: WallLossObj) {
    if (loss.form.status === 'VALID') {
      let tmpWallLoss: WallLoss = this.wallFormService.getWallLossFromForm(loss.form);
      loss.heatLoss = this.phastService.wallLosses(tmpWallLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
    this.total = this.getTotal();
  }

  saveLosses() {
    //temp array will hold new losses data
    let tmpWallLosses = new Array<WallLoss>();
    //iterate through component array to build up new data
    let lossIndex = 1;
    this._wallLosses.forEach(loss => {
      if (!loss.form.controls.name.value) {
        loss.form.patchValue({
          name: 'Loss #' + lossIndex
        });
      }
      lossIndex++;
      let tmpWallLoss = this.wallFormService.getWallLossFromForm(loss.form);
      tmpWallLoss.heatLoss = loss.heatLoss;
      tmpWallLosses.push(tmpWallLoss);
    });
    //set input data to equal new data for update
    this.losses.wallLosses = tmpWallLosses;
    //emit to losses.component that data is updated and should be saved
    this.savedLoss.emit(true);
  }

  //used for field by field context, send name of current field to losses.component
  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  getTotal() {
    return _.sumBy(this._wallLosses, 'heatLoss');
  }
}


export interface WallLossObj {
  form: FormGroup;
  heatLoss?: number;
  collapse: boolean;
}
