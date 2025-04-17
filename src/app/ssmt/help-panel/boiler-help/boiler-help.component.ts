import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-boiler-help',
    templateUrl: './boiler-help.component.html',
    styleUrls: ['./boiler-help.component.css'],
    standalone: false
})
export class BoilerHelpComponent implements OnInit {
  @Input()
  currentField: string;

  
  isBaselineFocused: boolean;
  isBaselineFocusedSub: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.isBaselineFocusedSub = this.ssmtService.isBaselineFocused.subscribe(val => {
      this.isBaselineFocused = val;
    })
  }

  ngOnDestroy() {
    this.isBaselineFocusedSub.unsubscribe();
  }

}
