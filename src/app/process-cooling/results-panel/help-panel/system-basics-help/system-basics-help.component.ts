import { Component } from '@angular/core';
import { ProcessCoolingService } from '../../../process-cooling.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-basics-help',
  standalone: false,
  templateUrl: './system-basics-help.component.html',
  styleUrl: './system-basics-help.component.css'
})
export class SystemBasicsHelpComponent {
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
