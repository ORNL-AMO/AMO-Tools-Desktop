import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  psat: Assessment;
  @Output('togglePanel')
  togglePanel = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  openPanel(str: string){
    this.togglePanel.emit(str);
  }

}
