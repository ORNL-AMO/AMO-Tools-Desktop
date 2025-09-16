import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, FieldData } from '../../../../shared/models/fans';

@Component({
    selector: 'app-field-data-summary',
    templateUrl: './field-data-summary.component.html',
    styleUrls: ['./field-data-summary.component.css'],
    standalone: false
})
export class FieldDataSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  //this object will hold all FieldData objects for the assessment
  //we define the baseline and the array of modifications separately for consistency
  fieldData: { baseline: FieldData, modifications: Array<FieldData> };


  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  collapse: boolean = true;
  numMods: number = 0;
  
  flowRateDiff: Array<boolean>;
  inletPressureDiff: Array<boolean>;
  outletPressureDiff: Array<boolean>;
  loadEstimatedMethodDiff: Array<boolean>;
  motorPowerDiff: Array<boolean>;
  specificHeatRatioDiff: Array<boolean>;
  compressibilityFactorDiff: Array<boolean>;
  measuredVoltageDiff: Array<boolean>;
  // pressureCalcResultTypeDiff: Array<boolean>;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.flowRateDiff = new Array<boolean>();
    this.inletPressureDiff = new Array<boolean>();
    this.outletPressureDiff = new Array<boolean>();
    this.loadEstimatedMethodDiff = new Array<boolean>();
    this.motorPowerDiff = new Array<boolean>();
    this.specificHeatRatioDiff = new Array<boolean>();
    this.compressibilityFactorDiff = new Array<boolean>();
    this.measuredVoltageDiff = new Array<boolean>();
    //this.pressureCalcResultTypeDiff = new Array<boolean>();

    if (this.fsat.fieldData) {

      let mods = new Array<FieldData>();

      if (this.fsat.modifications) {

        this.numMods = this.fsat.modifications.length;

        for (let i = 0; i < this.fsat.modifications.length; i++) {

          if (this.fsat.modifications[i].fsat.fieldData) {
            // fieldData changes
            mods.push(this.fsat.modifications[i].fsat.fieldData);
          }
          this.flowRateDiff.push(false);
          this.inletPressureDiff.push(false);
          this.outletPressureDiff.push(false);
          this.loadEstimatedMethodDiff.push(false);
          this.motorPowerDiff.push(false);
          this.specificHeatRatioDiff.push(false);
          this.compressibilityFactorDiff.push(false);
          this.measuredVoltageDiff.push(false);
          //this.pressureCalcResultTypeDiff.push(false);


        }

        this.fieldData = {
          baseline: this.fsat.fieldData,
          modifications: mods
        };
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

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
