import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-exhaust-gas-help',
  templateUrl: './exhaust-gas-help.component.html',
  styleUrls: ['./exhaust-gas-help.component.css']
})
export class ExhaustGasHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
