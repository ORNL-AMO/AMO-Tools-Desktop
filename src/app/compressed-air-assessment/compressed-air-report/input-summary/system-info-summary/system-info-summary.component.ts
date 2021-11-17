import { Component, Input, OnInit } from '@angular/core';
import { SystemInformation } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-system-info-summary',
  templateUrl: './system-info-summary.component.html',
  styleUrls: ['./system-info-summary.component.css']
})
export class SystemInfoSummaryComponent implements OnInit {
  @Input()
  systemInformation: SystemInformation;
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;
  
  collapse: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

}
