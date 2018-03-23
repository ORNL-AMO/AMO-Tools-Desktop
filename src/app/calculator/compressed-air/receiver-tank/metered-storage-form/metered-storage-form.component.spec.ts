import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredStorageFormComponent } from './metered-storage-form.component';

describe('MeteredStorageFormComponent', () => {
  let component: MeteredStorageFormComponent;
  let fixture: ComponentFixture<MeteredStorageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredStorageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredStorageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
