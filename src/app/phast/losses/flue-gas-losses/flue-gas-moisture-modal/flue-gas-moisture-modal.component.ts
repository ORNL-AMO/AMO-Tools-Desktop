import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BaseGasDensity } from '../../../../shared/models/fans';

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

    constructor() {
       
    }
    
    ngOnInit() {
      
    }

    hideMoistureModal(event: number) {
        this.hideModal.emit(event);
    }

  }