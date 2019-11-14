import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';
import { PipeInsulationReductionInput, PipeInsulationReductionResults } from '../../../shared/models/standalone';

@Component({
  selector: 'app-pipe-insulation-reduction',
  templateUrl: './pipe-insulation-reduction.component.html',
  styleUrls: ['./pipe-insulation-reduction.component.css']
})
export class PipeInsulationReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<null>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Output('emitAddOpportunitySheet')
  emitAddOpportunitySheet = new EventEmitter<boolean>();
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

  headerHeight: number;
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  updateForm: boolean = false;
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;
  modificationExists: boolean = false;

  pipeInsulationReductionResults: PipeInsulationReductionResults;
  baselineData: PipeInsulationReductionInput;
  modificationData: PipeInsulationReductionInput;

  constructor(private settingsDbService: SettingsDbService, private pipeInsulationReductionService: PipeInsulationReductionService) { }

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

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.pipeInsulationReductionService.baselineData = this.baselineData;
      this.pipeInsulationReductionService.modificationData = this.modificationData;
    } else {
      this.pipeInsulationReductionService.baselineData = undefined;
      this.pipeInsulationReductionService.modificationData = undefined;
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
    if (this.pipeInsulationReductionService.baselineData) {
      this.baselineData = this.pipeInsulationReductionService.baselineData;
    } else {
      let tmpObj: PipeInsulationReductionInput = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
      this.baselineData = tmpObj;
    }
    if (this.pipeInsulationReductionService.modificationData) {
      this.modificationData = this.pipeInsulationReductionService.modificationData;
    }
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  updateBaselineData(data: PipeInsulationReductionInput) {
    this.baselineData = data;
    this.getResults();
  }

  updateModificationData(data: PipeInsulationReductionInput) {
    this.modificationData = data;
    this.getResults();
  }

  getResults() {
    this.pipeInsulationReductionResults = this.pipeInsulationReductionService.getResults(this.settings, this.baselineData, this.modificationData);
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

  btnResetData() {
    this.baselineData = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
    this.pipeInsulationReductionService.baselineData = this.baselineData;
    this.modificationData = null;
    this.pipeInsulationReductionService.modificationData = this.modificationData;
    this.modificationExists = false;
    this.updateForm = !this.updateForm;
    this.getResults();
  }

  btnGenerateExample() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.generateExample();
    this.getResults();
  }

  generateExample() {
    this.baselineData = this.pipeInsulationReductionService.generateExample(this.settings, true);
    this.pipeInsulationReductionService.baselineData = this.baselineData;
    this.modificationData = this.pipeInsulationReductionService.generateExample(this.settings, false);
    this.pipeInsulationReductionService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
    this.updateForm = !this.updateForm;
  }
}
