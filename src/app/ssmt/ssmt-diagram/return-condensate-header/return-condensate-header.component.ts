import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderOutputObj } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-return-condensate-header',
  templateUrl: './return-condensate-header.component.html',
  styleUrls: ['./return-condensate-header.component.css']
})
export class ReturnCondensateHeaderComponent implements OnInit {
  @Input()
  makeupWaterAndCondensateHeader: HeaderOutputObj;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

}
