import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { MotorDriveService } from './motor-drive.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { MotorDriveInputs, MotorDriveOutputs } from '../../../shared/models/calculators';
import { UntypedFormGroup } from '@angular/forms';
import { MotorDriveInputsTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';

@Component({
    selector: 'app-motor-drive',
    templateUrl: './motor-drive.component.html',
    styleUrls: ['./motor-drive.component.css'],
    standalone: false
})
export class MotorDriveComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<MotorDriveInputsTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  opperatingHours: number

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  motorDriveData: MotorDriveInputs;
  motorDriveForm: UntypedFormGroup;
  outputData: MotorDriveOutputs;
  tabSelect: string = 'results';
  currentField: string;
  headerHeight: number;
  percentSavings: number;
  containerHeight: number;
  smallScreenTab: string = 'form';

  constructor(private motorDriveService: MotorDriveService, private settingsDbService: SettingsDbService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('calculator-MOTOR-drive');
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (this.motorDriveService.motorDriveData) {
      this.motorDriveData = this.motorDriveService.motorDriveData;
    } else {
      this.motorDriveData = this.motorDriveService.generateExample(this.settings);
    }
    this.motorDriveForm = this.motorDriveService.getFormFromObj(this.motorDriveData);
    this.calculate(this.motorDriveData);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.motorDriveService.motorDriveData = this.motorDriveData;
    } else {
      this.motorDriveService.motorDriveData = undefined;
    }
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

  calculate(data: MotorDriveInputs) {
    this.motorDriveData = data;
    this.motorDriveService.motorDriveData = this.motorDriveData;
    this.outputData = this.motorDriveService.getResults(data);
    this.percentSavings = ((this.outputData.baselineResult.energyCost - this.outputData.modificationResult.energyCost) / this.outputData.baselineResult.energyCost) * 100;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  save() {
    this.emitSave.emit({ motorDriveInputs: this.motorDriveData, opportunityType: Treasure.motorDrive });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  btnResetData() {
    this.motorDriveData = this.motorDriveService.getResetData(this.settings);
    this.motorDriveForm = this.motorDriveService.getFormFromObj(this.motorDriveData);
    this.calculate(this.motorDriveData);
  }

  btnGenerateExample() {
    this.motorDriveData = this.motorDriveService.generateExample(this.settings);
    this.motorDriveForm = this.motorDriveService.getFormFromObj(this.motorDriveData);
    this.calculate(this.motorDriveData);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}


