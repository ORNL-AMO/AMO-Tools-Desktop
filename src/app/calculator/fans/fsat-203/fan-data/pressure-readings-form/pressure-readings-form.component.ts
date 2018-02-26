import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  traverseHoles: Array<Array<number>>;
  constructor() { }

  ngOnInit() {
    this.traverseHoles =
      [
        [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
        [11, 22, 33, 44, 5, 1, 2, 3, 4, 5]
      ];
  }

}
