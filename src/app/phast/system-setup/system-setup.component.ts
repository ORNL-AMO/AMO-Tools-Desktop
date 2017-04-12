import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.css']
})
export class SystemSetupComponent implements OnInit {


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
