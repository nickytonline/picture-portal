import { MessageRequest } from '../@types/MessageRequest';
import { EtherscanLink } from '@components/EtherscanLink';
import { Image } from '@components/Image';

export const MessageCard: React.FC<{
  messageRequest: MessageRequest;
  passedRef?: React.Ref<HTMLDetailsElement>;
  id?: string;
}> = ({ messageRequest, passedRef, id }) => {
  const timeStamp: string = messageRequest.timestamp.toString();
  return (
    <details ref={passedRef} id={id}>
      <summary sx={{ userSelect: 'none', cursor: 'pointer' }}>
        {messageRequest.message}
      </summary>
      <p>
        Sender: <EtherscanLink address={messageRequest.address} />
      </p>
      <p>
        Sent:{' '}
        <time dateTime={timeStamp}>{new Date(timeStamp).toLocaleString()}</time>
      </p>
      <Image
        src={messageRequest.imageUrl}
        alt="Art for this request"
        layout="responsive"
        width="375"
        height="300"
      />
    </details>
  );
};
