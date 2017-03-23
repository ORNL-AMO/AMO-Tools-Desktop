import { Component, OnInit } from '@angular/core';
import {ElectronService} from '../shared/electron.service';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})
export class CoreComponent implements OnInit {

  updateAvailable: boolean;

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.updateAvailable = this.electronService.isUpdateAvailable();
  }

}
