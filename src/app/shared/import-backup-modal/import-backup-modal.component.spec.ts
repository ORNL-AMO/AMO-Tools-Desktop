import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportBackupModalComponent } from './import-backup-modal.component';

describe('ImportBackupModalComponent', () => {
  let component: ImportBackupModalComponent;
  let fixture: ComponentFixture<ImportBackupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportBackupModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportBackupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
