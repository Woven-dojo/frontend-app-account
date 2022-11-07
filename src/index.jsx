import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'formdata-polyfill';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import {
  subscribe, initialize, APP_INIT_ERROR, APP_READY, mergeConfig,
} from '@edx/frontend-platform';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { Header, Footer } from '@woven-dojo/dojo-frontend-common/dist/components';

import configureStore from './data/configureStore';
import AccountSettingsPage, { NotFoundPage } from './account-settings';
import IdVerificationPage from './id-verification';
import CoachingConsent from './account-settings/coaching/CoachingConsent';
import appMessages from './i18n';

import './index.scss';

subscribe(APP_READY, () => {
  const { BASE_URL, ORDER_HISTORY_URL, LOGOUT_URL } = getConfig();
  const { username } = getAuthenticatedUser();
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <Switch>
        <Route path="/coaching_consent" component={CoachingConsent} />
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
          <Header
            logoDestination={`${BASE_URL}/dashboard`}
            logoDestinationTarget="_self"
            username={username}
            userMenu={[
              {
                label: 'Dashboard',
                href: `${BASE_URL}/dashboard`,
              },
              {
                label: 'Profile',
                href: `${BASE_URL}/u/${username}`,
              },
              {
                label: 'Account',
                href: `${BASE_URL}/account/settings`,
              },
              {
                label: 'Logout',
                href: LOGOUT_URL,
              },
            ]}
            actionMenu={[
              {
                label: 'Courses',
                href: `${BASE_URL}/dashboard`,
                target: '_self',
              },
            ]}
          />
          <main className="flex-grow-1">
            <Switch>
              <Route path="/id-verification" component={IdVerificationPage} />
              <Route exact path="/" component={AccountSettingsPage} />
              <Route path="/notfound" component={NotFoundPage} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </main>
          <Footer left={`Copyright ${new Date().getFullYear()} Dojo. All rights reserved`} className="dojo-footer" />
        </div>
      </Switch>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [appMessages],
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL,
        COACHING_ENABLED: (process.env.COACHING_ENABLED || false),
        ENABLE_DEMOGRAPHICS_COLLECTION: (process.env.ENABLE_DEMOGRAPHICS_COLLECTION || false),
        DEMOGRAPHICS_BASE_URL: process.env.DEMOGRAPHICS_BASE_URL,
      }, 'App loadConfig override handler');
    },
  },
});
