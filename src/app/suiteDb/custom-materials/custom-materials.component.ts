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

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showGasLoadChargeModal) {
      console.log('custom materials change showGasLoadChargeModal');
    }
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

}
