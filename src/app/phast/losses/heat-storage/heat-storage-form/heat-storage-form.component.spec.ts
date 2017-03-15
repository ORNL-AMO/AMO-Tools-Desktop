import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatStorageFormComponent } from './heat-storage-form.component';

describe('HeatStorageFormComponent', () => {
  let component: HeatStorageFormComponent;
  let fixture: ComponentFixture<HeatStorageFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatStorageFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatStorageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
