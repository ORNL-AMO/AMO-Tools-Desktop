import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../shared/models/directory';
@Component({
  selector: 'app-assessment-grid-view',
  templateUrl: './assessment-grid-view.component.html',
  styleUrls: ['./assessment-grid-view.component.css']
})
export class AssessmentGridViewComponent implements OnInit {
  @Input()
  directories: Directory;
  constructor() { }

  ngOnInit() {
    console.log(this.directories)
  }

}
