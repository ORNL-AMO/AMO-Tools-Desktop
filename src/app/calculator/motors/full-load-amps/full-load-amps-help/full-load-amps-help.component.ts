import { Component, OnInit } from '@angular/core';
import { FullLoadAmpsService } from '../full-load-amps.service';

@Component({
  selector: 'app-full-load-amps-help',
  templateUrl: './full-load-amps-help.component.html',
  styleUrls: ['./full-load-amps-help.component.css']
})
export class FullLoadAmpsHelpComponent implements OnInit {
  // don't need to pass as input (doesn't exist on full-load-amps.component.ts to pass anyway)
  // @Input()
  currentField: string;

  constructor(private fullLoadAmpsService: FullLoadAmpsService) { }

  ngOnInit() {
    // TODO rhernandez Subscribe to currentfield and set this.currentfield based on value
  }

}
