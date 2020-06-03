import { MasterPage } from './app.po';

describe('master App', () => {
  let page: MasterPage;

  beforeEach(() => {
    page = new MasterPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
