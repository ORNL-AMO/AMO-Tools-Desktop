import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-turbine-help',
  templateUrl: './turbine-help.component.html',
  styleUrls: ['./turbine-help.component.css']
})
export class TurbineHelpComponent implements OnInit {
  @Input()
  currentField: string;
  
  turbineHelpSubscription: Subscription;
  turbineOperationValueSubscription: Subscription;
  currentTurbine: string;
  currentOperationValue: number;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.turbineHelpSubscription = this.ssmtService.turbineOperationHelp.subscribe(val => {
      this.currentTurbine = val;
    })
    this.turbineOperationValueSubscription = this.ssmtService.turbineOperationValue.subscribe(val => {
      this.currentOperationValue = val;
    })
  }

  ngOnDestroy(){
    this.turbineHelpSubscription.unsubscribe();
    this.turbineOperationValueSubscription.unsubscribe();
  }

}
