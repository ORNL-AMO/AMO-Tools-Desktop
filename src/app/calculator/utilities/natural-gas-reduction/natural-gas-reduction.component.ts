import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { NaturalGasReductionService } from './natural-gas-reduction.service';
import { NaturalGasReductionResults, NaturalGasReductionData } from '../../../shared/models/standalone';
import { NaturalGasReductionTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-natural-gas-reduction',
  templateUrl: './natural-gas-reduction.component.html',
  styleUrls: ['./natural-gas-reduction.component.css']
})
export class NaturalGasReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<NaturalGasReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;


  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;

  modificationExists = false;

  naturalGasReductionResults: NaturalGasReductionResults;
  baselineData: Array<NaturalGasReductionData>;
  modificationData: Array<NaturalGasReductionData>;
  constructor(private settingsDbService: SettingsDbService, private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initData();
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestory() {
    if (!this.inTreasureHunt) {
      this.naturalGasReductionService.baselineData = this.baselineData;
      this.naturalGasReductionService.modificationData = this.modificationData;
    } else {
      this.naturalGasReductionService.baselineData = undefined;
      this.naturalGasReductionService.modificationData = undefined;
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

  initData() {
    if (this.naturalGasReductionService.baselineData) {
      this.baselineData = this.naturalGasReductionService.baselineData;
    } else {
      let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.initObject(0, this.settings, this.operatingHours);
      this.baselineData = [tmpObj];
    }
    if (this.naturalGasReductionService.modificationData) {
      this.modificationData = this.naturalGasReductionService.modificationData
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }


  addBaselineEquipment() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.initObject(this.baselineData.length, this.settings, this.operatingHours);
    this.baselineData.push(tmpObj);
    this.getResults();
  }

  removeBaselineEquipment(i: number) {
    this.baselineData.splice(i, 1);
    this.getResults();
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  addModificationEquipment() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.initObject(this.modificationData.length, this.settings, this.operatingHours);
    this.modificationData.push(tmpObj);
    this.getResults();
  }

  removeModificationEquipment(i: number) {
    this.modificationData.splice(i, 1);
    if (this.modificationData.length === 0) {
      this.modificationExists = false;
    }
    this.getResults();
  }

  updateBaselineData(data: NaturalGasReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: NaturalGasReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<NaturalGasReductionData>, data: NaturalGasReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].operatingHours = data.operatingHours;
    dataArray[index].fuelCost = data.fuelCost;
    dataArray[index].measurementMethod = data.measurementMethod;
    dataArray[index].flowMeterMethodData = data.flowMeterMethodData;
    dataArray[index].otherMethodData = data.otherMethodData;
    dataArray[index].airMassFlowData = data.airMassFlowData;
    dataArray[index].waterMassFlowData = data.waterMassFlowData;
    dataArray[index].units = data.units;
  }

  getResults() {
    this.naturalGasReductionResults = this.naturalGasReductionService.getResults(this.settings, this.baselineData, this.modificationData);
  }

  btnResetData() {
    let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.initObject(0, this.settings, this.operatingHours)
    this.baselineData = [tmpObj];
    this.modificationData = new Array<NaturalGasReductionData>();
    this.modificationExists = false;
    this.getResults();
  }

  generateExample() {
    let tmpBaselineObj: NaturalGasReductionData = this.naturalGasReductionService.generateExample(this.settings, true);
    this.baselineData = [tmpBaselineObj];
    this.naturalGasReductionService.baselineData = this.baselineData;
    let tmpModificationData: NaturalGasReductionData = this.naturalGasReductionService.generateExample(this.settings, false);
    this.modificationData = [tmpModificationData];
    this.naturalGasReductionService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.generateExample();
    this.getResults();
  }

  save() {
    this.emitSave.emit({ baseline: this.baselineData, modification: this.modificationData });
  }

  cancel() {
    this.emitCancel.emit(true);
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
}
