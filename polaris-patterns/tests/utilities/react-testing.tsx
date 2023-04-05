import React from 'react';
import {
  createMount,
  mount,
  Element as ReactTestingElement,
  CustomRoot,
} from '@shopify/react-testing';
import {PolarisTestProvider} from '@shopify/polaris';
import type {WithPolarisTestProviderOptions} from '@shopify/polaris';

import translations from '../../locales/en.json';

export {createMount, mount, ReactTestingElement, CustomRoot};

export const mountWithApp = createMount<
  WithPolarisTestProviderOptions,
  WithPolarisTestProviderOptions
>({
  context(options) {
    return options;
  },
  render(element, context) {
    return (
      <PolarisTestProvider i18n={translations} {...context}>
        {element}
      </PolarisTestProvider>
    );
  },
});