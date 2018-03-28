import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherTabComponent } from './other-tab.component';

describe('OtherTabComponent', () => {
  let component: OtherTabComponent;
  let fixture: ComponentFixture<OtherTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
