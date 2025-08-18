import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { SolidLoadChargeMaterial } from '../../../../shared/models/materials';
import { FixtureLoss } from '../../../../shared/models/phast/losses/fixtureLoss';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-fixture-summary',
  templateUrl: './fixture-summary.component.html',
  styleUrls: ['./fixture-summary.component.css'],
  standalone: false
})
export class FixtureSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  numLosses: number = 0;
  collapse: boolean = true;
  lossData: Array<any>;
  materialOptions: Array<SolidLoadChargeMaterial>;

  materialNameDiff: Array<boolean>;
  specificHeatDiff: Array<boolean>;
  feedRateDiff: Array<boolean>;
  initialTemperatureDiff: Array<boolean>;
  finalTemperatureDiff: Array<boolean>;
  correctionFactorDiff: Array<boolean>;
  numMods: number = 0;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: any;

  constructor(private cd: ChangeDetectorRef, private convertUnitsService: ConvertUnitsService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService
  ) { }

  async ngOnInit() {
    this.materialNameDiff = new Array();
    this.specificHeatDiff = new Array();
    this.feedRateDiff = new Array();
    this.initialTemperatureDiff = new Array();
    this.finalTemperatureDiff = new Array();
    this.correctionFactorDiff = new Array();

    this.materialOptions = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.fixtureLosses) {
        this.numLosses = this.phast.losses.fixtureLosses.length;
        let index = 0;
        this.phast.losses.fixtureLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = mod.phast.losses.fixtureLosses[index];
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: loss,
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.materialNameDiff.push(false);
          this.specificHeatDiff.push(false);
          this.feedRateDiff.push(false);
          this.initialTemperatureDiff.push(false);
          this.finalTemperatureDiff.push(false);
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

  getMaterialName(id: number) {
    if (id) {
      let option = this.materialOptions.find(val => { return id === val.id; });
      if (option) {
        return option.substance;
      } else {
        return '';
      }
    }
    return '';
  }

  checkSpecificHeat(loss: FixtureLoss) {
    let material: SolidLoadChargeMaterial = this.materialOptions.find(val => { return val.id === loss.materialName; });
    if (material) {
      if (this.settings.unitsOfMeasure === 'Metric') {
        let val = this.convertUnitsService.value(material.specificHeatSolid).from('btulbF').to('kJkgC');
        material.specificHeatSolid = this.roundVal(val, 4);
      }
      if (material.specificHeatSolid !== loss.specificHeat) {
        return true;
      } else {
        return false;
      }
    }
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
