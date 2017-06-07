import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-auxiliary-power-losses-help',
  templateUrl: './auxiliary-power-losses-help.component.html',
  styleUrls: ['./auxiliary-power-losses-help.component.css']
})
export class AuxiliaryPowerLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
