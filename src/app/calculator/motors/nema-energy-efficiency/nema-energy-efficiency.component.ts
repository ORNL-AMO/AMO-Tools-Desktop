import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { NemaEnergyEfficiencyService } from './nema-energy-efficiency.service';

@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  nemaForm: FormGroup;
  tabSelect: string = 'results';
  constructor(private settingsDbService: SettingsDbService, private nemaEnergyEfficiencyService: NemaEnergyEfficiencyService) { }

  ngOnInit() {
    this.initForm();
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settings.powerMeasurement != 'hp') {
      if (this.nemaForm.controls.horsePower.value == '200') {
        this.nemaForm.patchValue({
          horsePower: '150'
        })
      }
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngOnDestroy() {
    this.nemaEnergyEfficiencyService.nemaInputs = this.nemaEnergyEfficiencyService.getObjFromForm(this.nemaForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  initForm() {
    if (this.psat) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromPsat(this.psat);
    } else if (this.nemaEnergyEfficiencyService.nemaInputs) {
      this.nemaForm = this.nemaEnergyEfficiencyService.initFormFromObj(this.nemaEnergyEfficiencyService.nemaInputs);
    } else {
      this.nemaForm = this.nemaEnergyEfficiencyService.initForm();
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }
}
