import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-help',
  templateUrl: './flue-gas-help.component.html',
  styleUrls: ['./flue-gas-help.component.css']
})
export class FlueGasHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  displaySuggestions: boolean = false;
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private flueGasService: FlueGasService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.flueGasService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}
