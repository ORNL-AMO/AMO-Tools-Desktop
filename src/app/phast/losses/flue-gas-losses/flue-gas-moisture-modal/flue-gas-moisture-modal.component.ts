import { Component, Input, Output, OnInit, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCompareService } from '../flue-gas-compare.service';


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

    constructor(private flueGasCompareService: FlueGasCompareService) {
    }
    
    ngOnInit() {
      this.settings = this.flueGasCompareService.setFanDefaultUnits(this.settings);
    }


    hideMoistureModal(event: number) {
      this.hideModal.emit(event);
    }
  }