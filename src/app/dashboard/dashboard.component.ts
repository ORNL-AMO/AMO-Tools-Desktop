import { Component, OnInit } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { MockDirectory } from '../shared/mocks/mock-directory';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory = MockDirectory;
  workingDirectory: Directory = MockDirectory;
  showCalculators: boolean = false;
  selectedCalculator: string;
  constructor() { }

  ngOnInit() {
  }

  changeWorkingDirectory($event) {
    this.showCalculators = false;
    this.workingDirectory = $event;
  }

  viewCalculator(str: string) {
    this.showCalculators = true;
    this.selectedCalculator = str;
  }
}
