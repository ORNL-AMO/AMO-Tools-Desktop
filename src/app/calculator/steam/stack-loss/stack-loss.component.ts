import { Component, OnInit, ViewChild, Input, ElementRef, HostListener } from '@angular/core';
import { PhastService } from '../../../phast/phast.service';
import { FlueGasLossesService } from '../../../phast/losses/flue-gas-losses/flue-gas-losses.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '../../../../../node_modules/@angular/forms';
import { FlueGasByVolume, FlueGasByMass } from '../../../shared/models/phast/losses/flueGas';

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
  constructor(private settingsDbService: SettingsDbService, private flueGasLossesService: FlueGasLossesService, private phastService: PhastService) { }

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
      this.stackLossForm = this.flueGasLossesService.initFormVolume(1);
    } else if (this.method == 'mass') {
      this.stackLossForm = this.flueGasLossesService.initFormMass(1);
      this.stackLossForm.patchValue({
        moistureInAirComposition: .0077
      })
    }
  }

  calculate(form: FormGroup) {
    if (this.method == "volume" && form.status == 'VALID') {
      this.flueGasByVolume = this.flueGasLossesService.buildByVolumeLossFromForm(form).flueGasByVolume;
      const availableHeat = this.phastService.flueGasByVolume(this.flueGasByVolume, this.settings);
      this.stackLossPercent = (1-availableHeat)*100;
    } else if (this.method == "mass" && form.status == 'VALID') {
      this.flueGasByMass = this.flueGasLossesService.buildByMassLossFromForm(form).flueGasByMass;
      const availableHeat = this.phastService.flueGasByMass(this.flueGasByMass, this.settings);
      this.stackLossPercent = (1-availableHeat)*100;
    }else{
      this.stackLossPercent = 0;
    }
  }
}
