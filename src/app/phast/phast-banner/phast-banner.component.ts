import { Component, OnInit, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-phast-banner',
  templateUrl: './phast-banner.component.html',
  styleUrls: ['./phast-banner.component.css']
})
export class PhastBannerComponent implements OnInit {
  @Output('togglePanel')
  togglePanel = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  openPanel(str: string){
    this.togglePanel.emit(str);
  }
}
