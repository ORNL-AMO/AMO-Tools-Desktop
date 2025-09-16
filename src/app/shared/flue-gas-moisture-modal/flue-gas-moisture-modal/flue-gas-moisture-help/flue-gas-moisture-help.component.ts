import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { FlueGasMoistureModalService } from '../../flue-gas-moisture-modal.service';

@Component({
    selector: 'app-flue-gas-moisture-help',
    templateUrl: './flue-gas-moisture-help.component.html',
    styleUrls: ['./flue-gas-moisture-help.component.css'],
    standalone: false
})
export class FlueGasMoistureHelpComponent implements OnInit {
  @Input()
  currentField: string;
  fieldSubscription: Subscription;
  constructor(private flueGasMoistureModalService: FlueGasMoistureModalService) {
    
   }

  ngOnInit() {
    this.fieldSubscription = this.flueGasMoistureModalService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy() {
    this.fieldSubscription.unsubscribe();
  }

}
