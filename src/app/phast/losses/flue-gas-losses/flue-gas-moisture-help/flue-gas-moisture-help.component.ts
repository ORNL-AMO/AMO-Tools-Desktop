import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { FlueGasCompareService } from '../flue-gas-compare.service';

@Component({
  selector: 'app-flue-gas-moisture-help',
  templateUrl: './flue-gas-moisture-help.component.html',
  styleUrls: ['./flue-gas-moisture-help.component.css']
})
export class FlueGasMoistureHelpComponent implements OnInit {
  @Input()
  currentField: string;
  fieldSubscription: Subscription;
  constructor(private flueGasCompareService: FlueGasCompareService) {
    
   }

  ngOnInit() {
    this.fieldSubscription = this.flueGasCompareService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy() {
    this.fieldSubscription.unsubscribe();
  }

}
