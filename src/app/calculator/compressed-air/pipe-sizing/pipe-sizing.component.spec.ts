import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeSizingComponent } from './pipe-sizing.component';

describe('PipeSizingComponent', () => {
  let component: PipeSizingComponent;
  let fixture: ComponentFixture<PipeSizingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeSizingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeSizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
