import { Component, OnInit, ElementRef, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { LightingReplacementService } from './lighting-replacement.service';
import { LightingReplacementData, LightingReplacementResults, LightingReplacementResult } from '../../../shared/models/lighting';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-lighting-replacement',
  templateUrl: './lighting-replacement.component.html',
  styleUrls: ['./lighting-replacement.component.css']
})
export class LightingReplacementComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<LightingReplacementTreasureHunt>();
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
  currentField: string;
  tabSelect: string = 'results';

  baselineForms: Array<FormGroup>;
  modificationForms: Array<FormGroup>;

  lightingReplacementResults: LightingReplacementResults;
  modificationExists: boolean = false;
  containerHeight: number;

  baselineElectricityCost: number = 0;
  modificationElectricityCost: number = 0;
  constructor(private settingsDbService: SettingsDbService, private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    if (this.lightingReplacementService.baselineData === undefined || this.lightingReplacementService.baselineData === null) {
      this.addBaselineFixture();
    } else {
      this.loadForms();
    }

    if (this.lightingReplacementService.baselineElectricityCost) {
      this.baselineElectricityCost = this.lightingReplacementService.baselineElectricityCost;
    } else {
      this.baselineElectricityCost = this.settings.electricityCost;
    }
    if (this.lightingReplacementService.modificationElectricityCost) {
      this.modificationElectricityCost = this.lightingReplacementService.modificationElectricityCost;
    } else {
      this.modificationElectricityCost = this.settings.electricityCost;
    }

    this.updateElectricityCost(true);
    this.updateElectricityCost(false);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.lightingReplacementService.updateBaselineDataArray(this.baselineForms);
      this.lightingReplacementService.updateModificationDataArray(this.modificationForms);
      this.lightingReplacementService.baselineElectricityCost = this.baselineElectricityCost;
      this.lightingReplacementService.modificationElectricityCost = this.modificationElectricityCost;
    } else {
      this.lightingReplacementService.baselineData = undefined;
      this.lightingReplacementService.modificationData = undefined;
      this.lightingReplacementService.baselineElectricityCost = undefined;
      this.lightingReplacementService.modificationElectricityCost = undefined;
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

  addBaselineFixture() {
    this.lightingReplacementService.addBaselineFixture(this.baselineForms.length);
    this.baselineForms.push(this.lightingReplacementService.getFormFromObj(this.lightingReplacementService.baselineData[this.lightingReplacementService.baselineData.length - 1]));
  }

  removeBaselineFixture(index: number) {
    this.lightingReplacementService.removeBaselineFixture(index);
    this.baselineForms.splice(index, 1);
    this.refreshResults();
  }

  createModification() {
    this.lightingReplacementService.createModification();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.baselineForms.length; i++) {
      let tmpObj: LightingReplacementData = this.lightingReplacementService.getObjFromForm(this.baselineForms[i]);
      let modForm: FormGroup = this.lightingReplacementService.getFormFromObj(tmpObj);
      this.modificationForms.push(modForm);
    }
    this.modificationExists = true;
  }

  addModificationFixture() {
    this.lightingReplacementService.addModificationFixture(this.modificationForms.length);
    this.modificationForms.push(this.lightingReplacementService.getFormFromObj(this.lightingReplacementService.modificationData[this.lightingReplacementService.modificationData.length - 1]));
  }

  removeModificationFixture(index: number) {
    this.lightingReplacementService.removeModificationFixture(index);
    this.modificationForms.splice(index, 1);
    if (this.modificationForms.length < 1) {
      this.modificationExists = false;
    }
    this.refreshResults();
  }

  removeFixture(emitObj: { index: number, isBaseline: boolean }) {
    emitObj.isBaseline ? this.removeBaselineFixture(emitObj.index) : this.removeModificationFixture(emitObj.index);
  }

  loadForms() {
    this.baselineForms = new Array<FormGroup>();
    this.modificationForms = new Array<FormGroup>();
    for (let i = 0; i < this.lightingReplacementService.baselineData.length; i++) {
      this.baselineForms.push(this.lightingReplacementService.getFormFromObj(this.lightingReplacementService.baselineData[i]));
    }
    this.lightingReplacementService.initModificationData();
    for (let i = 0; i < this.lightingReplacementService.modificationData.length; i++) {
      this.modificationForms.push(this.lightingReplacementService.getFormFromObj(this.lightingReplacementService.modificationData[i]));
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
    this.refreshResults();
  }

  refreshResults() {
    this.lightingReplacementService.updateBaselineDataArray(this.baselineForms);
    if (this.modificationExists) {
      this.lightingReplacementService.updateModificationDataArray(this.modificationForms);
    }
    this.updateElectricityCost(true);
    this.updateElectricityCost(false);
    this.lightingReplacementResults = this.lightingReplacementService.calculateResults();
  }

  updateElectricityCost(isBaseline: boolean) {
    if (isBaseline) {
      this.lightingReplacementService.baselineElectricityCost = this.baselineElectricityCost;
    } else {
      this.lightingReplacementService.modificationElectricityCost = this.modificationElectricityCost;
    }
  }

  focusField(str: string) {
    this.currentField = str;
  }

  save() {
    this.emitSave.emit({ baseline: this.lightingReplacementService.baselineData, modifications: this.lightingReplacementService.modificationData, baselineElectricityCost: this.baselineElectricityCost, modificationElectricityCost: this.modificationElectricityCost });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  addOpportunitySheet() {
    this.emitAddOpportunitySheet.emit(true);
  }

  btnResetData() {
    this.lightingReplacementService.resetData(this.settings);
    this.modificationExists = false;
    this.loadForms();
  }
}
