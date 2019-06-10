import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanDataFormComponent } from './fan-data-form.component';

describe('FanDataFormComponent', () => {
  let component: FanDataFormComponent;
  let fixture: ComponentFixture<FanDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
