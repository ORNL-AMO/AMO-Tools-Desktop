import { Component, OnInit, Input } from '@angular/core';
import { Fsat203Service } from '../../fsat-203.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-data-help',
  templateUrl: './fan-data-help.component.html',
  styleUrls: ['./fan-data-help.component.css']
})
export class FanDataHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  currentPlane: string;


  planeType: string;
  planeTypeSub: Subscription;
  constructor(private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.planeTypeSub = this.fsat203Service.planeShape.subscribe(type => {
      this.planeType = type;
    })
  }

  ngOnDestroy(){
    this.planeTypeSub.unsubscribe();
  }

}
