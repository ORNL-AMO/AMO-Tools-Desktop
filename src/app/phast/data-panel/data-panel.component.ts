import { Component, OnInit} from '@angular/core';

import {SankeyComponent} from '../sankey/sankey.component';

@Component({
  selector: 'app-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.css']
})

export class DataPanelComponent implements OnInit {

  private sankey = new SankeyComponent();
  expand: boolean;

  constructor() {
  }

  ngOnInit() {
    this.sankey.makeSankey("app-sankey-diagram");
    this.expand = false;
  }

  zoom(){
    this.expand = true;
  }

}
