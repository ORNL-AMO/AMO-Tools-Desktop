import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetupComponent } from './data-setup.component';

describe('DataSetupComponent', () => {
  let component: DataSetupComponent;
  let fixture: ComponentFixture<DataSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
