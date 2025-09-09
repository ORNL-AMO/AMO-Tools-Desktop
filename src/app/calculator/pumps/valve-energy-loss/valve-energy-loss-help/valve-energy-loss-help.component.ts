import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ValveEnergyLossService } from '../valve-energy-loss.service';

@Component({
  selector: 'app-valve-energy-loss-help',
  templateUrl: './valve-energy-loss-help.component.html',
  styleUrl: './valve-energy-loss-help.component.css',
  standalone: false
})
export class ValveEnergyLossHelpComponent implements OnInit {
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private valveEnergyLossService: ValveEnergyLossService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.valveEnergyLossService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
