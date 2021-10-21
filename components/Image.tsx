import { useState } from 'react';
import WrappedImage from 'next/image';

export const Image: typeof WrappedImage = ({
  src,
  alt,
  width,
  height,
  layout,
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState(src);

  return (
    <WrappedImage
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      layout={layout}
      {...props}
      onError={(error) => {
        setImageUrl('https://http.cat/404');
      }}
    />
  );
};
