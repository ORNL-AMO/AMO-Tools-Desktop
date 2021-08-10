import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FullLoadAmpsService } from '../full-load-amps.service';

@Component({
  selector: 'app-full-load-amps-help',
  templateUrl: './full-load-amps-help.component.html',
  styleUrls: ['./full-load-amps-help.component.css']
})
export class FullLoadAmpsHelpComponent implements OnInit {
  currentField: string;
  currentFieldSub: Subscription;

  constructor(private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    this.currentFieldSub = this.fullLoadAmpsService.currentField.subscribe(value => {
      this.currentField = value;
    })
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}
