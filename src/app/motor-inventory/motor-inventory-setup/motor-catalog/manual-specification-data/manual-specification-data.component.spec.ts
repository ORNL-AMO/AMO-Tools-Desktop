import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualSpecificationDataComponent } from './manual-specification-data.component';

describe('ManualSpecificationDataComponent', () => {
  let component: ManualSpecificationDataComponent;
  let fixture: ComponentFixture<ManualSpecificationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualSpecificationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualSpecificationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
