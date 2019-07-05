import { Component, OnInit, Input } from '@angular/core';
import { SystemCurveService } from '../system-curve.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-curve-help',
  templateUrl: './system-curve-help.component.html',
  styleUrls: ['./system-curve-help.component.css']
})
export class SystemCurveHelpComponent implements OnInit {
  @Input()
  isFan: boolean;

  currentField: string;
  currentFieldSubscription: Subscription;
  constructor(private systemCurveService: SystemCurveService) { }

  ngOnInit() {
    this.currentFieldSubscription = this.systemCurveService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSubscription.unsubscribe();
  }
}
