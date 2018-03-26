import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DedicatedStorageFormComponent } from './dedicated-storage-form.component';

describe('DedicatedStorageFormComponent', () => {
  let component: DedicatedStorageFormComponent;
  let fixture: ComponentFixture<DedicatedStorageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DedicatedStorageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DedicatedStorageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
