import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ElectricityReductionService, ElectricityReductionData, ElectricityReductionResults } from './electricity-reduction.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-electricity-reduction',
  templateUrl: './electricity-reduction.component.html',
  styleUrls: ['./electricity-reduction.component.css']
})
export class ElectricityReductionComponent implements OnInit {
  @Input()
  settings: Settings;
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

  baselineForms: Array<FormGroup>;
  modificationForms: Array<FormGroup>;
  modificationExists = false;

  baselineResults: ElectricityReductionResults;
  modificationResults: ElectricityReductionResults;

  constructor(private settingsDbService: SettingsDbService, private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    if (this.electricityReductionService.baselineData === undefined || this.electricityReductionService.baselineData === null || this.electricityReductionService.baselineData.length < 1) {
      this.addBaselineEquipment();
    }
    else {
      this.loadForms();
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

  addBaselineEquipment() {
    this.electricityReductionService.addBaselineEquipment(this.settings);
    this.baselineForms.push(this.electricityReductionService.getFormFromObj(this.electricityReductionService.baselineData[this.electricityReductionService.baselineData.length - 1]));
  }

  removeBaselineEquipment(i: number) {
    this.electricityReductionService.removeBaselineEquipment(i);
    this.baselineForms.splice(i, 1);
    this.refreshResults();
  }

  createModification() {
    this.electricityReductionService.createModification();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.baselineForms.length; i++) {
      let tmpObj: ElectricityReductionData = this.electricityReductionService.getObjFromForm(this.baselineForms[i]);
      let modForm: FormGroup = this.electricityReductionService.getFormFromObj(tmpObj);
      this.modificationForms.push(modForm);
    }
    this.modificationExists = true;
  }

  addModificationEquipment() {
    this.electricityReductionService.addModificationEquipment(this.settings);
    this.modificationForms.push(this.electricityReductionService.getFormFromObj(this.electricityReductionService.modificationData[this.electricityReductionService.modificationData.length - 1]));
  }

  removeModificationEquipment(i: number) {
    this.electricityReductionService.removeModificationEquipment(i);
    this.modificationForms.splice(i, 1);
    if (this.modificationForms.length < 1) {
      this.modificationExists = false;
    }
    this.refreshResults();
  }

  loadForms() {
    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.electricityReductionService.baselineData.length; i++) {
      this.baselineForms.push(this.electricityReductionService.getFormFromObj(this.electricityReductionService.baselineData[i]));
    }
    this.electricityReductionService.initModificationData();
    for (let i = 0; i < this.electricityReductionService.modificationData.length; i++) {
      this.modificationForms.push(this.electricityReductionService.getFormFromObj(this.electricityReductionService.modificationData[i]));
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
      this.electricityReductionService.updateBaselineDataArray(this.baselineForms);
      this.baselineResults = this.electricityReductionService.calculate(true, this.settings);
    } else {
      this.modificationForms[emitObj.index] = emitObj.form;
      this.electricityReductionService.updateModificationDataArray(this.modificationForms);
      this.modificationResults = this.electricityReductionService.calculate(false, this.settings);
    }
  }

  refreshResults() {
    this.electricityReductionService.updateBaselineDataArray(this.baselineForms);
    this.baselineResults = this.electricityReductionService.calculate(true, this.settings);
    if (this.modificationExists) {
      this.electricityReductionService.updateModificationDataArray(this.modificationForms);
      this.modificationResults = this.electricityReductionService.calculate(false, this.settings);
    }
  }

  btnResetData() {
    this.electricityReductionService.resetData(this.settings);
    this.loadForms();
  }
}
