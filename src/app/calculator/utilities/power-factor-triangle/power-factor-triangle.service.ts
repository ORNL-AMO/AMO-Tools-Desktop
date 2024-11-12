import { Injectable } from '@angular/core';
import { PowerFactorTriangleInputs, PowerFactorTriangleModeInputs, PowerFactorTriangleOutputs } from '../../../shared/models/standalone';
import { StandaloneService } from '../../standalone.service';

@Injectable()
export class PowerFactorTriangleService {
  inputData: PowerFactorTriangleInputs;
  constructor(private standaloneService: StandaloneService) { }

  generateExample(): PowerFactorTriangleInputs {
    return {
      mode: 1,
      apparentPower: 100,
      realPower: 87,
      reactivePower: 49.31,
      phaseAngle: 29.5,
      powerFactor: 0.87,
    };
  }

  generateExampleOutput(): PowerFactorTriangleOutputs {
    return {
      apparentPower: 100,
      realPower: 87,
      reactivePower: 49.31,
      phaseAngle: 29.5,
      powerFactor: 0.87,
    };
  }

  getResetData(): PowerFactorTriangleInputs {
    return {
      mode: 1,
      apparentPower: 0,
      realPower: 0,
      reactivePower: 0,
      phaseAngle: 0,
      powerFactor: 0,
    };
  }

  getResults(data: PowerFactorTriangleInputs): PowerFactorTriangleOutputs{
    let calcInputs: PowerFactorTriangleModeInputs;
    if (data.mode == 1){
      calcInputs = {
        mode: 1,
        input1: data.apparentPower,
        input2: data.realPower,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 2){
      calcInputs = {
        mode: 2,
        input1: data.apparentPower,
        input2: data.reactivePower,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 3){
      calcInputs = {
        mode: 3,
        input1: data.apparentPower,
        input2: data.phaseAngle,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 4){
      calcInputs = {
        mode: 4,
        input1: data.apparentPower,
        input2: data.powerFactor,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 5){
      calcInputs = {
        mode: 5,
        input1: data.realPower,
        input2: data.reactivePower,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 6){
      calcInputs = {
        mode: 6,
        input1: data.realPower,
        input2: data.phaseAngle,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 7){
      calcInputs = {
        mode: 7,
        input1: data.realPower,
        input2: data.powerFactor,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 8){
      calcInputs = {
        mode: 8,
        input1: data.reactivePower,
        input2: data.phaseAngle,
        inputPowerFactor: data.powerFactor
      }
      
    } else if (data.mode == 9){
      calcInputs = {
        mode: 9,
        input1: data.reactivePower,
        input2: data.powerFactor,
        inputPowerFactor: data.powerFactor
      }
      
    } 
    let results: PowerFactorTriangleOutputs = this.standaloneService.powerFactorTriangle(calcInputs);
    return results;
  }





}

