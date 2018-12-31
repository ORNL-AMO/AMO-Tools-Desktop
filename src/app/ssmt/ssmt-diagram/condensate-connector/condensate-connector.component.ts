import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-condensate-connector',
  templateUrl: './condensate-connector.component.html',
  styleUrls: ['./condensate-connector.component.css']
})
export class CondensateConnectorComponent implements OnInit {
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string){
    this.emitSetHover.emit(str);
  }
}
