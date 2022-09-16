import { Component, OnInit, ViewChild, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Co2SavingsService, Co2SavingsData } from './co2-savings.service';
import * as _ from 'lodash';
import { EGridService } from '../../../shared/helper-services/e-grid.service';

@Component({
  selector: 'app-co2-savings',
  templateUrl: './co2-savings.component.html',
  styleUrls: ['./co2-savings.component.css']
})
export class Co2SavingsComponent implements OnInit {
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  headerHeight: number;
  currentField: string = 'default';
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

  smallScreenTab: string = 'baseline';

  constructor(private settingsDbService: SettingsDbService, 
    private egridService: EGridService,
    private co2SavingsService: Co2SavingsService) { }

  ngOnInit() {
      this.egridService.getAllSubRegions();
    this.settings = this.settingsDbService.globalSettings;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.co2SavingsService.baselineData) {
      this.baselineData = this.co2SavingsService.baselineData;
    }
    if (this.co2SavingsService.modificationData && this.co2SavingsService.modificationData.length !== 0) {
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

  btnResetData() {
    this.baselineData = [{
      energyType: 'fuel',
      totalEmissionOutputRate: undefined,
      electricityUse: undefined,
      energySource: undefined,
      fuelType: undefined,
      eGridRegion: undefined,
      eGridSubregion: undefined,
      totalEmissionOutput: undefined
    }];
    this.modificationData = new Array<Co2SavingsData>();
    this.baselineSelected = true;
    this.modifiedSelected = false;
    this.modificationExists = false;
    this.co2SavingsService.baselineData = this.baselineData;
    this.co2SavingsService.modificationData = this.modificationData;
    this.calculate();
  }

  generateExample() {
    let tmpBaselineObj: Co2SavingsData = this.co2SavingsService.generateExample(true, this.settings);
    this.baselineData = [tmpBaselineObj];
    this.co2SavingsService.baselineData = this.baselineData;
    let tmpModificationObj: Co2SavingsData = this.co2SavingsService.generateExample(false, this.settings);
    this.modificationData = [tmpModificationObj];
    this.co2SavingsService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
  }

  btnGenerateExample() {
    this.generateExample();
    this.calculate();
  }

  togglePanel(bool: boolean) {
    if (bool === this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool === this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
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
      data = this.co2SavingsService.calculate(data, this.settings);
    });
    this.baselineTotal = _.sumBy(this.baselineData, 'totalEmissionOutput');
    if (this.modificationData) {
      this.modificationData.forEach(data => {
        data = this.co2SavingsService.calculate(data, this.settings);
      });
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

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (this.smallScreenTab === 'baseline') {
      this.setBaselineSelected();
    } else if (this.smallScreenTab === 'modification') {
      this.setModificationSelected();
    }
  }
}
