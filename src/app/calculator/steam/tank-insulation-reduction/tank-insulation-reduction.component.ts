import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { TankInsulationReductionService } from './tank-insulation-reduction.service';
import { TankInsulationReductionResults } from '../../../shared/models/standalone';

@Component({
  selector: 'app-tank-insulation-reduction',
  templateUrl: './tank-insulation-reduction.component.html',
  styleUrls: ['./tank-insulation-reduction.component.css']
})
export class TankInsulationReductionComponent implements OnInit {
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
  baselineSelected: boolean = true;
  modificationExists: boolean = false;

  tankInsulationReductionResults: TankInsulationReductionResults;

  baselineForm: FormGroup;
  modificationForm: FormGroup;

  constructor(private settingsDbService: SettingsDbService, private tankInsulationReductionService: TankInsulationReductionService) { }

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
      this.tankInsulationReductionService.baselineData = undefined;
      this.tankInsulationReductionService.modificationData = undefined;
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
    if (this.tankInsulationReductionService.baselineData == undefined) {
      this.tankInsulationReductionService.baselineData = this.tankInsulationReductionService.initObject(this.settings, this.operatingHours);
    }
    this.baselineForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.baselineData, true);
    if (this.tankInsulationReductionService.modificationData) {
      this.modificationForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.modificationData, false);
    }
  }

  createModification() {
    this.tankInsulationReductionService.modificationData = JSON.parse(JSON.stringify(this.tankInsulationReductionService.baselineData));
    this.modificationForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.modificationData, false);
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  getResults() {
    this.tankInsulationReductionResults = this.tankInsulationReductionService.getResults(this.settings, this.tankInsulationReductionService.baselineData, this.tankInsulationReductionService.modificationData);
  }

  setBaselineSelected() {
    this.baselineSelected = true;
    this.baselineForm.enable();
    if (this.baselineForm.controls.insulationMaterialSelection.value == 0) {
      this.baselineForm.controls.jacketMaterialSelection.disable();
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
        this.modificationForm.controls.tankJacketMaterialSelection.disable();
      }
    }
  }

  btnResetData() {
    this.tankInsulationReductionService.baselineData = this.tankInsulationReductionService.initObject(this.settings, this.operatingHours);
    this.baselineForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.baselineData, true);
    this.baselineForm.updateValueAndValidity();
    this.tankInsulationReductionService.modificationData = null;
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
    this.tankInsulationReductionService.baselineData = this.tankInsulationReductionService.generateExample(this.settings, true);
    this.baselineForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.baselineData, true);
    this.tankInsulationReductionService.modificationData = this.tankInsulationReductionService.generateExample(this.settings, false);
    this.modificationForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.modificationData, false);
    this.modificationExists = true;
    this.setBaselineSelected();
  }
}
