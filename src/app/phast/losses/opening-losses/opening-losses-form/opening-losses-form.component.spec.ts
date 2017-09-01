import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningLossesFormComponent } from './opening-losses-form.component';

describe('OpeningLossesFormComponent', () => {
  let component: OpeningLossesFormComponent;
  let fixture: ComponentFixture<OpeningLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpeningLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpeningLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
