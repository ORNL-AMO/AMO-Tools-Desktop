import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { Losses } from '../../../shared/models/phast/phast';
import { WallLossesService } from './wall-losses.service';
import { WallLossCompareService } from './wall-loss-compare.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { Settings } from '../../../shared/models/settings';
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
  isLossesSetup: boolean;

  _wallLosses: Array<any>;
  firstChange: boolean = true;
  resultsUnit: string
  constructor(private phastService: PhastService, private wallLossesService: WallLossesService, private wallLossCompareService: WallLossCompareService, private windowRefService: WindowRefService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //toggle save clicked saves losses
      if (changes.saveClicked) {
        this.saveLosses();
      }
      //toggle add loss adds loss
      if (changes.addLossToggle) {
        this.addLoss();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    if(this.settings.energyResultUnit != 'kWh'){
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    }else{
      this.resultsUnit = 'kW';
    }
    //initialize component data array
    //_wallLosses is array of objects that is used by wall-losses.component
    if (!this._wallLosses) {
      this._wallLosses = new Array();
    }
    //convert current wall losses to forms and add to component array
    if (this.losses.wallLosses) {
      //set our baseline or modification losses for comparisons
      this.setCompareVals();
      this.wallLossCompareService.initCompareObjects();
      this.losses.wallLosses.forEach(loss => {
        //create a temp loss object
        let tmpLoss = {
          form: this.wallLossesService.getWallLossForm(loss),
          name: 'Loss #' + (this._wallLosses.length + 1),
          heatLoss: loss.heatLoss || 0.0
        };
        //attempt to calculate tmpLoss results
        this.calculate(tmpLoss);
        //add object to component data array
        this._wallLosses.push(tmpLoss);
      })
    }
    //subscribe to deleteLossIndex object in wallLossesService
    //used to delete from modification and baseline at same time
    this.wallLossesService.deleteLossIndex.subscribe((lossIndex) => {
      if (lossIndex != undefined) {
        //remove at index
        if (this.losses.wallLosses) {
          this._wallLosses.splice(lossIndex, 1);
          //remove comparison object as well
          if (this.wallLossCompareService.differentArray && !this.isBaseline) {
            this.wallLossCompareService.differentArray.splice(lossIndex, 1);
          }
        }
      }
    })

    //add monitor so both baseline and modification add loss when clicked
    if (this.isBaseline) {
      this.wallLossesService.addLossBaselineMonitor.subscribe((val) => {
        if (val == true) {
          this._wallLosses.push({
            form: this.wallLossesService.initForm(),
            name: 'Loss #' + (this._wallLosses.length + 1),
            heatLoss: 0.0
          })
        }
      })
    } else {
      this.wallLossesService.addLossModifiedMonitor.subscribe((val) => {
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
    //clean up subscriptions on destroy
    if (this.isBaseline) {
      this.wallLossesService.addLossBaselineMonitor.next(false);
      this.wallLossCompareService.baselineWallLosses = null;
    } else {
      this.wallLossCompareService.modifiedWallLosses = null;
      this.wallLossesService.addLossModifiedMonitor.next(false);
    }
    this.wallLossesService.deleteLossIndex.next(null);
  }

  addLoss() {
    //if adding loss in modification signal to baseline to add loss
    if (this.isLossesSetup) {
      this.wallLossesService.addLoss(this.isBaseline);
    }
    //check compare service objects has been initialized
    //have modify conditions view call so that it isn't called twice => (!this.isBaseline)
    if (this.wallLossCompareService.differentArray) {
      this.wallLossCompareService.addObject(this.wallLossCompareService.differentArray.length - 1);
    }
    //add new empty loss to component data
    this._wallLosses.push({
      form: this.wallLossesService.initForm(),
      name: 'Loss #' + (this._wallLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(lossIndex: number) {
    //signal delete to service
    this.wallLossesService.setDelete(lossIndex);
  }

  //TODO: need to handle new losses after a loss has been deleted, can currently have same name
  renameLossess() {
    let index = 1;
    this._wallLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  //calculate wall loss results
  calculate(loss: any) {
    if (loss.form.status == 'VALID') {
      let tmpWallLoss: WallLoss = this.wallLossesService.getWallLossFromForm(loss.form);
      loss.heatLoss = this.phastService.wallLosses(tmpWallLoss, this.settings);
    } else {
      loss.heatLoss = null;
    }
  }

  saveLosses() {
    //temp array will hold new losses data
    let tmpWallLosses = new Array<WallLoss>();
    //iterate through component array to build up new data
    this._wallLosses.forEach(loss => {
      let tmpWallLoss = this.wallLossesService.getWallLossFromForm(loss.form);
      tmpWallLoss.heatLoss = loss.heatLoss;
      tmpWallLosses.push(tmpWallLoss);
    })
    //set input data to equal new data for update
    this.losses.wallLosses = tmpWallLosses;
    //set values for compare service
    this.setCompareVals();
    //emit to losses.component that data is updated and should be saved
    this.savedLoss.emit(true);
  }
  //used for field by field context, send name of current field to losses.component
  changeField(str: string) {
    this.fieldChange.emit(str);
  }
  //used for compare service
  setCompareVals() {
    //depending on modification/baseline set values for comparison
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
}
