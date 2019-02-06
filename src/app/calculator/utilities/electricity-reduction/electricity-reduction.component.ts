import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ElectricityReductionService } from './electricity-reduction.service';

@Component({
  selector: 'app-electricity-reduction',
  templateUrl: './electricity-reduction.component.html',
  styleUrls: ['./electricity-reduction.component.css']
})
export class ElectricityReductionComponent implements OnInit {
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
  baselineData: Array<any>;
  modificationData: Array<any>;

  constructor(private settingsDbService: SettingsDbService, private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

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
  }

  removeBaselineEquipment(i: number) {
    console.log('removeBaselineEquipment(' + i + ')');
  }

  addModificationEquipment() {
    console.log('addModificationEquipment()');
  }

  removeModificationEquipment(i: number) {
    console.log('removeModificationEquipment(' + i + ')');
  }

}
