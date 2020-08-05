import * as React from 'react';
import * as PropTypes from 'prop-types';
import {css, styled} from '@twilio-paste/styling-library';
import {useUID, useUIDSeed} from 'react-uid';
import {useComboboxPrimitive} from '@twilio-paste/combobox-primitive';
import {ChevronDownIcon} from '@twilio-paste/icons/esm/ChevronDownIcon';
import {Box} from '@twilio-paste/box';
import {FormControlWrapper, FormHelpText, FormLabel, InputElement, SelectIconWrapper} from '@twilio-paste/form';
import {ComboboxInputWrapper} from './ComboboxInputWrapper';
import {ComboboxListbox} from './ComboboxListbox';
import {ComboboxListboxGroup} from './ComboboxListboxGroup';
import {ComboboxListboxOption} from './ComboboxListboxOption';
import {RenderGroupItemsProps, RenderItemProps, RenderItemsProps, RenderListBoxProps, ComboboxProps} from './types';

// This module can only be referenced with ECMAScript imports/exports by turning on the 'esModuleInterop' flag and referencing its default export
const groupBy = require('lodash.groupby');

// Fixes chevron overlapping really long text
/* eslint-disable emotion/syntax-preference */
const StyledInputAsSelect = styled(InputElement)(
  css({
    paddingRight: 'space100',
  })
);
/* eslint-enable */

const renderItem = ({
  item,
  index,
  getItemProps,
  highlightedIndex,
  optionTemplate,
  inGroup,
  optionUID,
}: RenderItemProps): React.ReactNode => {
  return (
    <ComboboxListboxOption
      {...getItemProps({item, index})}
      highlighted={highlightedIndex === index}
      key={optionUID(index)}
      variant={inGroup ? 'groupOption' : 'default'}
    >
      {optionTemplate ? optionTemplate(item) : item}
    </ComboboxListboxOption>
  );
};

const renderItems = ({
  items,
  getItemProps,
  highlightedIndex,
  optionTemplate,
  optionUID,
}: RenderItemsProps): React.ReactNode[] =>
  items.map((item, index) => {
    return renderItem({item, index, getItemProps, highlightedIndex, optionTemplate, optionUID});
  });

const renderGroupedItems = ({
  items,
  getItemProps,
  highlightedIndex,
  optionTemplate,
  groupLabelTemplate,
  groupItemsBy,
  optionUID,
  groupUID,
}: RenderGroupItemsProps): React.ReactNode[] | null => {
  if (groupItemsBy != null) {
    const groupedItems = groupBy(items, (item: {}) => item[groupItemsBy]);
    let itemIndex = 0;
    return Object.keys(groupedItems).map(group => {
      if (group === 'undefined') {
        return groupedItems[group].map((item: {}) => {
          return renderItem({item, index: itemIndex++, getItemProps, highlightedIndex, optionTemplate, optionUID});
        });
      }
      return (
        <ComboboxListboxGroup groupName={group} groupLabelTemplate={groupLabelTemplate} key={groupUID(group)}>
          {groupedItems[group].map((item: {}) => {
            return renderItem({
              item,
              index: itemIndex++,
              getItemProps,
              highlightedIndex,
              optionTemplate,
              inGroup: true,
              optionUID,
            });
          })}
        </ComboboxListboxGroup>
      );
    });
  }
  return null;
};

const renderListBox = ({
  items,
  getItemProps,
  highlightedIndex,
  optionTemplate,
  groupLabelTemplate,
  groupItemsBy,
  optionUID,
  groupUID,
}: RenderListBoxProps): React.ReactNode[] | null =>
  groupItemsBy
    ? renderGroupedItems({
        items,
        getItemProps,
        highlightedIndex,
        optionTemplate,
        groupItemsBy,
        groupLabelTemplate,
        optionUID,
        groupUID,
      })
    : renderItems({items, getItemProps, highlightedIndex, optionTemplate, optionUID});

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      autocomplete,
      disabled,
      hasError,
      helpText,
      initialSelectedItem,
      initialIsOpen,
      inputValue,
      insertAfter,
      insertBefore,
      items,
      itemToString,
      labelText,
      onInputValueChange,
      onSelectedItemChange,
      optionTemplate,
      onHighlightedIndexChange,
      onIsOpenChange,
      required,
      selectedItem,
      groupItemsBy,
      groupLabelTemplate,
      ...props
    },
    ref
  ) => {
    const {
      getComboboxProps,
      getInputProps,
      getItemProps,
      getLabelProps,
      getMenuProps,
      getToggleButtonProps,
      highlightedIndex,
      isOpen,
    } = useComboboxPrimitive({
      initialSelectedItem,
      items,
      onHighlightedIndexChange,
      onInputValueChange,
      onIsOpenChange,
      onSelectedItemChange,
      ...(itemToString && {itemToString}),
      ...(initialIsOpen && {initialIsOpen}),
      ...(inputValue && {inputValue}),
      ...(selectedItem && {selectedItem}),
    });
    const helpTextId = useUID();
    const groupUID = useUIDSeed();
    const optionUID = useUIDSeed();

    return (
      <Box position="relative">
        <FormLabel disabled={disabled} required={required} {...getLabelProps()}>
          {labelText}
        </FormLabel>
        <FormControlWrapper
          disabled={disabled}
          hasError={hasError}
          insertBefore={insertBefore}
          insertAfter={insertAfter}
        >
          <ComboboxInputWrapper {...getComboboxProps({role: 'combobox'})}>
            <StyledInputAsSelect
              {...getToggleButtonProps({tabIndex: 0})}
              {...getInputProps({disabled})}
              {...(!autocomplete ? {onChange: event => event.preventDefault()} : undefined)}
              aria-describedby={helpTextId}
              {...props}
              type="text"
              ref={ref}
              paddingRight="space90"
            />
            <SelectIconWrapper>
              <ChevronDownIcon
                aria-hidden="true"
                decorative
                color={disabled ? 'colorTextWeaker' : 'colorTextIcon'}
                size="sizeIcon30"
              />
            </SelectIconWrapper>
          </ComboboxInputWrapper>
        </FormControlWrapper>
        {isOpen && (
          <ComboboxListbox {...getMenuProps()}>
            {renderListBox({
              items,
              getItemProps,
              highlightedIndex,
              optionTemplate,
              groupItemsBy,
              groupLabelTemplate,
              optionUID,
              groupUID,
            })}
          </ComboboxListbox>
        )}
        {helpText && (
          <FormHelpText id={helpTextId} variant={hasError ? 'error' : undefined}>
            {helpText}
          </FormHelpText>
        )}
      </Box>
    );
  }
);

Combobox.displayName = 'Combobox';

if (process.env.NODE_ENV === 'development') {
  Combobox.propTypes = {
    autocomplete: PropTypes.bool,
    groupItemsBy: PropTypes.string,
    helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    initialIsOpen: PropTypes.bool,
    initialSelectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    items: PropTypes.arrayOf(PropTypes.any).isRequired,
    itemToString: PropTypes.func,
    labelText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    onHighlightedIndexChange: PropTypes.func,
    onInputValueChange: PropTypes.func,
    onIsOpenChange: PropTypes.func,
    onSelectedItemChange: PropTypes.func,
    optionTemplate: PropTypes.func,
    selectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  };
}

export {Combobox};
