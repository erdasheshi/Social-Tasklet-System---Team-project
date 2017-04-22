import { Frontend3Page } from './app.po';

describe('frontend3 App', function() {
  let page: Frontend3Page;

  beforeEach(() => {
    page = new Frontend3Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
