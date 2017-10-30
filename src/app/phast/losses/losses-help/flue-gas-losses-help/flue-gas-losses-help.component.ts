import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-flue-gas-losses-help',
  templateUrl: './flue-gas-losses-help.component.html',
  styleUrls: ['./flue-gas-losses-help.component.css']
})
export class FlueGasLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
