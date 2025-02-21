import { Injectable } from '@angular/core';
import { BaseGasDensity, PsychrometricResults } from '../models/fans';
import { FlueGas } from '../models/phast/losses/flueGas';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlueGasMoistureModalService {
 baselineFlueGasLoss: FlueGas[];
  modifiedFlueGasLoss: FlueGas[];
  psychrometricResults: BehaviorSubject<PsychrometricResults>;
  currentField: BehaviorSubject<string>;
  baseGasDensity: BaseGasDensity; 

  constructor() {
    this.baseGasDensity = {
      barometricPressure: 29.92,
      dewPoint: 0,
      dryBulbTemp: 68,
      gasDensity: 0.07516579558441701,
      gasType: "AIR",
      inputType: "relativeHumidity",
      relativeHumidity: 0,
      specificGravity: 1,
      specificHeatGas: 0.24,
      specificHeatRatio: 1.4,
      staticPressure: 0,
      wetBulbTemp: 118.999
    };
    this.psychrometricResults = new BehaviorSubject<PsychrometricResults>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  setCurrentField(currField: string) {
    this.currentField.next(currField);
  }

  setCurrentDensity(currDensity: BaseGasDensity) {
    this.baseGasDensity = currDensity;
  }

}
