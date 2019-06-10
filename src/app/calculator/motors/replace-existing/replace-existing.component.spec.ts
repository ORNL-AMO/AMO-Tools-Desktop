import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceExistingComponent } from './replace-existing.component';

describe('ReplaceExistingComponent', () => {
  let component: ReplaceExistingComponent;
  let fixture: ComponentFixture<ReplaceExistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceExistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceExistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
