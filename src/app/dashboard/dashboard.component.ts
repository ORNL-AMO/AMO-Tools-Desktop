import { Component, OnInit } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { MockDirectory } from '../shared/mocks/mock-directory';
import { ElectronService } from 'ngx-electron';

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
  updateAvailable: boolean;

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    // this.updateAvailable = this.electronService.remote.getGlobal('globalUpdate');
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
