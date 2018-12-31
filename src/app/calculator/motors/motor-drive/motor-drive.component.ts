import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { MotorDriveService } from './motor-drive.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-motor-drive',
  templateUrl: './motor-drive.component.html',
  styleUrls: ['./motor-drive.component.css']
})
export class MotorDriveComponent implements OnInit {


  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  motorDriveData: MotorDriveInputs = {
    motorPower: 5,
    annualOperatingHours: 8760,
    averageMotorLoad: 50,
    electricityCost: 0
  }
  settings: Settings;
  outputData: MotorDriveOutputs;
  tabSelect: string = 'results';
  currentField: string;
  headerHeight: number;
  constructor(private motorDriveService: MotorDriveService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.globalSettings;
    this.motorDriveData.electricityCost = this.settings.electricityCost;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if(this.motorDriveService.motorDriveData){
      this.motorDriveData = this.motorDriveService.motorDriveData;
    }
    this.calculate(this.motorDriveData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.motorDriveData = {
      motorPower: 5,
      annualOperatingHours: 8760,
      averageMotorLoad: 50,
      electricityCost: this.settings.electricityCost
    }
    this.calculate(this.motorDriveData);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate(data: MotorDriveInputs) {
    this.motorDriveData = data;
    this.motorDriveService.motorDriveData = this.motorDriveData;
    this.outputData = this.motorDriveService.getResults(data);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }
}


export interface MotorDriveInputs {
  motorPower: number,
  annualOperatingHours: number,
  averageMotorLoad: number,
  electricityCost: number
}


export interface MotorDriveOutputs {
  vBeltResults: DriveResult
  notchedResults: DriveResult
  synchronousBeltDrive: DriveResult
}

export interface DriveResult {
  annualEnergyUse: number,
  energyCost: number
}