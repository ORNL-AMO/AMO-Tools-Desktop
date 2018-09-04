import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { EnergyUseService } from './energy-use.service';

@Component({
  selector: 'app-energy-use',
  templateUrl: './energy-use.component.html',
  styleUrls: ['./energy-use.component.css']
})
export class EnergyUseComponent implements OnInit {
  @Input()
  inPhast: boolean;
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  flowCalculations: FlowCalculations;

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };
  headerHeight: number;
  currentField: string = 'default';
  tabSelect: string = 'results';

  constructor(private phastService: PhastService, private energyUseService: EnergyUseService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }

    if(this.energyUseService.flowCalculations){
      this.flowCalculations = this.energyUseService.flowCalculations;
    }else{
      this.flowCalculations = this.energyUseService.initDefaultValues(this.settings);
    }
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.energyUseService.flowCalculations = this.flowCalculations;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
  }

}
