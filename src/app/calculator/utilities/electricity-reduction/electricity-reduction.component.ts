import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ElectricityReductionService, ElectricityReductionData } from './electricity-reduction.service';
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
  
  // baselineData: Array<ElectricityReductionData>;
  // modificationData: Array<ElectricityReductionData>;
  baselineForms: Array<FormGroup>;
  modificationForms: Array<FormGroup>;

  constructor(private settingsDbService: SettingsDbService, private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    // TO DO - init baseline forms and modification forms; need to check if any are already saved
    console.log('service.baselineData = ');
    console.log(this.electricityReductionService.baselineData);
    if (this.electricityReductionService.baselineData === undefined || this.electricityReductionService.baselineData === null) {
      this.addBaselineEquipment();
    }
    this.loadForms();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.currentField = str;
  }

  addBaselineEquipment() {
    console.log('addBaselineEquipment()');
    this.electricityReductionService.addBaselineEquipment(this.settings);
  }

  removeBaselineEquipment(i: number) {
    console.log('removeBaselineEquipment(' + i + ')');
  }

  addModificationEquipment() {
    console.log('addModificationEquipment()');
    this.electricityReductionService.addModificationEquipment(this.settings);
  }

  removeModificationEquipment(i: number) {
    console.log('removeModificationEquipment(' + i + ')');
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
    console.log('loaded baselineForms = ');
    console.log(this.baselineForms);
    console.log('loaded modificationForms = ');
    console.log(this.modificationForms);
  }

}
