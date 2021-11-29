import { Component, OnInit, Input } from '@angular/core';
import { PsychrometricResults } from '../../../../shared/models/fans';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasCompareService } from '../flue-gas-compare.service';


@Component({
  selector: 'app-flue-gas-moisture-results',
  templateUrl: './flue-gas-moisture-results.component.html',
  styleUrls: ['./flue-gas-moisture-results.component.css']
})
export class FlueGasMoistureResultsComponent implements OnInit {
  @Input() 
  settings: Settings;

  psychrometricSubscription: Subscription;
  psychrometricResults: PsychrometricResults;
  constructor(private flueGasCompareService: FlueGasCompareService) { }

  ngOnInit(): void {
    this.psychrometricSubscription = this.flueGasCompareService.moistureSubject.subscribe(val => {
      this.psychrometricResults = val;
    });

  }

  ngOnDestroy() {
    this.psychrometricSubscription.unsubscribe();
  }
}
