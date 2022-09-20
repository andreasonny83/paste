import * as React from 'react';
import * as PropTypes from 'prop-types';
import {isValidElementType} from 'react-is';
import {Text} from '@twilio-paste/text';
import {Box, safelySpreadBoxProps} from '@twilio-paste/box';
import {isIconSizeTokenProp} from '@twilio-paste/style-props';
import {getComputedTokenNames, getInitialsFromName} from './utils';
import type {AvatarProps, AvatarContentProps} from './types';

const DEFAULT_SIZE = 'sizeIcon70';

const AvatarContents: React.FC<React.PropsWithChildren<AvatarContentProps>> = ({
  name,
  size = DEFAULT_SIZE,
  src,
  icon: Icon,
}) => {
  const computedTokenNames = getComputedTokenNames(size);
  if (src != null) {
    return <Box as="img" alt={name} maxWidth="100%" src={src} size={size} title={name} />;
  }
  if (Icon != null) {
    if (!isValidElementType(Icon) || typeof Icon.displayName !== 'string' || !Icon.displayName.includes('Icon')) {
      throw new Error('[Paste Avatar]: icon prop expected to be a Paste icon only.');
    }
    return (
      <Box maxWidth="100%" size={size} display="flex" alignItems="center" justifyContent="center">
        <Icon decorative={false} title={name} size={computedTokenNames.iconSize} />
      </Box>
    );
  }
  return (
    <Text
      as="abbr"
      display="block"
      fontSize={computedTokenNames.fontSize}
      fontWeight="fontWeightBold"
      lineHeight={computedTokenNames.lineHeight}
      textAlign="center"
      textDecoration="none"
      title={name}
      color="inherit"
    >
      {getInitialsFromName(name)}
    </Text>
  );
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({name, children, size = DEFAULT_SIZE, element = 'AVATAR', src, icon, ...props}, ref) => {
    if (name === undefined) {
      console.error('[Paste Avatar]: name prop is required');
    }

    return (
      <Box
        {...safelySpreadBoxProps(props)}
        as="div"
        element={element}
        backgroundColor="colorBackgroundUser"
        borderRadius="borderRadiusCircle"
        overflow="hidden"
        ref={ref}
        size={size}
        color="colorText"
      >
        <AvatarContents name={name} size={size} icon={icon} src={src} />
      </Box>
    );
  }
);

Avatar.displayName = 'Avatar';

Avatar.propTypes = {
  size: isIconSizeTokenProp,
  name: PropTypes.string.isRequired,
  element: PropTypes.string,
  src: PropTypes.string,
  icon: (props) => {
    if (typeof props.icon !== 'function') new Error('[Paste Avatar]: icon prop must be a Paste Icon');
    return null;
  },
};

export {Avatar};
