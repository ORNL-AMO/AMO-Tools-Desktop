import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-one-header-connector',
  templateUrl: './one-header-connector.component.html',
  styleUrls: ['./one-header-connector.component.css']
})
export class OneHeaderConnectorComponent implements OnInit {
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
}
