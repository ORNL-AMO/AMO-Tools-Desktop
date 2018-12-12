import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, HeatLossOutput, ProcessSteamUsage } from '../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-ssmt-report',
  templateUrl: './ssmt-report.component.html',
  styleUrls: ['./ssmt-report.component.css']
})
export class SsmtReportComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;

  massFlow: number = 0;

  dataCalculated: boolean = false;

  inputData: SSMTInputs;

  boiler: BoilerOutput;
  blowdown: SteamPropertiesOutput;
  boilerFeedwater: SteamPropertiesOutput;
  deaeratorFeedwater: SteamPropertiesOutput;

  highPressureHeader: HeaderOutputObj;
  highToMediumPressurePRV: PrvOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highPressureFlashTank: FlashTankOutput;
  highPressureCondensate: SteamPropertiesOutput;

  mediumPressureHeader: HeaderOutputObj;
  lowPressurePRV: PrvOutput;
  mediumPressureCondensate: SteamPropertiesOutput;

  highToLowPressureTurbine: TurbineOutput;
  mediumToLowPressureTurbine: TurbineOutput;
  mediumPressureFlashTank: FlashTankOutput;
  blowdownFlashTank: FlashTankOutput;

  lowPressureHeader: HeaderOutputObj;
  lowPressureCondensate: SteamPropertiesOutput;

  condensateFlashTank: FlashTankOutput;
  combinedCondensate: SteamPropertiesOutput;
  makeupWater: SteamPropertiesOutput;
  makeupWaterAndCondensateHeader: HeaderOutputObj;
  condensingTurbine: TurbineOutput;
  deaerator: DeaeratorOutput;
  steamToDeaerator: number;
  additionalSteamFlow: number;
  highPressureProcessSteamUsage: ProcessSteamUsage;
  mediumPressureProcessSteamUsage: ProcessSteamUsage;
  lowPressureProcessSteamUsage: ProcessSteamUsage;
  highPressureSteamHeatLoss: HeatLossOutput;
  mediumPressureSteamHeatLoss: HeatLossOutput;
  lowPressureSteamHeatLoss: HeatLossOutput;
  returnCondensate: SteamPropertiesOutput;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.calculateModelService.initResults();
    if (this.ssmt.setupDone) {
      this.calculateResults();
    }
  }

  calculateResults() {
    this.calculateModelService.initData(this.ssmt, this.settings)
    let results: number = this.calculateModelService.marksIterator();
    console.log('Addtional Mass flow: ' + results);
    this.getResults();
    this.massFlow = this.boiler.steamMassFlow;
  }

  calculateResultsGivenMassFlow() {
    this.calculateModelService.initData(this.ssmt, this.settings);
    this.calculateModelService.calculateModel(this.massFlow, false);
    this.getResults();
  }


  getResults() {
    this.inputData = this.calculateModelService.inputData;
    this.boiler = this.calculateModelService.boiler;
    this.deaerator = this.calculateModelService.deaerator;
    this.blowdown = this.calculateModelService.blowdown;
    this.boilerFeedwater = this.calculateModelService.boilerFeedwater;
    this.deaeratorFeedwater = this.calculateModelService.deaeratorFeedwater;

    this.highPressureHeader = this.calculateModelService.highPressureHeader;
    this.highToMediumPressurePRV = this.calculateModelService.highToMediumPressurePRV;
    this.highPressureToMediumPressureTurbine = this.calculateModelService.highPressureToMediumPressureTurbine;
    this.highPressureFlashTank = this.calculateModelService.highPressureFlashTank;
    this.highPressureCondensate = this.calculateModelService.highPressureCondensate;

    this.mediumPressureHeader = this.calculateModelService.mediumPressureHeader;
    this.lowPressurePRV = this.calculateModelService.lowPressurePRV;
    this.mediumPressureCondensate = this.calculateModelService.mediumPressureCondensate;

    this.highToLowPressureTurbine = this.calculateModelService.highToLowPressureTurbine;
    this.mediumToLowPressureTurbine = this.calculateModelService.mediumToLowPressureTurbine;
    this.mediumPressureFlashTank = this.calculateModelService.mediumPressureFlashTank;
    this.blowdownFlashTank = this.calculateModelService.blowdownFlashTank;

    this.lowPressureHeader = this.calculateModelService.lowPressureHeader;
    this.lowPressureCondensate = this.calculateModelService.lowPressureCondensate;

    this.condensateFlashTank = this.calculateModelService.condensateFlashTank;
    this.combinedCondensate = this.calculateModelService.combinedCondensate;
    this.makeupWater = this.calculateModelService.makeupWater;
    this.makeupWaterAndCondensateHeader = this.calculateModelService.makeupWaterAndCondensateHeader;
    this.condensingTurbine = this.calculateModelService.condensingTurbine;
    this.steamToDeaerator = this.calculateModelService.steamToDeaerator;
    this.additionalSteamFlow = this.calculateModelService.additionalSteamFlow;
    this.highPressureProcessSteamUsage = this.calculateModelService.highPressureProcessSteamUsage;
    this.highPressureSteamHeatLoss = this.calculateModelService.highPressureSteamHeatLoss;
    this.mediumPressureProcessSteamUsage = this.calculateModelService.mediumPressureProcessSteamUsage;
    this.mediumPressureSteamHeatLoss = this.calculateModelService.mediumPressureSteamHeatLoss;
    this.lowPressureProcessSteamUsage = this.calculateModelService.lowPressureProcessSteamUsage;
    this.lowPressureSteamHeatLoss = this.calculateModelService.lowPressureSteamHeatLoss;
    this.returnCondensate = this.calculateModelService.returnCondensate;
    console.log('got data');
    this.dataCalculated = true;
  }
}
