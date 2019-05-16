import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CompressedAirReductionService } from './compressed-air-reduction.service';
import { CompressedAirReductionData, CompressedAirReductionResults } from '../../../shared/models/standalone';

@Component({
  selector: 'app-compressed-air-reduction',
  templateUrl: './compressed-air-reduction.component.html',
  styleUrls: ['./compressed-air-reduction.component.css']
})
export class CompressedAirReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<any>();
  // emitSave = new EventEmitter<CompressedAirReductionTreasurehunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Output('emitAddOpportunitySheet')
  emitAddOpportunitySheet = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;

  baselineForms: Array<FormGroup>;
  modificationForms: Array<FormGroup>;
  modificationExists = false;

  compressedAirReductionResults: CompressedAirReductionResults;

  constructor(private settingsDbService: SettingsDbService, private compressedAirReductionService: CompressedAirReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    if (this.compressedAirReductionService.baselineData === undefined || this.compressedAirReductionService.baselineData === null || this.compressedAirReductionService.baselineData.length < 1) {
      this.addBaselineEquipment();
    }
    else {
      this.loadForms();
    }
    this.getResults();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
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

  addBaselineEquipment() {
    this.compressedAirReductionService.addBaselineEquipment(this.baselineForms.length, this.settings);
    this.baselineForms.push(this.compressedAirReductionService.getFormFromObj(this.compressedAirReductionService.baselineData[this.compressedAirReductionService.baselineData.length - 1]));
  }

  removeBaselineEquipment(i: number) {
    this.compressedAirReductionService.removeBaselineEquipment(i);
    this.baselineForms.splice(i, 1);
    this.getResults();
  }

  createModification() {
    this.compressedAirReductionService.createModification();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.baselineForms.length; i++) {
      let tmpObj: CompressedAirReductionData = this.compressedAirReductionService.getObjFromForm(this.baselineForms[i]);
      let modForm: FormGroup = this.compressedAirReductionService.getFormFromObj(tmpObj);
      this.modificationForms.push(modForm);
    }
    this.modificationExists = true;
  }

  addModificationEquipment() {
    this.compressedAirReductionService.addModificationEquipment(this.modificationForms.length, this.settings);
    this.modificationForms.push(this.compressedAirReductionService.getFormFromObj(this.compressedAirReductionService.modificationData[this.compressedAirReductionService.modificationData.length - 1]));
  }

  removeModificationEquipment(i: number) {
    this.compressedAirReductionService.removeModificationEquipment(i);
    this.modificationForms.splice(i, 1);
    if (this.modificationForms.length < 1) {
      this.modificationExists = false;
    }
    this.getResults();
  }

  removeEquipment(emitObj: { index: number, isBaseline: boolean }) {
    emitObj.isBaseline ? this.removeBaselineEquipment(emitObj.index) : this.removeModificationEquipment(emitObj.index);
  }

  loadForms() {
    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.compressedAirReductionService.baselineData.length; i++) {
      this.baselineForms.push(this.compressedAirReductionService.getFormFromObj(this.compressedAirReductionService.baselineData[i]));
    }
    this.compressedAirReductionService.initModificationData();
    for (let i = 0; i < this.compressedAirReductionService.modificationData.length; i++) {
      this.modificationForms.push(this.compressedAirReductionService.getFormFromObj(this.compressedAirReductionService.modificationData[i]));
    }
    if (!this.modificationExists) {
      if (this.modificationForms.length > 0) {
        this.modificationExists = true;
      }
    }
  }

  calculate(emitObj: { form: FormGroup, index: number, isBaseline: boolean }) {
    if (emitObj.isBaseline) {
      this.baselineForms[emitObj.index] = emitObj.form;
    } else {
      this.modificationForms[emitObj.index] = emitObj.form;
    }
    this.getResults();
  }

  getResults() {
    this.compressedAirReductionService.updateBaselineDataArray(this.baselineForms);
    if (this.modificationExists) {
      this.compressedAirReductionService.updateModificationDataArray(this.modificationForms);
    }
    this.compressedAirReductionResults = this.compressedAirReductionService.getResults(this.settings, this.compressedAirReductionService.baselineData, this.compressedAirReductionService.modificationData);
  }

  btnResetData() {
    this.compressedAirReductionService.resetData(this.settings);
    this.modificationExists = false;
    this.loadForms();
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    } else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  save() {
    this.emitSave.emit({ baseline: this.compressedAirReductionService.baselineData, modification: this.compressedAirReductionService.modificationData });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }
}
