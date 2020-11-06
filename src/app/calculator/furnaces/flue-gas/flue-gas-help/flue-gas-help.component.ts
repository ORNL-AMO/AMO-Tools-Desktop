import { Component, Input, OnInit } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-help',
  templateUrl: './flue-gas-help.component.html',
  styleUrls: ['./flue-gas-help.component.css']
})
export class FlueGasHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  displaySuggestions: boolean = false;
  currentFieldSub: any;

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
