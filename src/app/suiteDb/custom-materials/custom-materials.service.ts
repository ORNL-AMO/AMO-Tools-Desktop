import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { GasLoadChargeMaterial, FlueGasMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, WallLossesSurface, SolidLoadChargeMaterial, AtmosphereSpecificHeat } from '../../shared/models/materials';

@Injectable()
export class CustomMaterialsService {

  selectedAtmosphere: Array<AtmosphereSpecificHeat>;
  selectedFlueGas: Array<FlueGasMaterial>;
  selectedGasLoadCharge: Array<GasLoadChargeMaterial>;
  selectedLiquidLoadCharge: Array<LiquidLoadChargeMaterial>;
  selectedSolidLiquidFlueGas: Array<SolidLiquidFlueGasMaterial>;
  selectedSolidCharge: Array<SolidLoadChargeMaterial>;
  selectedWall: Array<WallLossesSurface>;

  getSelected: BehaviorSubject<boolean>;
  selectAll: BehaviorSubject<boolean>;
  constructor() {
    this.selectedAtmosphere = new Array<AtmosphereSpecificHeat>();
    this.selectedFlueGas = new Array<FlueGasMaterial>();
    this.selectedGasLoadCharge = new Array<GasLoadChargeMaterial>();
    this.selectedLiquidLoadCharge = new Array<LiquidLoadChargeMaterial>();
    this.selectedSolidLiquidFlueGas = new Array<SolidLiquidFlueGasMaterial>();
    this.selectedSolidCharge = new Array<SolidLoadChargeMaterial>();
    this.selectedWall = new Array<WallLossesSurface>();
    this.getSelected = new BehaviorSubject<boolean>(false);
    this.selectAll = new BehaviorSubject<boolean>(false);
  }

  deleteSelected(){

  }

  exportSelected(){
    let data: MaterialExportData = {
      atmosphereSpecificHeat: this.selectedAtmosphere,
      flueGasMaterial: this.selectedFlueGas,
      gasLoadChargeMaterial: this.selectedGasLoadCharge,
      liquidLoadChargeMaterial: this.selectedLiquidLoadCharge,
      solidLiquidFlueGasMaterial: this.selectedSolidLiquidFlueGas,
      solidLoadChargeMaterial: this.selectedSolidCharge,
      wallLossesSurface: this.selectedWall
    }
    console.log(data);
  }
}


export interface MaterialExportData {
  atmosphereSpecificHeat: Array<AtmosphereSpecificHeat>,
  flueGasMaterial: Array<FlueGasMaterial>,
  gasLoadChargeMaterial: Array<GasLoadChargeMaterial>,
  liquidLoadChargeMaterial: Array<LiquidLoadChargeMaterial>,
  solidLiquidFlueGasMaterial: Array<SolidLiquidFlueGasMaterial>,
  solidLoadChargeMaterial: Array<SolidLoadChargeMaterial>,
  wallLossesSurface: Array<WallLossesSurface>
}
