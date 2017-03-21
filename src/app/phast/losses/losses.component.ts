import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../shared/models/phast';

@Component({
  selector: 'app-losses',
  templateUrl: 'losses.component.html',
  styleUrls: ['losses.component.css']
})
export class LossesComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  saveClicked: boolean;

  lossesTab: string = 'charge-material';

  constructor() { }

  ngOnInit() {
  }

  changeTab($event){
    this.lossesTab = $event;
    console.log(this.phast)
  }

}
