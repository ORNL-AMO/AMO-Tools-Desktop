import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-turbine-help',
    templateUrl: './turbine-help.component.html',
    styleUrls: ['./turbine-help.component.css'],
    standalone: false
})
export class TurbineHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  turbineHelpSubscription: Subscription;
  turbineOperationValueSubscription: Subscription;
  currentTurbine: string;
  currentOperationValue: number;
  isBaselineFocused: boolean;
  isBaselineFocusedSub: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.turbineHelpSubscription = this.ssmtService.turbineOperationHelp.subscribe(val => {
      this.currentTurbine = val;
    });
    this.turbineOperationValueSubscription = this.ssmtService.turbineOperationValue.subscribe(val => {
      this.currentOperationValue = val;
    });
    this.isBaselineFocusedSub = this.ssmtService.isBaselineFocused.subscribe(val => {
      this.isBaselineFocused = val;
    })
  }

  ngOnDestroy() {
    this.turbineHelpSubscription.unsubscribe();
    this.turbineOperationValueSubscription.unsubscribe();
    this.isBaselineFocusedSub.unsubscribe();
  }

}
