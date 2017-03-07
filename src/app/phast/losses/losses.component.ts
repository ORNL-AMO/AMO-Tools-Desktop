import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-losses',
  templateUrl: 'losses.component.html',
  styleUrls: ['losses.component.css']
})
export class LossesComponent implements OnInit {

  lossesTab: string = 'wall-losses';

  constructor() { }

  ngOnInit() {
  }

  changeTab($event){
    this.lossesTab = $event;
  }

}
