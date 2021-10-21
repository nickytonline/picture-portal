export const EtherscanLink: React.FC<{ address: string }> = ({ address }) => {
  return (
    <a
      sx={{ color: 'lime' }}
      href={`https://rinkeby.etherscan.io/address/${address}`}
      title={`${address} on etherscan.io`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {address}
    </a>
  );
};
