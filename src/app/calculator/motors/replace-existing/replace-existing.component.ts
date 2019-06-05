import { Component, OnInit, ViewChild, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ReplaceExistingService } from './replace-existing.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-replace-existing',
  templateUrl: './replace-existing.component.html',
  styleUrls: ['./replace-existing.component.css']
})
export class ReplaceExistingComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<ReplaceExistingData>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Output('emitAddOpportunitySheet')
  emitAddOpportunitySheet = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  opperatingHours: number

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  containerHeight: number;
  headerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  results: ReplaceExistingResults;
  inputs: ReplaceExistingData;

  replaceExistingForm: FormGroup;

  constructor(private replaceExistingService: ReplaceExistingService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
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
    let oppHours: number = 5200;
    if (this.opperatingHours) {
      oppHours = this.opperatingHours;
    }
    this.inputs = this.replaceExistingService.initReplaceExistingData(this.settings, oppHours);
  }

  initForm() {
    this.replaceExistingForm = this.replaceExistingService.getFormFromObj(this.inputs);
  }

  resetData() {
    this.initMotorInputs();
    this.initForm();
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
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
    this.results = this.replaceExistingService.getResults(this.inputs);
  }

  save() {
    this.emitSave.emit(this.inputs);
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }
}


