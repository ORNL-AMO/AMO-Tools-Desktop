import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingEconomizerComponent } from './condensing-economizer.component';

describe('CondensingEconomizerComponent', () => {
  let component: CondensingEconomizerComponent;
  let fixture: ComponentFixture<CondensingEconomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CondensingEconomizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensingEconomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
