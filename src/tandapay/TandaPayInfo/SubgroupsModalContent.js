/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { TandaRibbon } from '../components';
import { BRAND_COLOR, HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';

import type { SubgroupInfo } from '../contract/types';
import { formatBigNumber, sortSubgroupsById } from './utils';

type Props = $ReadOnly<{|
  subgroupsData: ?Array<SubgroupInfo>,
  loading: boolean,
  error: ?string,
  onRefresh: () => void,
|}>;

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: HALF_COLOR,
    marginTop: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: HALF_COLOR,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  infoValueSmall: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTextBase: {
    fontWeight: 'bold',
  },
  ribbonContent: {
    padding: 12,
    // backgroundColor will be handled dynamically
  },
});

export default function SubgroupsModalContent(props: Props): Node {
  const { subgroupsData, loading, error, onRefresh } = props;

  // Render subgroups using TandaRibbon
  function renderSubgroupsWithRibbon(): Node {
    if (!subgroupsData || subgroupsData.length === 0) {
      return (
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoValue}>No subgroups found.</ZulipText>
        </View>
      );
    }

    const sortedSubgroups = sortSubgroupsById(subgroupsData);

    return (
      <>
        {sortedSubgroups.map(subgroup => (
          <TandaRibbon
            key={formatBigNumber(subgroup.id)}
            label={`Subgroup #${formatBigNumber(subgroup.id)} (${subgroup.members.length || 0} members)`}
            backgroundColor={BRAND_COLOR}
            initiallyCollapsed
            marginTop={0}
            marginBottom={0}
          >
            <View style={styles.ribbonContent}>
              <View style={styles.infoRow}>
                <ZulipText style={styles.infoLabel}>Valid:</ZulipText>
                <ZulipText
                  style={[
                    styles.statusTextBase,
                    { color: subgroup.isValid ? TandaPayColors.success : TandaPayColors.error },
                  ]}
                >
                  {subgroup.isValid ? 'Yes' : 'No'}
                </ZulipText>
              </View>

              {subgroup.members && subgroup.members.length > 0 && (
                <View style={styles.infoRow}>
                  <ZulipText style={styles.infoLabel}>Members:</ZulipText>
                  <ZulipText style={styles.infoValueSmall}>
                    {subgroup.members.map(addr => `${addr.slice(0, 6)}...${addr.slice(-4)}`).join(', ')}
                  </ZulipText>
                </View>
              )}
            </View>
          </TandaRibbon>
        ))}
      </>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      {error != null && error.trim() !== '' && (
        <View style={styles.errorContainer}>
          <ZulipText style={styles.errorText}>{error}</ZulipText>
        </View>
      )}

      {renderSubgroupsWithRibbon()}
    </ScrollView>
  );
}
