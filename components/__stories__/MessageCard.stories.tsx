import React from 'react';

import { Meta } from '@storybook/react';
import { MessageRequest } from '../../@types/MessageRequest';
import { MessageCard } from '@components/MessageCard';

const meta: Meta = {
  title: 'Components/MessageCard',
  component: MessageCard,
  argTypes: {
    id: {
      control: { type: 'text' },
      defaultValue: undefined,
    },
    messageRequest: {
      control: { type: 'object' },
      defaultValue: {
        address: '0xD02Be222253F4b21f0752299416D8E5CEBF57147',
        imageUrl: 'https://http.cat/403',
        message: 'YOLO',
        timestamp: new Date(),
      },
    },
    passedRef: {
      control: { type: 'object' },
      defaultValue: undefined,
    },
  },
};

export default meta;

export const Default: React.VFC<{
  id?: string;
  messageRequest: MessageRequest;
  passedRef?: React.Ref<HTMLDetailsElement>;
}> = ({ id, messageRequest, passedRef }) => (
  <MessageCard id={id} messageRequest={messageRequest} passedRef={passedRef} />
);
