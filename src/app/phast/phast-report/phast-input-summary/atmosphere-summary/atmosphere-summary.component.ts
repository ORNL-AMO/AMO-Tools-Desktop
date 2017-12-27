import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-atmosphere-summary',
  templateUrl: './atmosphere-summary.component.html',
  styleUrls: ['./atmosphere-summary.component.css']
})
export class AtmosphereSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  //array holds table data
  lossData: Array<any>;
  //num of atmosphere losses
  numLosses: number = 0;
  //used to collapse table
  collapse: boolean = true;
  //use array to get gas names
  gasOptions: Array<any>;

  atmosphereGasDiff: boolean = false;
  specificHeatDiff: boolean = false;
  inletTempDiff: boolean = false;
  outletTempDiff: boolean = false;
  flowRateDiff: boolean = false;
  correctionFactorDiff: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.gasOptions = this.suiteDbService.selectAtmosphereSpecificHeat();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
        let index: number = 0;
        this.phast.losses.atmosphereLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.atmosphereLosses[index];
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          index++;
        })
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool] != true) {
        //set true/different
        this[diffBool] = true;
        //tell html to detect change
        this.cd.detectChanges();
      }
      return true;
    } else {
      return false;
    }
  }

  getGas(id: number) {
    if (id) {
      let option = this.gasOptions.filter(val => { return id == val.id });
      if (option.length != 0) {
        return option[0].substance;
      } else {
        return ''
      }
    }
    return '';
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
