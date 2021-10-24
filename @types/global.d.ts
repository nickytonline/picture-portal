import { BaseProvider } from '@metamask/providers';
import { NetworkInfo } from '@types/NetworkInfo';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add the deprecated marquee tag as an intrinsic element to allow it to be used
      marquee: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLMarqueeElement>,
        HTMLMarqueeElement
      >;
    }
  }

  interface Window {
    ethereum: BaseProvider & NetworkInfo;
  }
}
