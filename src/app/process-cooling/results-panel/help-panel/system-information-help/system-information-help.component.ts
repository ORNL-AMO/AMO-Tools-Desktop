import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingService } from '../../../process-cooling.service';

@Component({
  selector: 'app-system-information-help',
  standalone: false,
  templateUrl: './system-information-help.component.html',
  styleUrl: './system-information-help.component.css'
})
export class SystemInformationHelpComponent {
  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private processCoolingService: ProcessCoolingService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.processCoolingService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
