import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { WallLoss } from '../../../shared/models/losses/wallLoss';
import { Losses } from '../../../shared/models/phast';
import { WallLossesService } from './wall-losses.service';
import { WallLossCompareService } from './wall-loss-compare.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';

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

  _wallLosses: Array<any>;
  firstChange: boolean = true;
  constructor(private phastService: PhastService, private wallLossesService: WallLossesService, private wallLossCompareService: WallLossCompareService, private windowRefService: WindowRefService) { }

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
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    if (this.losses.wallLosses) {
      //this.setCompareVals();
      //this.wallLossCompareService.initCompareObjects();
      this.losses.wallLosses.forEach(loss => {
        let tmpLoss = {
          form: this.wallLossesService.getWallLossForm(loss),
          name: 'Loss #' + (this._wallLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        this.calculate(tmpLoss);
        this._wallLosses.push(tmpLoss);
      })
    }
  }

  ngOnDestroy() {
    this.wallLossCompareService.baselineWallLosses = null;
    this.wallLossCompareService.modifiedWallLosses = null;
  }

  addLoss() {
    let tmpForm = this.wallLossesService.initForm();
    let tmpLoss = this.wallLossesService.getWallLossFromForm(tmpForm);
    this.losses.wallLosses.push(tmpLoss);
    //this.setCompareVals();
    //this.wallLossCompareService.initCompareObjects();

    this._wallLosses.push({
      form: tmpForm,
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
      tmpWallLoss.heatLoss = loss.heatLoss;
      tmpWallLosses.push(tmpWallLoss);
    })
    let priorLength = this.losses.wallLosses.length;
    this.losses.wallLosses = tmpWallLosses;
    this.lossState.numLosses = this.losses.wallLosses.length;
    this.lossState.saved = true;
    this.setCompareVals();
    //this.checkHeatLoss();
    this.savedLoss.emit(true);
  }

  changeField(str: string) {
    this.fieldChange.emit(str);
  }

  setCompareVals() {
    if (this.isBaseline) {
      this.wallLossCompareService.baselineWallLosses = this.losses.wallLosses;
    } else {
      this.wallLossCompareService.modifiedWallLosses = this.losses.wallLosses;
    }
    if (this.wallLossCompareService.differentArray) {
      if (this.wallLossCompareService.differentArray.length != 0) {
        this.wallLossCompareService.checkWallLosses();
      } else {
        this.wallLossCompareService.initCompareObjects();
      }
    }
  }

  // checkHeatLoss() {
  //   if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses) {
  //     if (this.wallLossCompareService.baselineWallLosses.length == this.wallLossCompareService.modifiedWallLosses.length) {
  //       for (let index = 0; index < this.wallLossCompareService.baselineWallLosses.length; index++) {
  //         let baselineHeatLoss = this.phastService.wallLosses(
  //           this.wallLossCompareService.baselineWallLosses[index].surfaceArea,
  //           this.wallLossCompareService.baselineWallLosses[index].ambientTemperature,
  //           this.wallLossCompareService.baselineWallLosses[index].surfaceTemperature,
  //           this.wallLossCompareService.baselineWallLosses[index].windVelocity,
  //           this.wallLossCompareService.baselineWallLosses[index].surfaceEmissivity,
  //           this.wallLossCompareService.baselineWallLosses[index].conditionFactor,
  //           this.wallLossCompareService.baselineWallLosses[index].correctionFactor
  //         );
  //         let modifiedHeatLoss = this.phastService.wallLosses(
  //           this.wallLossCompareService.modifiedWallLosses[index].surfaceArea,
  //           this.wallLossCompareService.modifiedWallLosses[index].ambientTemperature,
  //           this.wallLossCompareService.modifiedWallLosses[index].surfaceTemperature,
  //           this.wallLossCompareService.modifiedWallLosses[index].windVelocity,
  //           this.wallLossCompareService.modifiedWallLosses[index].surfaceEmissivity,
  //           this.wallLossCompareService.modifiedWallLosses[index].conditionFactor,
  //           this.wallLossCompareService.modifiedWallLosses[index].correctionFactor
  //         )
  //         if (baselineHeatLoss != modifiedHeatLoss) {
  //           console.log('dif')
  //           let doc = this.windowRefService.getDoc();
  //           let heatLossElements = doc.getElementsByClassName('heatLoss_' + index);
  //           debugger;
  //           heatLossElements.forEach(element => {
  //             element.classList.toggle('indicate-different', true);
  //           });
  //         } else {
  //           console.log('same')
  //           let doc = this.windowRefService.getDoc();
  //           debugger
  //           let heatLossElements = doc.getElementsByClassName('heatLoss_' + index);
  //           heatLossElements.forEach(element => {
  //             element.classList.toggle('indicate-different', false);
  //           });
  //         }
  //       }
  //     }
  //   }
  // }
}
