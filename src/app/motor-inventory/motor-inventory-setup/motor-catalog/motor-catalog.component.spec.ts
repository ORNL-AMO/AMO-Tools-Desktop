import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorCatalogComponent } from './motor-catalog.component';

describe('MotorCatalogComponent', () => {
  let component: MotorCatalogComponent;
  let fixture: ComponentFixture<MotorCatalogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorCatalogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
