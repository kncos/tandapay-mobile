/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { TandaPayColors, TandaPayTypography } from '../styles';
import { ThemeContext } from '../../styles';
import Card from './Card';

type Props = $ReadOnly<{|
  value: boolean,
  onValueChange: (value: boolean) => void,
  label: string,
  description?: string,
  disabled?: boolean,
  style?: ?{},
|}>;

const customStyles = {
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    ...TandaPayTypography.label,
    marginBottom: 4,
  },
  description: {
    ...TandaPayTypography.description,
    fontSize: 12,
    opacity: 0.7,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  disabledContainer: {
    opacity: 0.6,
  },
};

export default function BooleanToggle(props: Props): Node {
  const {
    value,
    onValueChange,
    label,
    description,
    disabled = false,
    style,
  } = props;

  const themeData = useContext(ThemeContext);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <View style={[customStyles.container, style]}>
      <Card style={disabled ? customStyles.disabledContainer : null}>
        <TouchableOpacity
          style={customStyles.content}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={customStyles.textContainer}>
            <ZulipText style={customStyles.label}>
              {label}
            </ZulipText>
            {description != null && description !== '' && (
              <ZulipText style={customStyles.description}>
                {description}
              </ZulipText>
            )}
          </View>

          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            style={customStyles.switch}
            trackColor={{
              false: themeData.dividerColor,
              true: TandaPayColors.primary,
            }}
            thumbColor={value ? TandaPayColors.white : TandaPayColors.disabled}
            ios_backgroundColor={themeData.dividerColor}
          />
        </TouchableOpacity>
      </Card>
    </View>
  );
}
