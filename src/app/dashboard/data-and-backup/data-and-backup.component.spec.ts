import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAndBackupComponent } from './data-and-backup.component';

describe('DataAndBackupComponent', () => {
  let component: DataAndBackupComponent;
  let fixture: ComponentFixture<DataAndBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAndBackupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataAndBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
