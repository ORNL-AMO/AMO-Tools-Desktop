import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pneumatic-air-help',
  templateUrl: './pneumatic-air-help.component.html',
  styleUrls: ['./pneumatic-air-help.component.css']
})
export class PneumaticAirHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  constructor() { }

  ngOnInit() {
  }

}
