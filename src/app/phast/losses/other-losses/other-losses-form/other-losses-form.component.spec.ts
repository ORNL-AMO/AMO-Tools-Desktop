import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherLossesFormComponent } from './other-losses-form.component';

describe('OtherLossesFormComponent', () => {
  let component: OtherLossesFormComponent;
  let fixture: ComponentFixture<OtherLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
