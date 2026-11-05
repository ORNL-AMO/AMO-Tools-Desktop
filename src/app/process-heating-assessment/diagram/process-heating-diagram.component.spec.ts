import { TestBed } from '@angular/core/testing';
import { ProcessHeatingDiagramComponent } from './process-heating-diagram.component';

describe('ProcessHeatingDiagramComponent', () => {
  it('renders the process heating diagram image', () => {
    TestBed.configureTestingModule({ declarations: [ProcessHeatingDiagramComponent] });
    const fixture = TestBed.createComponent(ProcessHeatingDiagramComponent);
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('assets/images/phast-diagram.png');
  });
});
