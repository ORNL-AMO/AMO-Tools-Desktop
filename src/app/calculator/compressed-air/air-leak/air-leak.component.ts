import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, HostListener, EventEmitter, Output } from '@angular/core';
import { AirLeakService } from './air-leak.service';
import { AirLeakSurveyInput, AirLeakSurveyOutput } from '../../../shared/models/standalone';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-air-leak',
  templateUrl: './air-leak.component.html',
  styleUrls: ['./air-leak.component.css']
})
export class AirLeakComponent implements OnInit, AfterViewInit {

  @Input()
  inTreasureHunt: boolean;
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;
  
  currentField: string;
  tabSelect: string = 'results';
  headerHeight: number;
  editMode: boolean = false;
  modificationExists: boolean;
  
  inputs: AirLeakSurveyInput;
  outputs: AirLeakSurveyOutput;

  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  constructor(private airLeakService: AirLeakService, 
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.initData();
    this.calculateAirLeak();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  initData() {
    this.outputs = this.airLeakService.getDefaultEmptyOutputs();
    this.inputs = this.airLeakService.inputs;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  
  calculateAirLeak() {
  this.outputs = this.airLeakService.calculate(this.inputs, this.settings);
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
