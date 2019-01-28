import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerTableComponent } from './boiler-table.component';

describe('BoilerTableComponent', () => {
  let component: BoilerTableComponent;
  let fixture: ComponentFixture<BoilerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
