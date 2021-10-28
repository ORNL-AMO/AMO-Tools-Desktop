import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Settings } from '../../../../shared/models/settings';
import { CondensingEconomizerService } from '../condensing-economizer.service';

@Component({
  selector: 'app-condensing-economizer-help',
  templateUrl: './condensing-economizer-help.component.html',
  styleUrls: ['./condensing-economizer-help.component.css']
})
export class CondensingEconomizerHelpComponent implements OnInit {

  @Input()
  settings: Settings;

  currentFieldSub: Subscription;
  currentField: string;

  constructor(private condensingEconomizerService: CondensingEconomizerService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.condensingEconomizerService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
