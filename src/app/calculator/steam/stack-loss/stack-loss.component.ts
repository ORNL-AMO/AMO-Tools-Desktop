import { Component, OnInit, ViewChild, Input, ElementRef, HostListener } from '@angular/core';
import { PhastService } from '../../../phast/phast.service';
import { FlueGasLossesService } from '../../../phast/losses/flue-gas-losses/flue-gas-losses.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { FlueGasByVolume, FlueGasByMass } from '../../../shared/models/phast/losses/flueGas';
import { StackLossService } from './stack-loss.service';

@Component({
  selector: 'app-stack-loss',
  templateUrl: './stack-loss.component.html',
  styleUrls: ['./stack-loss.component.css']
})
export class StackLossComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string = 'default';
  method: string = 'volume';
  tabSelect: string = 'results';
  stackLossForm: FormGroup;
  flueGasByVolume: FlueGasByVolume;
  flueGasByMass: FlueGasByMass;

  stackLossPercent: number = 0;
  constructor(private settingsDbService: SettingsDbService, private flueGasLossesService: FlueGasLossesService, private stackLossService: StackLossService, private phastService: PhastService) { }

  ngOnInit() {
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.getForm();
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

  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }

  getForm() {
    if (this.method == 'volume') {
      this.stackLossForm = this.stackLossService.initFormVolume();
    } else if (this.method == 'mass') {
      this.stackLossForm = this.stackLossService.initFormMass();
    }
  }

  calculate(form: FormGroup) {
    form.patchValue({
      fuelTemperature: this.stackLossForm.controls.combustionAirTemperature.value
    })
    console.log(form);
    if (this.method == "volume" && form.status == 'VALID') {
      this.flueGasByVolume = this.stackLossService.buildByVolumeLossFromForm(form);
      const availableHeat = this.phastService.flueGasByVolume(this.flueGasByVolume, this.settings);
      this.stackLossPercent = (1-availableHeat)*100;
    } else if (this.method == "mass" && form.status == 'VALID') {
      this.flueGasByMass = this.stackLossService.buildByMassLossFromForm(form);
      const availableHeat = this.phastService.flueGasByMass(this.flueGasByMass, this.settings);
      this.stackLossPercent = (1-availableHeat)*100;
    }else{
      this.stackLossPercent = 0;
    }
  }
}
