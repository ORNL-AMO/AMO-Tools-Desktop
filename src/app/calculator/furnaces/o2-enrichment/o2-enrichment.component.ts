import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../shared/models/phast/o2Enrichment';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-o2-enrichment',
  templateUrl: './o2-enrichment.component.html',
  styleUrls: ['./o2-enrichment.component.css']
})
export class O2EnrichmentComponent implements OnInit {
  @Input()
  settings: Settings


  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  o2Enrichment: O2Enrichment = {
    o2CombAir: 21,
    o2CombAirEnriched: 100,
    flueGasTemp: 1800,
    flueGasTempEnriched: 1800,
    o2FlueGas: 5,
    o2FlueGasEnriched: 1,
    combAirTemp: 900,
    combAirTempEnriched: 80,
    fuelConsumption: 10
  };

  o2EnrichmentOutput: O2EnrichmentOutput = {
    availableHeatEnriched: 0.0,
    availableHeatInput: 0.0,
    fuelConsumptionEnriched: 0.0,
    fuelSavingsEnriched: 0.0
  };

  lines = [];
  tabSelect: string = 'results';
  currentField: string = 'default';
  constructor(private phastService: PhastService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
      this.initDefaultValues(this.settings);
      this.calculate();
    } else {
      this.initDefaultValues(this.settings);
      this.calculate()
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
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

  initDefaultValues(settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      this.o2Enrichment = {
        o2CombAir: 21,
        o2CombAirEnriched: 100,
        flueGasTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to('C'), 2),
        flueGasTempEnriched: this.convertUnitsService.roundVal(this.convertUnitsService.value(1800).from('F').to('C'), 2),
        o2FlueGas: 5,
        o2FlueGasEnriched: 1,
        combAirTemp: this.convertUnitsService.roundVal(this.convertUnitsService.value(900).from('F').to('C'), 2),
        combAirTempEnriched: this.convertUnitsService.roundVal(this.convertUnitsService.value(80).from('F').to('C'), 2),
        fuelConsumption: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2)
      };
    }
    else {
      this.o2Enrichment = {
        o2CombAir: 21,
        o2CombAirEnriched: 100,
        flueGasTemp: 1800,
        flueGasTempEnriched: 1800,
        o2FlueGas: 5,
        o2FlueGasEnriched: 1,
        combAirTemp: 900,
        combAirTempEnriched: 80,
        fuelConsumption: 10
      };
    }
  }


  calculate() {
    this.o2EnrichmentOutput = this.phastService.o2Enrichment(this.o2Enrichment, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
