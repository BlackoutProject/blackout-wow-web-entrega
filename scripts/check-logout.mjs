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
  assert.ok(!/USD|VIP Instance|VIP Mall|T35|Tier 35|V10/.test(text), 'Donor must show contact information, not a product catalog');
  assert.ok(text.includes(storeShowcaseCopy[language].intro) && text.includes(' V '), 'Donor enquiries must direct players to V in their language');
  assert.ok(account.includes('href="https://discord.gg/aH7cXcUUn4"'), 'Donor contact must link to the official Discord');
  assert.ok(!/href="\/tienda|<form|<button/.test(account), 'Donor must not initiate purchases or points redemption');
  assert.ok(renderToStaticMarkup(React.createElement(SupportShowcase)).includes('/cuenta#donor'));
}
console.log('PASS: authenticated Donor is contact-only, with V and the official Discord in ES/EN/PT; Home keeps its general support invitation.');

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
let accountFixture = null;
let accountStateIndex = 0;
const { default: AccountPage } = await load('src/app/cuenta/page.tsx', {
  ...navigationMocks,
  react: { ...React, useState: initial => React.useState(accountStateIndex++ === 0 ? accountFixture : initial) },
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
    accountStateIndex = 0;
    const account = renderToStaticMarkup(React.createElement(AccountPage));
    assert.ok(!/href="\/tienda(?:\/puntos)?"/.test(account), 'Account must not offer a shop or points redemption');
    const toolbar = account.match(/<nav class="account-shortcuts"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    if (signedIn) {
      assert.ok(toolbar.includes('href="#donor"'), 'Donor contact remains available while account details load');
    } else {
      assert.equal(toolbar, '');
      assert.ok(!account.includes('id="donor"'));
    }
  }
}
// A loaded synthetic account must not expose historical balance/order data in the UI.
signedIn = true;
accountFixture = { username: 'SyntheticPlayer', email: 'test@example.invalid', accountId: 42, characterCount: 3, online: false, joinDate: null, lastLogin: null, donationPointsBalance: 123456789, recentOrders: [{ id: 'synthetic-order', productName: 'Obsolete catalog item' }] };
for (language of ['es', 'en', 'pt']) {
  accountStateIndex = 0;
  const account = renderToStaticMarkup(React.createElement(AccountPage));
  const text = account.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  assert.ok(account.includes('SyntheticPlayer'), 'Loaded account details must still render');
  assert.ok(!/123456789|Obsolete catalog item|href="\/tienda/.test(account), 'Commerce data and navigation must not render');
  assert.ok(!text.includes(resources[language].translation.account.navPurchases), 'Purchase history must not render');
  assert.ok(text.includes(resources[language].translation.account.navAccountInfo) && text.includes(resources[language].translation.account.navSecurity.replaceAll('&', '&amp;')), 'Account information and security remain available');
}
console.log('PASS: account contact, loading/loaded account states and guest visibility verified in ES/EN/PT; no store, balance, redemption or purchase history.');
