import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
async function load(file, mocks = {}) {
  const source = await readFile(file, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = {
    exports: {},
    require: name => name in mocks ? mocks[name] : name.endsWith('.module.css') ? { default: new Proxy({}, { get: (_, key) => String(key) }) } : require(name),
    window: {}, localStorage: storage,
  };
  vm.runInNewContext(compiled, context);
  return context.exports;
}

// Synthetic session only: no real account, API request or credentials.
const initial = { accessToken: 'test-session', refreshToken: 'test-refresh', portalRole: 'PLAYER' };
const memory = new Map([['blackout_wow_auth', JSON.stringify(initial)]]);
const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
const state = [initial.accessToken, initial.refreshToken, initial.portalRole, true];
let index = 0;
const { AuthProvider } = await load('src/context/AuthContext.tsx', {
  react: {
    createContext: () => ({ Provider: 'auth-provider' }),
    useState: () => {
      const slot = index++;
      return [state[slot], value => { state[slot] = value; }];
    },
    useEffect: () => {}, useCallback: callback => callback, useMemo: factory => factory(),
  },
  '@/lib/api': { apiJson: () => { throw new Error('Logout must not require an API request'); } },
});
const auth = AuthProvider({ children: null }).props.value;
const navigation = [];
const { resources } = await load('src/i18n/resources.ts');
for (const language of ['es', 'en', 'pt']) {
  const { LogoutButton } = await load('src/components/LogoutButton.tsx', {
    '@/context/AuthContext': { useAuth: () => auth },
    'next/navigation': { useRouter: () => ({ replace: path => {
      const stored = JSON.parse(memory.get('blackout_wow_auth'));
      assert.equal(stored.accessToken, null, 'Clear the session before navigating');
      assert.equal(stored.refreshToken, null, 'Clear the refresh token before navigating');
      navigation.push(path);
    } }) },
    'react-i18next': { useTranslation: () => ({ t: key => {
      assert.equal(key, 'nav.logout');
      return resources[language].translation.nav.logout;
    } }) },
  });
  const button = LogoutButton();
  assert.equal(button.type, 'button');
  assert.equal(button.props.type, 'button');
  assert.equal(button.props.children[1], resources[language].translation.nav.logout);
  button.props.onClick();
}
assert.deepEqual(state.slice(0, 3), [null, null, null]);
assert.deepEqual(navigation, ['/login', '/login', '/login']);
const { LogoutButton: GuestButton } = await load('src/components/LogoutButton.tsx', {
  '@/context/AuthContext': { useAuth: () => ({ accessToken: null }) },
  'next/navigation': { useRouter: () => ({}) },
  'react-i18next': { useTranslation: () => ({ t: () => '' }) },
});
assert.equal(GuestButton(), null);
console.log('PASS: logout clears access/refresh tokens and role before returning to login; ES/EN/PT labels and guest visibility verified with a synthetic session.');

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { storeShowcaseCopy } = await load('src/lib/store-showcase-copy.ts');
const { supportCopy } = await load('src/lib/support-copy.ts');
let signedIn = false;
let language = 'es';
const componentMocks = {
  'next/link': { default: ({ href, children, ...props }) => React.createElement('a', { ...props, href }, children) },
  'react-i18next': { useTranslation: () => ({ i18n: { language } }) },
  '@/context/AuthContext': { useAuth: () => ({ accessToken: signedIn ? 'test-session' : null }) },
  '@/lib/site-config': { DISCORD_INVITE_URL: 'https://discord.gg/aH7cXcUUn4' },
  '@/lib/store-showcase-copy': { storeShowcaseCopy },
  '@/lib/support-copy': { supportCopy },
  './WarcraftMotion': { AmbientVideo: () => null },
};
const { StoreShowcase } = await load('src/components/StoreShowcase.tsx', componentMocks);
const { SupportShowcase } = await load('src/components/SupportShowcase.tsx', componentMocks);
for (language of ['es', 'en', 'pt']) {
  signedIn = false;
  assert.equal(renderToStaticMarkup(React.createElement(StoreShowcase)), '', 'Guest must not see Donor details');
  const home = renderToStaticMarkup(React.createElement(SupportShowcase));
  assert.ok(home.includes('/login?next=%2Fcuenta%23donor'));
  assert.ok(!/USD|VIP Instance|VIP Mall/.test(home), 'Home must remain an unpriced invitation');
  signedIn = true;
  const account = renderToStaticMarkup(React.createElement(StoreShowcase));
  const text = account.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const price of ['50 USD', '200 USD', '15 USD', '5 USD', '10 USD', '20 USD']) assert.ok(text.includes(price), 'Missing price: ' + price);
  assert.ok(text.includes('VIP Instance') && text.includes('VIP Mall') && text.includes(storeShowcaseCopy[language].keys));
  assert.ok(!/T35|Tier 35|V10/.test(text), 'Donor descriptions must not contain tier or legendary-version labels');
  assert.ok(text.includes('Blackout-WoW') && text.includes('(DM)'), 'Donor enquiries must direct players to a direct message to Blackout-WoW');
  assert.ok(!/arsenal/i.test(text));
  assert.ok(renderToStaticMarkup(React.createElement(SupportShowcase)).includes('/cuenta#donor'));
}
console.log('PASS: Donor details and approved prices appear only in the signed-in view; Home routes guests to login and members to their account in ES/EN/PT.');

// Account navigation must remain accessible even while the account API is loading.
const navigationMocks = {
  ...componentMocks,
  '@/lib/use-interface-copy': { useInterfaceCopy: () => text => text },
  'react-i18next': { useTranslation: () => ({ i18n: { language }, t: key => key.split('.').reduce((value, part) => value?.[part], resources[language].translation) ?? key }) },
  'next/navigation': { usePathname: () => '/', useRouter: () => ({ replace: () => {} }) },
  '@/context/AuthContext': { useAuth: () => ({ accessToken: signedIn ? 'test-session' : null, isAuthReady: true, canManageDashboard: false, logout: () => {} }) },
  './LanguageSwitcher': { LanguageSwitcher: () => null },
  './PortalBackdrop': { PortalBackdrop: () => null },
  './WarcraftMotion': { WarcraftMotion: ({ children }) => children },
  './FooterSocialLinks': { FooterSocialLinks: () => null },
  './InterfaceSound': { InterfaceSoundToggle: () => null },
  './WarcraftVisualEffects': { WarcraftVisualEffects: () => null },
};
const { SiteHeader } = await load('src/components/SiteHeader.tsx', navigationMocks);
const { SiteShell } = await load('src/components/SiteShell.tsx', { ...navigationMocks, './SiteHeader': { SiteHeader } });
const { default: AccountPage } = await load('src/app/cuenta/page.tsx', {
  ...navigationMocks,
  '@/lib/use-dialog-focus': { useDialogFocus: () => {} },
  '@/lib/api': { apiJson: () => { throw new Error('No API requests in navigation test'); } },
  '@/components/SiteShell': { SiteShell },
  '@/components/StoreShowcase': { StoreShowcase },
  '@/components/LogoutButton': { LogoutButton: () => null },
});
for (language of ['es', 'en', 'pt']) {
  for (signedIn of [false, true]) {
    const shell = renderToStaticMarkup(React.createElement(SiteShell, null));
    assert.ok(!/href="\/tienda(?:\/puntos)?"/.test(shell), 'Global navigation must not expose account shop links');
    if (signedIn) assert.ok(!/href="\/(?:login|registro)"/.test(shell), 'Signed-in navigation must lead to the account instead of repeating sign-in links');
    const account = renderToStaticMarkup(React.createElement(AccountPage));
    const toolbar = account.match(/<nav class="account-shortcuts"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    if (signedIn) {
      for (const destination of ['/tienda', '/tienda/puntos', '#donor']) assert.ok(toolbar.includes('href="' + destination + '"'));
      for (const label of [resources[language].translation.nav.store, resources[language].translation.nav.redeem]) assert.ok(toolbar.includes(label));
    } else {
      assert.equal(toolbar, '');
      assert.ok(!account.includes('id="donor"'));
    }
  }
}
console.log('PASS: store, redemption and VIP shortcuts live only in the authenticated account, including while account details load; global header/footer stay clean in ES/EN/PT.');
