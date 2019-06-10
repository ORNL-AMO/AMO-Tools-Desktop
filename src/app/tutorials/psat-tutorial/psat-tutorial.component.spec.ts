import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatTutorialComponent } from './psat-tutorial.component';

describe('PsatTutorialComponent', () => {
  let component: PsatTutorialComponent;
  let fixture: ComponentFixture<PsatTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
