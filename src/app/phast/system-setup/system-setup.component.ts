import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {
  @Input()
  settings:Settings;

  subTab: string = 'system-basics';

  subTabs: Array<string> = [
    'system-basics',
    'operating-hours'
  ]
  constructor() { }

  ngOnInit() {
  }

  changeTab(str: string){
    this.subTab = str;
  }

}
