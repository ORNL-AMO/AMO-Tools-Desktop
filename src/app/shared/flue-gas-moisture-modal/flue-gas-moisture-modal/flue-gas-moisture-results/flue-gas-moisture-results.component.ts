import { Component, OnInit, Input } from '@angular/core';
import { PsychrometricResults } from '../../../models/fans';
import { Subscription } from 'rxjs';
import { Settings } from '../../../models/settings';
import { FlueGasCompareService } from '../../../../phast/losses/flue-gas-losses/flue-gas-compare.service';
import { FanPsychrometricService, FanPsychrometricWarnings } from '../../../../calculator/process-cooling/fan-psychrometric/fan-psychrometric.service';


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
  warnings: FanPsychrometricWarnings;

  constructor(private flueGasCompareService: FlueGasCompareService, private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
    this.psychrometricSubscription = this.flueGasCompareService.moistureSubject.subscribe(val => {
      this.psychrometricResults = val;
      this.warnings = this.fanPsychrometricService.checkWarnings(this.psychrometricResults);
    });

  }

  ngOnDestroy() {
    this.psychrometricSubscription.unsubscribe();
  }
}
