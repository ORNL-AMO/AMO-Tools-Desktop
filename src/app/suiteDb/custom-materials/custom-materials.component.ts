import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-custom-materials',
  templateUrl: './custom-materials.component.html',
  styleUrls: ['./custom-materials.component.css']
})
export class CustomMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  showFlueModal: boolean = false;
  showSolidLiquidFlueModal: boolean = false;
  showGasLoadChargeModal: boolean = false;
  showLiquidLoadChargeModal: boolean = false;
  showSolidLoadChargeModal: boolean = false;
  showAtmosphereModal: boolean = false;
  showWallSurfaceModal: boolean = false;

  showFlueMaterials: boolean = false;
  showSolidLiquidFlueMaterials: boolean = false;
  showGasLoadChargeMaterials: boolean = false;
  showLiquidLoadChargeMaterials: boolean = false;
  showSolidLoadChargeMaterials: boolean = false;
  showAtmosphereMaterials: boolean = false;
  showWallSurfaceMaterials: boolean = false;
  

  constructor() { }

  ngOnInit() {
  }

  toggleModal(material: string) {
    switch (material) {
      case 'flue':
        this.showFlueModal = !this.showFlueModal;
        break;
      case 'solid-liquid-flue':
        this.showSolidLiquidFlueModal = !this.showSolidLiquidFlueModal;
        break;
      case 'gas-load':
        this.showGasLoadChargeModal = !this.showGasLoadChargeModal;
        break;
      case 'liquid-load':
        this.showLiquidLoadChargeModal = !this.showLiquidLoadChargeModal;
        break;
      case 'solid-load':
        this.showSolidLoadChargeModal = !this.showSolidLoadChargeModal;
        break;
      case 'atmosphere-material':
        this.showAtmosphereModal = !this.showAtmosphereModal;
        break;
      case 'wall-surface':
        this.showWallSurfaceModal = !this.showWallSurfaceModal;
        break;
      default:
        break;
    }

  }


  toggleMaterial(material: string) {
    switch (material) {
      case 'flue':
        this.showFlueMaterials = !this.showFlueMaterials;
        break;
      case 'solid-liquid-flue':
        this.showSolidLiquidFlueMaterials = !this.showSolidLiquidFlueMaterials;
        break;
      case 'gas-load':
        this.showGasLoadChargeMaterials = !this.showGasLoadChargeMaterials;
        break;
      case 'liquid-load':
        this.showLiquidLoadChargeMaterials = !this.showLiquidLoadChargeMaterials;
        break;
      case 'solid-load':
        this.showSolidLoadChargeMaterials = !this.showSolidLoadChargeMaterials;
        break;
      case 'atmosphere-material':
        this.showAtmosphereMaterials = !this.showAtmosphereMaterials;
        break;
      case 'wall-surface':
        this.showWallSurfaceMaterials = !this.showWallSurfaceMaterials;
        break;
      default:
        break;
    }

  }


  checkSelected(){
    return true;
  }
}
