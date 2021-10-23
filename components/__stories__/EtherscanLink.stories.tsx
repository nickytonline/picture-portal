import React from 'react';

import { Meta } from '@storybook/react';
import { EtherscanLink } from '@components/EtherscanLink';

const meta: Meta = {
  title: 'Components/EtherscanLink',
  component: EtherscanLink,
  argTypes: {
    address: {
      control: { type: 'text' },
      defaultValue: '0xD02Be222253F4b21f0752299416D8E5CEBF57147',
    },
  },
};
export default meta;

export const Default: React.VFC<{ address: string }> = ({ address }) => (
  <EtherscanLink address={address} />
);
