import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { FanSystemChecklistInput, FanSystemChecklistOutput } from '../../../shared/models/fans';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { FanSystemChecklistService } from './fan-system-checklist.service';

@Component({
  selector: 'app-fan-system-checklist',
  templateUrl: './fan-system-checklist.component.html',
  styleUrls: ['./fan-system-checklist.component.css']
})
export class FanSystemChecklistComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
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
  
  fanSystemChecklistInputs: Array<FanSystemChecklistInput>;
  fanSystemChecklistOutput: FanSystemChecklistOutput;
  modificationData: Array<FanSystemChecklistInput>;
  fanSystemChecklistOutputSub: Subscription;
  fanSystemChecklistInputsSub: Subscription;
  modificationDataSub: Subscription;

  constructor(private settingsDbService: SettingsDbService, 
              private fanSystemChecklistService: FanSystemChecklistService) { }

    ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    let existingInputs = this.fanSystemChecklistService.fanSystemChecklistInputs.getValue();
    if(!existingInputs) {
      this.fanSystemChecklistService.initDefaultEmptyInputs(1);
    }
    this.initSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
      this.fanSystemChecklistInputsSub.unsubscribe();
      this.fanSystemChecklistOutputSub.unsubscribe();
  }

  initSubscriptions() {
    this.fanSystemChecklistInputsSub = this.fanSystemChecklistService.fanSystemChecklistInputs.subscribe(value => {
      this.fanSystemChecklistInputs = value;
      this.fanSystemChecklistService.calculate();
    });
    this.fanSystemChecklistOutputSub = this.fanSystemChecklistService.fanSystemChecklistOutput.subscribe(value => {
      this.fanSystemChecklistOutput = value;
    });
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  addEquipment() {
    this.fanSystemChecklistService.addEquipment(this.settings, this.operatingHours);
  }

  btnResetData() {
    this.fanSystemChecklistService.resetData.next(true);
    this.fanSystemChecklistService.initDefaultEmptyInputs(1);
  }

  btnGenerateExample() {
      this.fanSystemChecklistService.generateExampleData(this.settings);
  }

}
