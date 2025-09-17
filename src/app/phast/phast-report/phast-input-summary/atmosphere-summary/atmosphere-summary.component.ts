import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { AtmosphereSpecificHeat } from '../../../../shared/models/materials';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { firstValueFrom } from 'rxjs';
import { roundVal } from '../../../../shared/helperFunctions';

@Component({
    selector: 'app-atmosphere-summary',
    templateUrl: './atmosphere-summary.component.html',
    styleUrls: ['./atmosphere-summary.component.css'],
    standalone: false
})
export class AtmosphereSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  //array holds table data
  lossData: Array<any>;
  //num of atmosphere losses
  numLosses: number = 0;
  //used to collapse table
  collapse: boolean = true;
  //use array to get gas names
  gasOptions: Array<AtmosphereSpecificHeat>;
  
  atmosphereGasDiff: Array<boolean>;
  specificHeatDiff: Array<boolean>;
  inletTempDiff: Array<boolean>;
  outletTempDiff: Array<boolean>;
  flowRateDiff: Array<boolean>;
  correctionFactorDiff: Array<boolean>;
  numMods: number = 0;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private atmosphereDbService: AtmosphereDbService, private cd: ChangeDetectorRef, private convertUnitsService: ConvertUnitsService) { }

  async ngOnInit() {
    this.atmosphereGasDiff = new Array();
    this.specificHeatDiff = new Array();
    this.inletTempDiff = new Array();
    this.outletTempDiff = new Array();
    this.flowRateDiff = new Array();
    this.correctionFactorDiff = new Array();

    this.gasOptions = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.atmosphereLosses) {
        this.numLosses = this.phast.losses.atmosphereLosses.length;
        let index: number = 0;
        this.phast.losses.atmosphereLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.atmosphereLosses[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.atmosphereGasDiff.push(false);
          this.specificHeatDiff.push(false);
          this.inletTempDiff.push(false);
          this.outletTempDiff.push(false);
          this.flowRateDiff.push(false);
          this.correctionFactorDiff.push(false);
          //index +1 for next loss
          index++;
        });
      }
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal !== modificationVal) {
      //this[diffBool] gets corresponding variable
      //only set true once
      if (this[diffBool][modIndex] !== true) {
        //set true/different
        this[diffBool][modIndex] = true;
        //tell html to detect change
        this.cd.detectChanges();
      }
      return true;
    } else {
      return false;
    }
  }

  checkSpecificHeat(loss: AtmosphereLoss) {
    let material: AtmosphereSpecificHeat = this.gasOptions.find(gas => gas.id === loss.atmosphereGas);
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeat).from('btulbF').to('kJkgC');
        material.specificHeat = roundVal(val, 4);
      }
      if (material.specificHeat !== loss.specificHeat) {
        return true;
      } else {
        return false;
      }
    }
  }

  getGas(id: number) {
    if (id) {
      let option = this.gasOptions.filter(val => { return id === val.id; });
      if (option.length !== 0) {
        return option[0].substance;
      } else {
        return '';
      }
    }
    return '';
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}
