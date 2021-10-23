import React from 'react';

import { Meta } from '@storybook/react';
import { EtherscanLink } from '../EtherscanLink';

export default {
  title: 'Components/EtherscanLink',
  component: EtherscanLink,
  argTypes: {
    address: {
      control: { type: 'text' },
      defaultValue: '123456ABCD',
    },
  },
} as Meta;

export const Default: React.VFC<{ address: string }> = ({ address }) => (
  <EtherscanLink address={address} />
);
