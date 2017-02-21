import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-phast-banner',
  templateUrl: './phast-banner.component.html',
  styleUrls: ['./phast-banner.component.css']
})
export class PhastBannerComponent implements OnInit {
  @Output('togglePanel')
  togglePanel = new EventEmitter<string>();
  @Input()
  assessment: Assessment;
  constructor() { }

  ngOnInit() {
  }

  openPanel(str: string){
    this.togglePanel.emit(str);
  }
}
