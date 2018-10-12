import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Co2SavingsService, Co2SavingsData } from './co2-savings.service';
import * as _ from 'lodash';

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
    totalEmissionOutputRate: undefined,
    electricityUse: undefined,
    energySource: undefined,
    fuelType: undefined,
    eGridRegion: undefined,
    eGridSubregion: undefined,
    totalEmissionOutput: undefined
  }];
  baselineElectricityUse: number;
  modificationData: Array<Co2SavingsData> = [];
  modificationElectricityUse: number;
  baselineTotal: number;
  modificationTotal: number;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;
  containerHeight: number;
  constructor(private settingsDbService: SettingsDbService, private co2SavingsService: Co2SavingsService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.co2SavingsService.baselineData) {
      this.baselineData = this.co2SavingsService.baselineData;
      console.log(this.baselineData);
    }
    if (this.co2SavingsService.modificationData && this.co2SavingsService.modificationData.length != 0) {
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

  ngOnDestroy() {
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
    this.baselineData.forEach(data => {
      data = this.co2SavingsService.calculate(data);
    })
    this.baselineTotal = _.sumBy(this.baselineData, 'totalEmissionOutput');
    if (this.modificationData) {
      this.modificationData.forEach(data => {
        data = this.co2SavingsService.calculate(data);
      })
      this.modificationTotal = _.sumBy(this.modificationData, 'totalEmissionOutput');
    }
  }

  addBaselineFixture() {
    this.baselineData.push(
      {
        energyType: 'fuel',
        totalEmissionOutputRate: undefined,
        electricityUse: undefined,
        energySource: undefined,
        fuelType: undefined,
        eGridRegion: undefined,
        eGridSubregion: undefined,
        totalEmissionOutput: undefined
      }
    );
    this.calculate();
  }

  removeBaselineFixture(index: number) {
    this.baselineData.splice(index, 1);
    this.calculate();

  }

  addModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationExists = true;
    this.togglePanel(this.modifiedSelected);
  }


  addModificationFixture() {
    this.modificationData.push(
      {
        energyType: 'fuel',
        totalEmissionOutputRate: undefined,
        electricityUse: undefined,
        energySource: undefined,
        fuelType: undefined,
        eGridRegion: undefined,
        eGridSubregion: undefined,
        totalEmissionOutput: undefined
      }
    );
    this.calculate();
  }

  removeModificationFixture(index: number) {
    this.modificationData.splice(index, 1);
    this.calculate();
  }

  focusField(str: string) {
    this.currentField = str;
  }
}
