import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { LightingReplacementService, LightingReplacementData, LightingReplacementResults } from './lighting-replacement.service';

@Component({
  selector: 'app-lighting-replacement',
  templateUrl: './lighting-replacement.component.html',
  styleUrls: ['./lighting-replacement.component.css']
})
export class LightingReplacementComponent implements OnInit {
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  settings: Settings;
  baselineData: Array<LightingReplacementData> = [{
    hoursPerDay: 0,
    daysPerMonth: 0,
    monthsPerYear: 0,
    hoursPerYear: 0,
    wattsPerLamp: 0,
    lampsPerFixture: 0,
    numberOfFixtures: 0,
    lumensPerLamp: 0,
    totalLighting: 0,
    electricityUse: 0
  }];
  baselineElectricityUse: number;
  modificationData: Array<LightingReplacementData> = [];
  modificationElectricityUse: number;
  baselineResults: LightingReplacementResults;
  modificationResults: LightingReplacementResults;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;
  containerHeight: number;
  constructor(private settingsDbService: SettingsDbService, private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    this.calculate();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  calculate() {
    this.baselineData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })
    this.baselineResults = this.lightingReplacementService.getTotals(this.baselineData);
    this.modificationData.forEach(data => {
      data = this.lightingReplacementService.calculate(data);
    })
    this.modificationResults = this.lightingReplacementService.getTotals(this.modificationData);
  }

  addBaselineFixture(){
    this.baselineData.push(this.baselineData[0]);
  }

  removeBaselineFixture(index: number){
    this.baselineData.splice(index, 1);
  }

  addModification(){
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationExists = true;
    this.togglePanel(this.modifiedSelected);
  }


  addModificationFixture(){
    this.modificationData.push(this.modificationData[0]);
  }

  removeModificationFixture(index: number){
    this.modificationData.splice(index, 1);
  }
}
