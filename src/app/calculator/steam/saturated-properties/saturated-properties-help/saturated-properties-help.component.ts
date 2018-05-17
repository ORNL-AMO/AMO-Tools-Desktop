import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-saturated-properties-help',
  templateUrl: './saturated-properties-help.component.html',
  styleUrls: ['./saturated-properties-help.component.css']
})
export class SaturatedPropertiesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  
  }

}
