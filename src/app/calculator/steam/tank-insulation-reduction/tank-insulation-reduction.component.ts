import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { UntypedFormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { TankInsulationReductionService } from './tank-insulation-reduction.service';
import { TankInsulationReductionResults } from '../../../shared/models/standalone';
import { TankInsulationReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-tank-insulation-reduction',
  templateUrl: './tank-insulation-reduction.component.html',
  styleUrls: ['./tank-insulation-reduction.component.css']
})
export class TankInsulationReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<TankInsulationReductionTreasureHunt>();
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
  
  smallScreenTab: string = 'baseline';

  tankInsulationReductionResults: TankInsulationReductionResults;

  baselineForm: UntypedFormGroup;
  modificationForm: UntypedFormGroup;

  constructor(private settingsDbService: SettingsDbService, 
    private tankInsulationReductionService: TankInsulationReductionService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-steam-tank-insulation-reduction');
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
    if (this.tankInsulationReductionService.baselineData == undefined) {
      this.tankInsulationReductionService.baselineData = this.tankInsulationReductionService.initObject(this.settings, this.operatingHours);
    }
    this.baselineForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.baselineData, true);
    if (this.tankInsulationReductionService.modificationData) {
      this.modificationForm = this.tankInsulationReductionService.getFormFromObj(this.tankInsulationReductionService.modificationData, false);
      this.modificationExists = true;
      this.modificationForm.controls.energySourceType.disable();
      this.modificationForm.controls.heatedOrChilled.disable();
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
      this.modificationForm.controls.heatedOrChilled.disable();
      if (this.modificationForm.controls.insulationMaterialSelection.value == 0) {
        this.modificationForm.controls.jacketMaterialSelection.disable();
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

  save() {
    this.emitSave.emit({ baseline: this.tankInsulationReductionService.baselineData, modification: this.tankInsulationReductionService.modificationData, opportunityType: Treasure.tankInsulation });
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
