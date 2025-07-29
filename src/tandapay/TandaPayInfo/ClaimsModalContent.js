/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import ZulipText from '../../common/ZulipText';
import { TandaRibbon } from '../components';
import ScrollableTextBox from '../components/ScrollableTextBox';
import { HALF_COLOR } from '../../styles/constants';
import TandaPayColors from '../styles/colors';
import { ThemeContext } from '../../styles/theme';
import { formatBigNumber } from './utils';
import { formatTokenAmount } from '../definitions';
import { useSelector } from '../../react-redux';
import { getTokenByAddress } from '../tokens/tokenSelectors';

import type { ClaimInfo } from '../contract/types';
import type { ThemeData } from '../../styles/theme';

type Props = $ReadOnly<{|
  claimsData: ?Array<ClaimInfo>,
  paymentTokenAddress?: string | null,
  loading: boolean,
  error: ?string,
  onRefresh: () => void,
  // Display flags - all optional, default to true
  showClaimId?: boolean,
  showAmount?: boolean,
  showIsWhitelisted?: boolean,
  showClaimantAddress?: boolean,
  showClaimantSubgroupId?: boolean,
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
  },
  claimHeader: {
    padding: 12,
    marginBottom: 8,
  },
  claimHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  claimDetails: {
    padding: 12,
  },
  claimSeparator: {
    height: 1,
    backgroundColor: TandaPayColors.disabled,
    marginVertical: 8,
  },
  addressContainer: {
    marginBottom: 8,
  },
});

// Render claim details for a ribbon
function renderClaimForRibbon(params: $ReadOnly<{|
  claim: ClaimInfo,
  themeData: ThemeData,
  paymentTokenInfo: ?{| symbol: string, name: string, decimals: number, address: ?string |},
  isLast?: boolean,
  displayFlags: $ReadOnly<{|
    showClaimId: boolean,
    showAmount: boolean,
    showIsWhitelisted: boolean,
    showClaimantAddress: boolean,
    showClaimantSubgroupId: boolean,
  |}>,
|}>): Node {
  const {
    claim,
    themeData,
    paymentTokenInfo,
    isLast = false,
    displayFlags,
  } = params;

  // Format the claim amount using the new utility
  const formattedAmount = formatTokenAmount(
    paymentTokenInfo,
    formatBigNumber(claim.amount) || '0'
  );

  return (
    <View key={formatBigNumber(claim.id)}>
      <View style={[styles.claimHeader, { backgroundColor: themeData.cardColor }]}>
        <ZulipText style={styles.claimHeaderText}>
          Claim #
          {formatBigNumber(claim.id)}
        </ZulipText>
      </View>

      <View style={styles.claimDetails}>
        {displayFlags.showClaimId && (
          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Claim ID:</ZulipText>
            <ZulipText style={styles.infoValue}>
              {formatBigNumber(claim.id)}
            </ZulipText>
          </View>
        )}

        {displayFlags.showAmount && (
          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Amount:</ZulipText>
            <ZulipText style={styles.infoValue}>
              {formattedAmount.formattedDisplay}
            </ZulipText>
          </View>
        )}

        {displayFlags.showIsWhitelisted && (
          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Whitelisted:</ZulipText>
            <ZulipText
              style={[
                styles.statusTextBase,
                { color: claim.isWhitelisted ? TandaPayColors.success : TandaPayColors.error },
              ]}
            >
              {claim.isWhitelisted ? 'Yes' : 'No'}
            </ZulipText>
          </View>
        )}

        {displayFlags.showClaimantSubgroupId && (
          <View style={styles.infoRow}>
            <ZulipText style={styles.infoLabel}>Claimant Subgroup:</ZulipText>
            <ZulipText style={styles.infoValue}>
              #
              {formatBigNumber(claim.claimantSubgroupId)}
            </ZulipText>
          </View>
        )}

        {displayFlags.showClaimantAddress && (
          <View style={styles.addressContainer}>
            <ZulipText style={styles.infoLabel}>Claimant Address:</ZulipText>
            <ScrollableTextBox
              text={claim.claimantWalletAddress}
              label={`Claim #${formatBigNumber(claim.id)} Claimant`}
              size="small"
            />
          </View>
        )}
      </View>

      {!isLast && <View style={styles.claimSeparator} />}
    </View>
  );
}

export default function ClaimsModalContent(props: Props): Node {
  const {
    claimsData,
    loading,
    error,
    onRefresh,
    paymentTokenAddress = null,
    showClaimId = true,
    showAmount = true,
    showIsWhitelisted = true,
    showClaimantAddress = true,
    showClaimantSubgroupId = true,
  } = props;

  const themeData = useContext(ThemeContext);

  // Find the payment token information using the token selector
  const paymentTokenInfo = useSelector(state =>
    (paymentTokenAddress != null && paymentTokenAddress.trim() !== '')
      ? getTokenByAddress(state, paymentTokenAddress)
      : null
  );

  const displayFlags = {
    showClaimId,
    showAmount,
    showIsWhitelisted,
    showClaimantAddress,
    showClaimantSubgroupId,
  };

  // Render claims using TandaRibbon
  function renderClaimsWithRibbon(): Node {
    if (!claimsData || claimsData.length === 0) {
      return (
        <View style={styles.infoRow}>
          <ZulipText style={styles.infoValue}>No claims found for this period.</ZulipText>
        </View>
      );
    }

    // Sort claims by ID
    const sortedClaims = [...claimsData].sort((a, b) => {
      const aId = formatBigNumber(a.id) || '0';
      const bId = formatBigNumber(b.id) || '0';
      return parseInt(aId, 10) - parseInt(bId, 10);
    });

    return (
      <>
        {sortedClaims.map((claim, index) => {
          const claimId = formatBigNumber(claim.id);
          const whitelistedStatus = claim.isWhitelisted ? 'Whitelisted' : 'Not Whitelisted';

          return (
            <TandaRibbon
              key={claimId}
              label={`Claim #${claimId} - ${whitelistedStatus}`}
              backgroundColor={claim.isWhitelisted ? TandaPayColors.success : TandaPayColors.error}
              initiallyCollapsed
              marginTop={0}
              marginBottom={0}
              contentBackgroundColor={themeData.cardColor}
            >
              {renderClaimForRibbon({
                claim,
                themeData,
                paymentTokenInfo: paymentTokenInfo ? {
                  symbol: paymentTokenInfo.symbol,
                  name: paymentTokenInfo.name,
                  decimals: paymentTokenInfo.decimals,
                  address: paymentTokenInfo.address,
                } : null,
                isLast: index === sortedClaims.length - 1,
                displayFlags,
              })}
            </TandaRibbon>
          );
        })}
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

      {renderClaimsWithRibbon()}
    </ScrollView>
  );
}
