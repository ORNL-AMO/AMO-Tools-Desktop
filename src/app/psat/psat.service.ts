import { Injectable } from '@angular/core';
declare var psatAddon: any;

@Injectable()
export class PsatService {

  constructor() { }

  headToolSuctionTank(
    specificGravity: number, 
    flowRate: number, 
    suctionPipeDiameter: number, 
    suctionTankGasOverPressure: number, 
    suctionTankFluidSurfaceElevation: number, 
    suctionLineLossCoefficients: number, 
    dischargePipeDiameter: number, 
    dischargeGaugePressure: number, 
    dischargeGaugeElevation: number, 
    dischargeLineLossCoefficients: number
    ){
    return psatAddon.headToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients)
  }

  headTool(
    specificGravity: number, 
    flowRate: number, 
    suctionPipeDiameter: number, 
    suctionGuagePressure: number, 
    suctionGuageElevation: number, 
    suctionLineLossCoefficients: number, 
    dischargePipeDiameter: number, 
    dischargeGaugePressure: number, 
    dischargeGaugeElevation: number, 
    dischargeLineLossCoefficients: number
    ){
    return psatAddon.headTool(specificGravity, flowRate, suctionPipeDiameter, suctionGuagePressure, suctionGuageElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
  }

}
