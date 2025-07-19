/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { Modal, View } from 'react-native';

import ZulipText from '../../common/ZulipText';
import ZulipButton from '../../common/ZulipButton';
import type { FullTransaction } from './FullTransaction';

type Props = {|
  visible: boolean,
  transaction: ?FullTransaction,
  onClose: () => void,
  onViewInExplorer: (txHash: string) => void,
|};

export default function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
  onViewInExplorer,
}: Props): Node {
  if (!visible || !transaction) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '90%',
            maxHeight: '80%',
          }}
        >
          <ZulipText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Transaction Details
          </ZulipText>

          <ZulipText style={{ marginBottom: 10 }}>
            Hash:
            {' '}
            {transaction.hash != null && transaction.hash !== '' ? transaction.hash : 'N/A'}
          </ZulipText>

          <ZulipText style={{ marginBottom: 10 }}>
            Type:
            {' '}
            {transaction.type}
          </ZulipText>

          <ZulipText style={{ marginBottom: 20 }}>
            Block:
            {' '}
            {transaction.blockNum != null && transaction.blockNum !== '' ? transaction.blockNum : 'N/A'}
          </ZulipText>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ZulipButton
              text="Close"
              onPress={onClose}
            />
            {transaction.hash != null && transaction.hash !== '' && (
              <ZulipButton
                text="View in Explorer"
                onPress={() => onViewInExplorer(transaction.hash || '')}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
