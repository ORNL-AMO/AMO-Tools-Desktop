import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SsmtService } from '../../../ssmt.service';

@Component({
  selector: 'app-operations-form',
  templateUrl: './operations-form.component.html',
  styleUrls: ['./operations-form.component.css']
})
export class OperationsFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  showHoursPerYear: boolean = false;
  showOperationsData: boolean = false;
  showMakeupWaterTemp: boolean = false;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }
  }

  init() {
    this.initOperatingHours();
    this.initMakeupWaterTemp();
    this.initGeneralOperations();
  }

  initOperatingHours() {
    if (this.ssmt.operatingHours.hoursPerYear != this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.hoursPerYear) {
      this.showHoursPerYear = true;
    } else {
      this.showHoursPerYear = false;
    }
  }

  initMakeupWaterTemp() {
    if (this.ssmt.generalSteamOperations.makeUpWaterTemperature != this.ssmt.modifications[this.exploreModIndex].ssmt.generalSteamOperations.makeUpWaterTemperature) {
      this.showMakeupWaterTemp = true;
    } else {
      this.showMakeupWaterTemp = false;
    }
  }

  initGeneralOperations() {
    if (this.showHoursPerYear || this.showMakeupWaterTemp) {
      this.showOperationsData = true;
    } else {
      this.showOperationsData = false;
    }
  }

  toggleOperationsData() {
    if(this.showOperationsData == false){
      this.showMakeupWaterTemp = false;
      this.showHoursPerYear = false;
      this.toggleHoursPerYear();
      this.toggleMakeupWaterTemp();
    }
  }

  toggleHoursPerYear() {
    if (this.showHoursPerYear == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.hoursPerYear = this.ssmt.operatingHours.hoursPerYear;
      this.save();
    }
  }

  toggleMakeupWaterTemp() {
    if (this.showMakeupWaterTemp == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.generalSteamOperations.makeUpWaterTemperature = this.ssmt.generalSteamOperations.makeUpWaterTemperature;
      this.save();
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  setBaselineOperatingHours() {
    this.ssmt.operatingHours.isCalculated = false;
    this.save()
  }

  setModificationOperatingHours() {
    this.ssmt.modifications[this.exploreModIndex].ssmt.operatingHours.isCalculated = false;
    this.save();
  }


  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
