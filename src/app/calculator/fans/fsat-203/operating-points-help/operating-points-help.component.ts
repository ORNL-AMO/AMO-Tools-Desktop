import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-operating-points-help',
  templateUrl: './operating-points-help.component.html',
  styleUrls: ['./operating-points-help.component.css']
})
export class OperatingPointsHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
