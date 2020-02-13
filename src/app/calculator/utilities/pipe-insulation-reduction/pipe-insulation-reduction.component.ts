import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';
import { PipeInsulationReductionInput, PipeInsulationReductionResults } from '../../../shared/models/standalone';
import { FormGroup } from '@angular/forms';

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
  baselineSelected: boolean = true;
  modificationExists: boolean = false;

  pipeInsulationReductionResults: PipeInsulationReductionResults;

  baselineForm: FormGroup;
  modificationForm: FormGroup;

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
    if (this.inTreasureHunt) {
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
    if (this.pipeInsulationReductionService.baselineData == undefined) {
      this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
    }
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, true);
    if (this.pipeInsulationReductionService.modificationData) {
      this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, false);
    }
    
  }

  createModification() {
    this.pipeInsulationReductionService.modificationData = JSON.parse(JSON.stringify(this.pipeInsulationReductionService.baselineData));
    this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, false);
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  getResults() {
    this.pipeInsulationReductionResults = this.pipeInsulationReductionService.getResults(this.settings, this.pipeInsulationReductionService.baselineData, this.pipeInsulationReductionService.modificationData);
  }

  setBaselineSelected() {
    this.baselineSelected = true;
    this.baselineForm.enable();
    if (this.baselineForm.controls.insulationMaterialSelection.value == 0) {
      this.baselineForm.controls.pipeJacketMaterialSelection.disable();
    }
    if (this.modificationForm) {
      this.modificationForm.disable();
    }
  }

  setModificationSelected() {
    this.baselineSelected = false;
    this.baselineForm.disable();
    if (this.modificationExists) {
      this.modificationForm.enable();
      this.modificationForm.controls.utilityType.disable();
      this.modificationForm.controls.utilityCost.disable();
      if (this.modificationForm.controls.insulationMaterialSelection.value == 0) {
        this.modificationForm.controls.pipeJacketMaterialSelection.disable();
      }
    }
  }

  btnResetData() {
    this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, true);
    this.baselineForm.updateValueAndValidity();
    this.pipeInsulationReductionService.modificationData = null;
    this.baselineSelected = true;
    this.modificationExists = false;
    this.modificationForm = undefined;
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
    this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.generateExample(this.settings, true);
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, true);
    this.pipeInsulationReductionService.modificationData = this.pipeInsulationReductionService.generateExample(this.settings, false);
    this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, false);
    this.modificationExists = true;
    this.setBaselineSelected();
  }
}
