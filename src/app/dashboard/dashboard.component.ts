import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DirectoryDbRef, Directory } from '../shared/models/directory';
import { MockDirectory } from '../shared/mocks/mock-directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allDirectories: Directory;
  workingDirectory: Directory;
  showCalculators: boolean = false;
  selectedCalculator: string;

  newDirectory: any;

  constructor(private indexedDbService: IndexedDbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newDirectory = this.formBuilder.group({
      directoryName: ['', Validators.required]
    });

    //open DB and get directories
    this.indexedDbService.initDb().then(
      results => {
        this.indexedDbService.getDirectory(1).then(
          results => {
            if (results) {
              this.allDirectories = this.populateDirectories(results);
              this.workingDirectory = this.allDirectories
            }
          })
      }
    )
  }

  populateDirectories(directoryRef: DirectoryDbRef): Directory {
    let tmpDirectory: Directory = {
      name: directoryRef.name,
      createdDate: directoryRef.createdDate,
      modifiedDate: directoryRef.modifiedDate,
      id: directoryRef.id,
      collapsed: false
    }
    this.indexedDbService.getDirectoryAssessments(directoryRef.id).then(
      results => {
        tmpDirectory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
      results => {
        tmpDirectory.subDirectory = results;
      }
    )
    return tmpDirectory;
  }

  changeWorkingDirectory($event) {
    this.showCalculators = false;
    this.workingDirectory = $event;
  }

  viewCalculator(str: string) {
    this.showCalculators = true;
    this.selectedCalculator = str;
  }

  createDirectory() {
    let tmpDirectory: DirectoryDbRef = {
      name: this.newDirectory.value.directoryName,
      createdDate: new Date(),
      modifiedDate: new Date(),
      assessmentIds: null,
      parentDirectoryId: null,
      subDirectoryIds: null
    }
    this.indexedDbService.addDirectory(tmpDirectory).then(
      results => {
        this.indexedDbService.getDirectory(results).then(result => {
          this.allDirectories = this.populateDirectories(result);
          this.workingDirectory = this.allDirectories;
        })
      }
    )

  }
}
