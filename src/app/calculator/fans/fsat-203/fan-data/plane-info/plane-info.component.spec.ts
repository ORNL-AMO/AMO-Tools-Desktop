import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneInfoComponent } from './plane-info.component';

describe('PlaneInfoComponent', () => {
  let component: PlaneInfoComponent;
  let fixture: ComponentFixture<PlaneInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaneInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
