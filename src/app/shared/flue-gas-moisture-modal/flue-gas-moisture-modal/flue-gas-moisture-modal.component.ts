import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Settings } from '../../models/settings';
import { FlueGasMoistureModalService } from '../flue-gas-moisture-modal.service';


@Component({
    selector: 'app-flue-gas-moisture-modal',
    templateUrl: './flue-gas-moisture-modal.component.html',
    styleUrls: ['./flue-gas-moisture-modal.component.css']
  })
  
  export class FlueGasMoistureModalComponent implements OnInit {
    @Input()
    settings: Settings;
    @Output('hideModal')
    hideModal = new EventEmitter<number>();

    constructor(private flueGasMoistureModalService: FlueGasMoistureModalService) {
    }

  ngOnInit() {
    if (this.settings.unitsOfMeasure == 'Imperial') {
      this.settings.densityMeasurement = 'lbscf';
      this.settings.fanPressureMeasurement = 'inH2o';
      this.settings.fanBarometricPressure = 'inHg';
    } else {
      this.settings.densityMeasurement = 'kgNm3';
      this.settings.fanPressureMeasurement = 'Pa';
      this.settings.fanBarometricPressure = 'Pa';
    }
  }


    hideMoistureModal(event: number) {
      this.hideModal.emit(event);
    }
  }