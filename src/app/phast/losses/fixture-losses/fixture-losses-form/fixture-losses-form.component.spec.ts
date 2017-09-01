import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureLossesFormComponent } from './fixture-losses-form.component';

describe('FixtureLossesFormComponent', () => {
  let component: FixtureLossesFormComponent;
  let fixture: ComponentFixture<FixtureLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
