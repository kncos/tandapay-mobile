/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type UserId } from '../api/idTypes';
import { TranslationContext } from '../boot/TranslationProvider';
import { noTranslation } from '../i18n/i18n';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import ZulipButton from '../common/ZulipButton';
import { logout } from '../account/logoutActions';
import { tryStopNotifications } from '../notification/notifTokens';
import AccountDetails from './AccountDetails';
import { getRealm } from '../directSelectors';
import { getOwnUser, getOwnUserId } from '../users/userSelectors';
import { getAuth, getAccount, getZulipFeatureLevel } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';
import { showConfirmationDialog } from '../utils/info';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import SwitchRow from '../common/SwitchRow';
import * as api from '../api';
import { identityOfAccount } from '../account/accountMisc';
import NavRow from '../common/NavRow';
import { emojiTypeFromReactionType } from '../emoji/data';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

function ProfileButton(props: {| +ownUserId: UserId |}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Full profile"
      onPress={() => {
        navigation.push('account-details', { userId: props.ownUserId });
      }}
    />
  );
}

function SettingsButton(props: {||}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Settings"
      onPress={() => {
        navigation.push('settings');
      }}
    />
  );
}

function TandaPayButton(props: {||}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      text="Open Tribunals Menu"
      onPress={() => {
        navigation.push('tandapay-menu');
      }}
    />
  );
}

function SwitchAccountButton(props: {||}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Switch account"
      onPress={() => {
        navigation.push('account-pick');
      }}
    />
  );
}

function LogoutButton(props: {||}) {
  const dispatch = useDispatch();
  const _ = useContext(TranslationContext);
  const account = useSelector(getAccount);
  const identity = identityOfAccount(account);
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Log out"
      onPress={() => {
        showConfirmationDialog({
          destructive: true,
          title: 'Log out',
          message: {
            text: 'This will log out {email} on {realmUrl} from the mobile app on this device.',
            values: { email: identity.email, realmUrl: identity.realm.toString() },
          },
          onPressConfirm: () => {
            dispatch(tryStopNotifications(account));
            dispatch(logout());
          },
          _,
        });
      }}
    />
  );
}

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: RouteProp<'profile', void>,
|}>;

/**
 * The profile/settings/account screen we offer among the main tabs of the app.
 */
export default function ProfileScreen(props: Props): Node {
  const navigation = useNavigation();

  const auth = useSelector(getAuth);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const ownUser = useSelector(getOwnUser);
  const ownUserId = useSelector(getOwnUserId);
  const presenceEnabled = useSelector(state => getRealm(state).presenceEnabled);
  const awayStatus = useSelector(state => getUserStatus(state, ownUserId).away);
  const userStatus = useSelector(state => getUserStatus(state, ownUserId));

  const { status_emoji, status_text } = userStatus;

  return (
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }}>
      <OfflineNoticePlaceholder />
      <ScrollView>
        <AccountDetails user={ownUser} showEmail={false} showStatus={false} />
        <NavRow
          leftElement={
            status_emoji != null
              ? {
                  type: 'emoji',
                  emojiCode: status_emoji.emoji_code,
                  emojiType: emojiTypeFromReactionType(status_emoji.reaction_type),
                }
              : undefined
          }
          title="Set your status"
          subtitle={status_text != null ? noTranslation(status_text) : undefined}
          onPress={() => {
            navigation.push('user-status');
          }}
        />
        {zulipFeatureLevel >= 148 ? (
          <SwitchRow
            label="Invisible mode"
            /* $FlowIgnore[incompatible-cast] - Only null when FL is <89;
               see comment on RealmState['presenceEnabled'] */
            value={!(presenceEnabled: boolean)}
            onValueChange={(newValue: boolean) => {
              api.updateUserSettings(auth, { presence_enabled: !newValue }, zulipFeatureLevel);
            }}
          />
        ) : (
          // TODO(server-6.0): Remove.
          <SwitchRow
            label="Set yourself to away"
            value={awayStatus}
            onValueChange={(away: boolean) => {
              api.updateUserStatus(auth, { away });
            }}
          />
        )}
        <View style={styles.buttonRow}>
          <ProfileButton ownUserId={ownUser.user_id} />
        </View>
        <View style={styles.buttonRow}>
          <SettingsButton />
        </View>
        <View style={styles.buttonRow}>
          <TandaPayButton />
        </View>
        <View style={styles.buttonRow}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
