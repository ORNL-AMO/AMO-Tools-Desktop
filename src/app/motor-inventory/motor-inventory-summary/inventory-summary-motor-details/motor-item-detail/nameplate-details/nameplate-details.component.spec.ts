import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDetailsComponent } from './nameplate-details.component';

describe('NameplateDetailsComponent', () => {
  let component: NameplateDetailsComponent;
  let fixture: ComponentFixture<NameplateDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NameplateDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameplateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
