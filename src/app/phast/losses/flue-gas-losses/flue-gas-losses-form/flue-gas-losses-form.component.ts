import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-flue-gas-losses-form',
  templateUrl: './flue-gas-losses-form.component.html',
  styleUrls: ['./flue-gas-losses-form.component.css']
})
export class FlueGasLossesFormComponent implements OnInit {
  @Input()
  flueGasLossForm: any;
  constructor() { }

  ngOnInit() {
  }

}
