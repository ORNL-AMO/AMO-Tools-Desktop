import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-receiver-tank',
  templateUrl: './receiver-tank.component.html',
  styleUrls: ['./receiver-tank.component.css']
})
export class ReceiverTankComponent implements OnInit {
  methods: Array<any> = [
    {
      name: 'General',
      value: 0
    },
    {
      name: 'Dedicated Storage',
      value: 1
    },
    {
      name: 'Metered Storage',
      value: 2
    },
    {
      name: 'Bridging Compressor Reaction Delay',
      value: 3
    }
  ];
  method: number = 0;

  currentField: string = 'default';
  constructor() {
  }

  ngOnInit() {

  }
  changeField(str: string) {
    this.currentField = str;
  }
}
