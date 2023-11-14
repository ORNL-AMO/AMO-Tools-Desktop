import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ReplaceExistingService } from './replace-existing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
import { UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../../../shared/models/operations';
import { ReplaceExistingMotorTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
  selector: 'app-replace-existing',
  templateUrl: './replace-existing.component.html',
  styleUrls: ['./replace-existing.component.css']
})
export class ReplaceExistingComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<ReplaceExistingMotorTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  opperatingHours: OperatingHours;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }
  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  results: ReplaceExistingResults;
  inputs: ReplaceExistingData;

  replaceExistingForm: UntypedFormGroup;

  constructor(private replaceExistingService: ReplaceExistingService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-replace-existing');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if (this.replaceExistingService.replaceExistingData) {
      this.inputs = this.replaceExistingService.replaceExistingData;
    } else {
      this.initMotorInputs();
    }
    this.initForm();
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.replaceExistingService.replaceExistingData = this.inputs;
    } else {
      this.replaceExistingService.replaceExistingData = undefined;
    }
  }

  initMotorInputs() {
    let oppHours: number = 8760;
    if (this.opperatingHours) {
      oppHours = this.opperatingHours.hoursPerYear;
    }
    this.inputs = this.replaceExistingService.initReplaceExistingData(this.settings, oppHours);
  }
  resetMotorInputs() {
    let oppHours: number = 0;
    if (this.opperatingHours) {
      oppHours = this.opperatingHours.hoursPerYear;
    }
    this.inputs = this.replaceExistingService.resetReplaceExistingData(this.settings, oppHours);
  }

  initForm() {
    this.replaceExistingForm = this.replaceExistingService.getFormFromObj(this.inputs);
  }

  resetData() {
    this.resetMotorInputs();
    this.initForm();
    this.calculate();
  }
  btnGenerateExample() {
    this.initMotorInputs();
    this.initForm();
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.offsetHeight;
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
    this.inputs = this.replaceExistingService.getObjFromForm(this.replaceExistingForm);
    this.results = this.replaceExistingService.getResults(this.inputs, this.settings);
  }

  save() {
    this.emitSave.emit({ replaceExistingData: this.inputs, opportunityType: Treasure.replaceExisting });
  }

  cancel() {
    this.emitCancel.emit(true);
  }
  
  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}


