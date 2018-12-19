import { Component, OnInit, Input } from '@angular/core';
import { SSMT, SSMTInputs } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { CalculateModelService } from '../ssmt-calculations/calculate-model.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, PrvOutput, TurbineOutput, FlashTankOutput, DeaeratorOutput, HeatLossOutput, ProcessSteamUsage } from '../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-ssmt-diagram',
  templateUrl: './ssmt-diagram.component.html',
  styleUrls: ['./ssmt-diagram.component.css']
})
export class SsmtDiagramComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;

  massFlow: number = 408.7;

  dataCalculated: boolean = false;

  inputData: SSMTInputs;

  boiler: BoilerOutput;

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
  highPressureProcessSteamUsage: ProcessSteamUsage;
  mediumPressureProcessSteamUsage: ProcessSteamUsage;
  lowPressureProcessSteamUsage: ProcessSteamUsage;
  highPressureSteamHeatLoss: HeatLossOutput;
  mediumPressureSteamHeatLoss: HeatLossOutput;
  lowPressureSteamHeatLoss: HeatLossOutput;
  returnCondensate: SteamPropertiesOutput;
  tabSelect: string = 'results';

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
    this.calculateModelService.calculateModel(this.massFlow);
    this.getResults();
  }


  getResults() {
    this.inputData = this.calculateModelService.inputData;
    this.boiler = this.calculateModelService.boilerOutput;
    this.deaerator = this.calculateModelService.deaeratorOutput;


    this.highPressureHeader = this.calculateModelService.highPressureHeader;
    this.highToMediumPressurePRV = this.calculateModelService.highToMediumPressurePRV;
    this.highPressureToMediumPressureTurbine = this.calculateModelService.highPressureToMediumPressureTurbine;
    this.highPressureFlashTank = this.calculateModelService.highPressureCondensateFlashTank;
    this.highPressureCondensate = this.calculateModelService.highPressureCondensate;

    this.mediumPressureHeader = this.calculateModelService.mediumPressureHeader;
    this.lowPressurePRV = this.calculateModelService.lowPressurePRV;
    this.mediumPressureCondensate = this.calculateModelService.mediumPressureCondensate;

    this.highToLowPressureTurbine = this.calculateModelService.highToLowPressureTurbine;
    this.mediumToLowPressureTurbine = this.calculateModelService.mediumToLowPressureTurbine;
    this.mediumPressureFlashTank = this.calculateModelService.mediumPressureCondensateFlashTank;
    this.blowdownFlashTank = this.calculateModelService.blowdownFlashTank;

    this.lowPressureHeader = this.calculateModelService.lowPressureHeader;
    this.lowPressureCondensate = this.calculateModelService.lowPressureCondensate;

    this.condensateFlashTank = this.calculateModelService.condensateFlashTank;
    this.combinedCondensate = this.calculateModelService.combinedCondensate;
    this.makeupWater = this.calculateModelService.makeupWater;
    this.makeupWaterAndCondensateHeader = this.calculateModelService.makeupWaterAndCondensateHeader;
    this.condensingTurbine = this.calculateModelService.condensingTurbine;

    //this.highPressureProcessSteamUsage = this.calculateModelService.highPressureProcessSteamUsage;
    this.highPressureSteamHeatLoss = this.calculateModelService.highPressureSteamHeatLoss;
    //this.mediumPressureProcessSteamUsage = this.calculateModelService.mediumPressureProcessSteamUsage;
    this.mediumPressureSteamHeatLoss = this.calculateModelService.mediumPressureSteamHeatLoss;
    //this.lowPressureProcessSteamUsage = this.calculateModelService.lowPressureProcessSteamUsage;
    this.lowPressureSteamHeatLoss = this.calculateModelService.lowPressureSteamHeatLoss;
    this.returnCondensate = this.calculateModelService.returnCondensate;
    console.log('got data');
    this.dataCalculated = true;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
