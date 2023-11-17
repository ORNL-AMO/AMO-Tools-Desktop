import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';
import { PipeInsulationReductionResults } from '../../../shared/models/standalone';
import { UntypedFormGroup } from '@angular/forms';
import { PipeInsulationReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-pipe-insulation-reduction',
  templateUrl: './pipe-insulation-reduction.component.html',
  styleUrls: ['./pipe-insulation-reduction.component.css']
})
export class PipeInsulationReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<PipeInsulationReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

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

  baselineForm: UntypedFormGroup;
  modificationForm: UntypedFormGroup;
  smallScreenTab: string = 'baseline';


  constructor(private settingsDbService: SettingsDbService, 
    private pipeInsulationReductionService: PipeInsulationReductionService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-STEAM-pipe-insulation-reduction');
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

  initData() {
    if (this.pipeInsulationReductionService.baselineData == undefined) {
      this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
    }
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, this.settings, true);
    if (this.pipeInsulationReductionService.modificationData) {
      this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, this.settings, false);
      this.modificationExists = true;
      this.modificationForm.disable();
    }
    
  }

  createModification() {
    this.pipeInsulationReductionService.modificationData = JSON.parse(JSON.stringify(this.pipeInsulationReductionService.baselineData));
    this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, this.settings, false);
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
      this.modificationForm.controls.heatedOrChilled.disable();
      if (this.modificationForm.controls.insulationMaterialSelection.value == 0) {
        this.modificationForm.controls.pipeJacketMaterialSelection.disable();
      }
    }
  }

  btnResetData() {
    this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.initObject(this.settings, this.operatingHours);
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, this.settings, true);
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
    this.baselineForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.baselineData, this.settings, true);
    this.pipeInsulationReductionService.modificationData = this.pipeInsulationReductionService.generateExample(this.settings, false);
    this.modificationForm = this.pipeInsulationReductionService.getFormFromObj(this.pipeInsulationReductionService.modificationData, this.settings, false);
    this.modificationExists = true;
    this.setBaselineSelected();
  }

  save() {
    this.emitSave.emit({ baseline: this.pipeInsulationReductionService.baselineData, modification: this.pipeInsulationReductionService.modificationData, opportunityType: Treasure.pipeInsulation });
  }

  cancel() {
    this.emitCancel.emit(true);
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
