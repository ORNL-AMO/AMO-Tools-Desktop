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
  @Output('emitDelete')
  emitDelete = new EventEmitter<number>();

  @Input()
  baselineLosses: Losses;

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
    console.log(this.baselineLosses);
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    if (this.losses.wallLosses) {
      this.setCompareVals();
      this.wallLossCompareService.initCompareObjects();
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
    this.wallLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        //remove at index
        if (this.losses.wallLosses) {
          this._wallLosses.splice(lossIndex, 1);
          if (this.wallLossCompareService.differentArray && !this.isBaseline) {
            this.wallLossCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })

    if (this.isBaseline) {
      this.wallLossesService.addLossMonitor.subscribe((val) => {
        if (val == true) {
          this._wallLosses.push({
            form: this.wallLossesService.initForm(),
            name: 'Loss #' + (this._wallLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    }
  }

  ngOnDestroy() {
    this.wallLossCompareService.baselineWallLosses = null;
    this.wallLossCompareService.modifiedWallLosses = null;
    this.wallLossesService.deleteLossIndex.next(null);
    this.wallLossesService.addLossMonitor.next(false);
  }

  addLoss() {
    //if adding loss in modification signal to baseline to add loss
    if (!this.isBaseline) {
      this.wallLossesService.addLoss();
    }
    //check compare service objects has been initialized
    //have modify conditions view call so that it isn't called twice
    if (this.wallLossCompareService.differentArray && !this.isBaseline) {
      this.wallLossCompareService.addObject(this.wallLossCompareService.differentArray.length - 1);
    }
    this._wallLosses.push({
      form: this.wallLossesService.initForm(),
      name: 'Loss #' + (this._wallLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    this.wallLossesService.setDelete(lossIndex);
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
    this.losses.wallLosses = tmpWallLosses;

    //set values for compare service
    this.setCompareVals();
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
    //if compare objects have been initialized check them
    //use modify conditions view to call for the check
    if (this.wallLossCompareService.differentArray && !this.isBaseline) {
      if (this.wallLossCompareService.differentArray.length != 0) {
        this.wallLossCompareService.checkWallLosses();
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
