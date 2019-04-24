import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceExistingMotorCardComponent } from './replace-existing-motor-card.component';

describe('ReplaceExistingMotorCardComponent', () => {
  let component: ReplaceExistingMotorCardComponent;
  let fixture: ComponentFixture<ReplaceExistingMotorCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceExistingMotorCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceExistingMotorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
