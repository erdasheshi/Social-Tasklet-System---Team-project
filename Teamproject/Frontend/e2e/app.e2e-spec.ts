import { SdsAppPage } from './app.po';

describe('sds-app App', function() {
  let page: SdsAppPage;

  beforeEach(() => {
    page = new SdsAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
