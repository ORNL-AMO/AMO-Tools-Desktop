import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FlueGasOutput } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-results',
  templateUrl: './flue-gas-results.component.html',
  styleUrls: ['./flue-gas-results.component.css']
})
export class FlueGasResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  modificationExists: boolean;

  outputSubscription: Subscription;
  output: FlueGasOutput;

  constructor(private flueGasService: FlueGasService) { }

  ngOnInit(): void {
    this.outputSubscription = this.flueGasService.output.subscribe(val => {
      this.output = val;
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

}
