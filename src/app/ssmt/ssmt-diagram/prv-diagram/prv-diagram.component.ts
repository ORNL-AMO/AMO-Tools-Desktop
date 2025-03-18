import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-prv-diagram',
    templateUrl: './prv-diagram.component.html',
    styleUrls: ['./prv-diagram.component.css'],
    standalone: false
})
export class PrvDiagramComponent implements OnInit {
  @Input()
  prv: PrvOutput;
  @Input()
  inletSteam: string;
  @Input()
  outletSteam: string;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  settings: Settings;

  inletSteamClasses: Array<string>;
  outletSteamClasses: Array<string>;
  feedwaterClasses: Array<string>;
  showFeedwater: boolean = false;
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.setClasses();
    if(isNaN(this.prv.feedwaterMassFlow) == false && this.prv.feedwaterMassFlow != 0){
      this.showFeedwater = true;
    }else{
      this.showFeedwater = false;
    }
  }

  setClasses() {
    this.inletSteamClasses = [this.inletSteam];
    if (this.prv.inletMassFlow < 1e-3) {
      this.inletSteamClasses = ['no-steam-flow'];
    }

    this.outletSteamClasses = [this.outletSteam];
    if (this.prv.outletMassFlow < 1e-3) {
      this.outletSteamClasses = ['no-steam-flow'];
    }
    this.feedwaterClasses = [];
    if (this.prv.feedwaterMassFlow != undefined && this.prv.feedwaterMassFlow < 1e-3) {
      this.feedwaterClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectInlet() {
    if (this.inletSteam === 'medium-pressure') {
      this.emitSelectEquipment.emit('mediumPressurePRVInletHovered');
    } else if (this.inletSteam === 'high-pressure') {
      this.emitSelectEquipment.emit('highPressurePRVInletHovered');
    }
  }

  hoverInlet() {
    if (this.inletSteam === 'medium-pressure') {
      this.emitSetHover.emit('mediumPressurePRVInletHovered');
    } else if (this.inletSteam === 'high-pressure') {
      this.emitSetHover.emit('highPressurePRVInletHovered');
    }
  }

  selectOutlet() {
    if (this.outletSteam === 'low-pressure') {
      this.emitSelectEquipment.emit('lowPressurePRVOutletHovered');
    } else if (this.outletSteam === 'medium-pressure') {
      this.emitSelectEquipment.emit('mediumPressurePRVOutletHovered');
    }
  }

  hoverOutlet() {
    if (this.outletSteam === 'low-pressure') {
      this.emitSetHover.emit('lowPressurePRVOutletHovered');
    } else if (this.outletSteam === 'medium-pressure') {
      this.emitSetHover.emit('mediumPressurePRVOutletHovered');
    }
  }

  selectEquipment() {
    if (this.inletSteam === 'high-pressure') {
      if (this.outletSteam === 'medium-pressure') {
        this.emitSelectEquipment.emit('highToMediumPressurePRV');
      } else {
        this.emitSelectEquipment.emit('lowPressurePRV');
      }
    } else if (this.inletSteam === 'medium-pressure') {
      this.emitSelectEquipment.emit('lowPressurePRV');
    }
  }

  hoverPRV() {
    if (this.inletSteam === 'high-pressure') {
      if (this.outletSteam === 'medium-pressure') {
        this.emitSetHover.emit('highToMediumPressurePRVHovered');
      } else {
        this.emitSetHover.emit('lowPressurePRVHovered');
      }
    } else if (this.inletSteam === 'medium-pressure') {
      this.emitSetHover.emit('lowPressurePRVHovered');
    }
  }

  hoverFeedwater() {
    if (this.outletSteam === 'low-pressure') {
      this.emitSetHover.emit('lowPressurePRVFeedwaterHovered');
    } else if (this.outletSteam === 'medium-pressure') {
      this.emitSetHover.emit('mediumPressurePRVFeedwaterHovered');
    }
  }

  selectFeedwater() {
    if (this.outletSteam === 'low-pressure') {
      this.emitSelectEquipment.emit('lowPressurePRVFeedwaterHovered');
    } else if (this.outletSteam === 'medium-pressure') {
      this.emitSelectEquipment.emit('mediumPressurePRVFeedwaterHovered');
    }
  }
}
