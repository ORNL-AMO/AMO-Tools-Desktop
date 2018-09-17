import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerComponent } from './boiler.component';

describe('BoilerComponent', () => {
  let component: BoilerComponent;
  let fixture: ComponentFixture<BoilerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
