import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Co2SavingsService, Co2SavingsData, Co2SavingsResults } from './co2-savings.service';

@Component({
  selector: 'app-co2-savings',
  templateUrl: './co2-savings.component.html',
  styleUrls: ['./co2-savings.component.css']
})
export class Co2SavingsComponent implements OnInit {
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
  baselineData: Array<Co2SavingsData> = [{
    energyType: 'fuel',
    totalEmissionOutputRate: 0,
    electricityUse: 0,
    energySource: undefined,
    fuelType: undefined,
    eGridRegion: undefined,
    eGridSubregion: undefined
  }];
  baselineElectricityUse: number;
  modificationData: Array<Co2SavingsData> = [];
  modificationElectricityUse: number;
  baselineResults: Co2SavingsResults;
  modificationResults: Co2SavingsResults;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;
  containerHeight: number;
  constructor(private settingsDbService: SettingsDbService, private co2SavingsService: Co2SavingsService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if(this.co2SavingsService.baselineData){
      this.baselineData = this.co2SavingsService.baselineData;
    }
    if(this.co2SavingsService.modificationData){
      this.modificationData = this.co2SavingsService.modificationData;
      this.modificationExists = true;
    }
    this.calculate();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.co2SavingsService.baselineData = this.baselineData;
    this.co2SavingsService.modificationData = this.modificationData;
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
    // this.baselineData.forEach(data => {
    //   data = this.co2SavingsService.calculate(data);
    // })
    this.baselineResults = this.co2SavingsService.getTotals(this.baselineData);
    // this.modificationData.forEach(data => {
    //   data = this.co2SavingsService.calculate(data);
    // })
    this.modificationResults = this.co2SavingsService.getTotals(this.modificationData);
  }

  addBaselineFixture(){
    this.baselineData.push(JSON.parse(JSON.stringify(this.baselineData[0])));
    this.calculate();
  }

  removeBaselineFixture(index: number){
    this.baselineData.splice(index, 1);
    this.calculate();

  }

  addModification(){
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationExists = true;
    this.togglePanel(this.modifiedSelected);
  }


  addModificationFixture(){
    this.modificationData.push(JSON.parse(JSON.stringify(this.modificationData[0])));
    this.calculate();
  }

  removeModificationFixture(index: number){
    this.modificationData.splice(index, 1);
    this.calculate();
  }

  focusField(str: string){
    this.currentField = str;
  }
}
