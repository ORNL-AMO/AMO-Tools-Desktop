import { Component, OnInit, Input } from '@angular/core';
import { LoadCharacteristicOptions, LoadCharacteristicData } from '../../../../motor-inventory';

@Component({
    selector: 'app-load-characteristic-details',
    templateUrl: './load-characteristic-details.component.html',
    styleUrls: ['./load-characteristic-details.component.css'],
    standalone: false
})
export class LoadCharacteristicDetailsComponent implements OnInit {
  @Input()
  displayOptions: LoadCharacteristicOptions;
  @Input()
  loadCharacteristicData: LoadCharacteristicData;
  
  constructor() { }

  ngOnInit(): void {
  }

}
