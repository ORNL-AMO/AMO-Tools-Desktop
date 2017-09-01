import { AMOToolsDesktopPage } from './app.po';

describe('amo-tools-desktop App', function() {
  let page: AMOToolsDesktopPage;

  beforeEach(() => {
    page = new AMOToolsDesktopPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
