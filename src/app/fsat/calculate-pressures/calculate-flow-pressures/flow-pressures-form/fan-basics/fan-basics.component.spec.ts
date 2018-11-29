import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanBasicsComponent } from './fan-basics.component';

describe('FanBasicsComponent', () => {
  let component: FanBasicsComponent;
  let fixture: ComponentFixture<FanBasicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanBasicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
