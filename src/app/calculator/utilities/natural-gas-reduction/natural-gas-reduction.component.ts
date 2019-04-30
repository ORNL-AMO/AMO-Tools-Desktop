import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { NaturalGasReductionService } from './natural-gas-reduction.service';
import { NaturalGasReductionResults, NaturalGasReductionData } from '../../../shared/models/standalone';

@Component({
  selector: 'app-natural-gas-reduction',
  templateUrl: './natural-gas-reduction.component.html',
  styleUrls: ['./natural-gas-reduction.component.css']
})
export class NaturalGasReductionComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';

  baselineForms: Array<FormGroup>;
  modificationForms: Array<FormGroup>;
  modificationExists = false;

  baselineResults: NaturalGasReductionResults;
  modificationResults: NaturalGasReductionResults;

  constructor(private settingsDbService: SettingsDbService, private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    if (this.naturalGasReductionService.baselineData === undefined || this.naturalGasReductionService.baselineData === null || this.naturalGasReductionService.baselineData.length < 1) {
      this.addBaselineEquipment();
    }
    else {
      this.loadForms();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestory() {
    let baselineData: Array<NaturalGasReductionData> = new Array<NaturalGasReductionData>();
    for (let i = 0; i < this.baselineForms.length; i++) {
      baselineData.push(this.naturalGasReductionService.getObjFromForm(this.baselineForms[i]));
    }
    this.naturalGasReductionService.baselineData = baselineData;
    if (this.modificationExists) {
      let modificationData: Array<NaturalGasReductionData> = new Array<NaturalGasReductionData>();
      for (let i = 0; i < this.modificationForms.length; i++) {
        modificationData.push(this.naturalGasReductionService.getObjFromForm(this.modificationForms[i]));
      }
      this.naturalGasReductionService.modificationData = modificationData;
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
    this.naturalGasReductionService.addBaselineEquipment(this.baselineForms.length, this.settings);
    this.baselineForms.push(this.naturalGasReductionService.getFormFromObj(this.naturalGasReductionService.baselineData[this.naturalGasReductionService.baselineData.length - 1]));
  }

  removeBaselineEquipment(i: number) {
    this.naturalGasReductionService.removeBaselineEquipment(i);
    this.baselineForms.splice(i, 1);
    this.refreshResults();
  }

  createModification() {
    this.naturalGasReductionService.createModification();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.baselineForms.length; i++) {
      let tmpObj: NaturalGasReductionData = this.naturalGasReductionService.getObjFromForm(this.baselineForms[i]);
      let modForm: FormGroup = this.naturalGasReductionService.getFormFromObj(tmpObj);
      this.modificationForms.push(modForm);
    }
    this.modificationExists = true;
  }

  addModificationEquipment() {
    this.naturalGasReductionService.addModificationEquipment(this.modificationForms.length, this.settings);
    this.modificationForms.push(this.naturalGasReductionService.getFormFromObj(this.naturalGasReductionService.modificationData[this.naturalGasReductionService.modificationData.length - 1]));
  }

  removeModificationEquipment(i: number) {
    this.naturalGasReductionService.removeModificationEquipment(i);
    this.modificationForms.splice(i, 1);
    if (this.modificationForms.length < 1) {
      this.modificationExists = false;
    }
    this.refreshResults();
  }

  removeEquipment(emitObj: { index: number, isBaseline: boolean }) {
    emitObj.isBaseline ? this.removeBaselineEquipment(emitObj.index) : this.removeModificationEquipment(emitObj.index);
  }

  loadForms() {
    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.naturalGasReductionService.baselineData.length; i++) {
      this.baselineForms.push(this.naturalGasReductionService.getFormFromObj(this.naturalGasReductionService.baselineData[i]));
    }
    this.naturalGasReductionService.initModificationData();
    for (let i = 0; i < this.naturalGasReductionService.modificationData.length; i++) {
      this.modificationForms.push(this.naturalGasReductionService.getFormFromObj(this.naturalGasReductionService.modificationData[i]));
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
      this.naturalGasReductionService.updateBaselineDataArray(this.baselineForms);
      this.baselineResults = this.naturalGasReductionService.calculate(true, this.settings);
    } else {
      this.modificationForms[emitObj.index] = emitObj.form;
      this.naturalGasReductionService.updateModificationDataArray(this.modificationForms);
      this.modificationResults = this.naturalGasReductionService.calculate(false, this.settings);
    }
  }

  refreshResults() {
    this.naturalGasReductionService.updateBaselineDataArray(this.baselineForms);
    this.baselineResults = this.naturalGasReductionService.calculate(true, this.settings);
    if (this.modificationExists) {
      this.naturalGasReductionService.updateModificationDataArray(this.modificationForms);
      this.modificationResults = this.naturalGasReductionService.calculate(false, this.settings);
    }
  }

  btnResetData() {
    this.naturalGasReductionService.resetData(this.settings);
    this.modificationExists = false;
    this.loadForms();
  }

}
