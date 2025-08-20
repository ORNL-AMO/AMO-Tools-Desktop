import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PHAST, PhastResults, CalculatedByPhast, EnergyUseReportData } from '../../../shared/models/phast/phast';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergyService } from '../../metered-energy/metered-energy.service';
import { DesignedEnergyService } from '../../designed-energy/designed-energy.service';
import { PhastResultsService } from '../../phast-results.service';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SqlDbApiService } from '../../../tools-suite-api/sql-db-api.service';
@Component({
  selector: 'app-energy-used',
  templateUrl: './energy-used.component.html',
  styleUrls: ['./energy-used.component.css'],
  standalone: false
})
export class EnergyUsedComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

  energyUsed: EnergyUseReportData;
  designedResults: DesignedEnergyResults = {
    designed: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      hourlyElectricity: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    },
    byPhast: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    }
  };

  meteredResults: MeteredEnergyResults = {
    metered: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      hourlyElectricity: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    },
    byPhast: {
      hourlyEnergy: 0,
      annualEnergy: 0,
      annualElectricity: 0,
      energyIntensity: 0,
    }
  };

  calculatedResults: CalculatedByPhast = {
    fuelEnergyUsed: 0,
    energyIntensity: 0,
    electricityUsed: 0
  };
  fuelHeatingValue: number = 0;
  steamHeatingValue: number = 0;
  fuelName: string;
  electricEnergyUsed: number = 0;
  fuelEnergyUsed: number = 0;
  steamEnergyUsed: number = 0;

  energyPerMassUnit: string;
  energyPerTimeUnit: string;
  energyCostUnit: string;
  fuelUsedUnit: string;
  baseEnergyUnit: string;
  electricityHeatingValue: number;

  phastResults: PhastResults;

  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  copyTable1String: any;

  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;
  copyTable2String: any;

  constructor(private designedEnergyService: DesignedEnergyService,
    private meteredEnergyService: MeteredEnergyService,
    private phastResultsService: PhastResultsService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.phastResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.calculatedResults = this.phastResultsService.calculatedByPhast(this.phast, this.settings);
    this.electricityHeatingValue = this.convertUnitsService.value(9800).from('Btu').to(this.settings.energyResultUnit);
    this.getUnits();
    this.setEnergyUsed();

    this.setMeteredEnergyVals();
    if (this.phast.designedEnergy) {
      if (this.phast.designedEnergy) {
        this.designedResults = this.designedEnergyService.calculateDesignedEnergy(this.phast, this.settings);
      }
    }
  }

  async setEnergyUsed() {
    this.energyUsed = await this.phastResultsService.getEnergyUseReportData(this.phast, this.phastResults, this.settings);
    this.baseEnergyUnit = this.energyUsed.baseEnergyUnit;
    this.energyPerMassUnit = this.energyUsed.energyPerMassUnit;
  }

  getUnits() {
    if (this.settings.energyResultUnit !== 'kWh' && this.settings.energySourceType !== 'Electricity') {
      this.baseEnergyUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.baseEnergyUnit = this.settings.energyResultUnit;
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure === 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    }

    if (this.settings.energyResultUnit === 'MMBtu') {
      this.energyPerMassUnit = 'Btu/lb';
    } else if (this.settings.energyResultUnit === 'GJ') {
      this.energyPerMassUnit = 'kJ/kg';
    } else {
      if (this.settings.unitsOfMeasure === 'Metric') {
        this.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
      } else {
        this.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
      }
    }

  }

  setMeteredEnergyVals() {
    if (this.phast.meteredEnergy) {
      if (this.phast.meteredEnergy.meteredEnergyElectricity) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
      }
      if (this.phast.meteredEnergy.meteredEnergySteam) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
        this.steamHeatingValue = this.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
      }
      if (this.phast.meteredEnergy.meteredEnergyFuel) {
        this.meteredResults = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
      }
    }
  }

  updateCopyTable1String() {
    this.copyTable1String = this.copyTable1.nativeElement.innerText;
  }

  updateCopyTable2String() {
    this.copyTable2String = this.copyTable2.nativeElement.innerText;
  }

}
