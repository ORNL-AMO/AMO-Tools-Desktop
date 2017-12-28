import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-wall-summary',
  templateUrl: './wall-summary.component.html',
  styleUrls: ['./wall-summary.component.css']
})
export class WallSummaryComponent implements OnInit {
  @Input()
  phast: PHAST
  @Input()
  settings: Settings;
  //array holds table data
  lossData: Array<any>;
  //substance data held as id, need to use array to get substance name
  surfaceOrientationOptions: Array<any>;
  //num of wall losses
  numLosses: number = 0;
  //used to collapse table
  collapse: boolean = true;

  //booleans corresponding to each input, used to style indicating different
  correctionFactorDifferent: Array<boolean>;
  surfaceAreaDifferent: Array<boolean>;
  avgSurfaceTempDiff: Array<boolean>;
  ambientTempDiff: Array<boolean>;
  windVelocityDiff: Array<boolean>;
  surfaceShapeDiff: Array<boolean>;
  conditionFactorDiff: Array<boolean>;
  emissivityDiff: Array<boolean>;
  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    //init diff arrays
    this.correctionFactorDifferent = new Array<boolean>();
    this.surfaceAreaDifferent = new Array<boolean>();
    this.avgSurfaceTempDiff = new Array<boolean>();
    this.ambientTempDiff = new Array<boolean>();
    this.windVelocityDiff = new Array<boolean>();
    this.surfaceShapeDiff = new Array<boolean>();
    this.conditionFactorDiff = new Array<boolean>();
    this.emissivityDiff = new Array<boolean>();

    //get substances
    this.surfaceOrientationOptions = this.suiteDbService.selectWallLossesSurface();
    //init array
    this.lossData = new Array();
    if (this.phast.losses) {
      //check losses exist
      if (this.phast.losses.wallLosses) {
        //set num losses
        this.numLosses = this.phast.losses.wallLosses.length;
        //used to get loss for pairing with baseline in lossData array
        let index: number = 0;
        //iterate each loss
        this.phast.losses.wallLosses.forEach(loss => {
          //for each loss create array to hold corresponding loss data for each modification
          let modificationData = new Array();
          //if modifications exist
          if (this.phast.modifications) {
            //iterate each modification to get corresponding loss data
            this.phast.modifications.forEach(mod => {
              //use index to get corresponding loss data
              let modData = mod.phast.losses.wallLosses[index];
              //add modification loss data to modification array
              modificationData.push(modData);
            })
          }
          //add baseline and modification data to lossData
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //add false for each different array
          this.correctionFactorDifferent.push(false);
          this.surfaceAreaDifferent.push(false);
          this.avgSurfaceTempDiff.push(false);
          this.ambientTempDiff.push(false);
          this.windVelocityDiff.push(false);
          this.surfaceShapeDiff.push(false);
          this.conditionFactorDiff.push(false);
          this.emissivityDiff.push(false);
          //index +1 for next loss
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, index: number) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool][index] != true) {
        //set true/different
        this[diffBool][index] = true;
        //tell html to detect change
        this.cd.detectChanges();
      }
      return true;
    } else {
      return false;
    }
  }

  //function for getting surface from suiteDb
  getSurfaceOption(id: number) {
    if (id) {
      let option = this.surfaceOrientationOptions.filter(val => { return id == val.id });
      if (option.length != 0) {
        return option[0].surface;
      } else {
        return ''
      }
    }
    return '';
  }

  //function called from html for collapsing
  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
