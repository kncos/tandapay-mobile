/* @flow strict-local */

// import React, { useState, useEffect } from 'react';
// import type { Node } from 'react';
// import { View, StyleSheet, Alert, Share } from 'react-native';
// import Clipboard from '@react-native-clipboard/clipboard';
// // $FlowFixMe[untyped-import] - react-native-qrcode-svg is not typed
// import QRCode from 'react-native-qrcode-svg';
// 
// import type { RouteProp } from '../../react-navigation';
// import type { AppNavigationProp } from '../../nav/AppNavigator';
// import Screen from '../../common/Screen';
// import ZulipButton from '../../common/ZulipButton';
// import ZulipText from '../../common/ZulipText';
// import { HALF_COLOR } from '../../styles';
// import { getWalletAddress } from './WalletManager';
// 
// type Props = $ReadOnly<{|
//   navigation: AppNavigationProp<'wallet-receive'>,
//   route: RouteProp<'wallet-receive', void>,
// |}>;
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     alignItems: 'center',
//   },
//   qrContainer: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 12,
//     marginVertical: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   addressContainer: {
//     backgroundColor: HALF_COLOR,
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 16,
//     width: '100%',
//   },
//   addressText: {
//     fontFamily: 'monospace',
//     fontSize: 14,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     width: '100%',
//     marginTop: 20,
//   },
//   button: {
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   instructions: {
//     textAlign: 'center',
//     marginBottom: 20,
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   qrCodeTitle: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 12,
//     textAlign: 'center',
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#f39c12',
//     textAlign: 'center',
//     marginTop: 20,
//     fontWeight: 'bold',
//   },
// });
// 
// export default function WalletReceiveScreen(props: Props): Node {
//   const { navigation } = props;
//   const [walletAddress, setWalletAddress] = useState<?string>(null);
//   const [loading, setLoading] = useState(true);
// 
//   useEffect(() => {
//     const loadWalletAddress = async () => {
//       try {
//         const address = await getWalletAddress();
//         setWalletAddress(address);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to load wallet address');
//       } finally {
//         setLoading(false);
//       }
//     };
// 
//     loadWalletAddress();
//   }, []);
// 
//   const handleCopyAddress = async () => {
//     if (walletAddress != null && walletAddress !== '') {
//       await Clipboard.setString(walletAddress);
//       Alert.alert(
//         'Address Copied',
//         'Your wallet address has been copied to the clipboard.',
//         [{ text: 'OK' }]
//       );
//     }
//   };
// 
//   const handleShareAddress = async () => {
//     if (walletAddress != null && walletAddress !== '') {
//       try {
//         await Share.share({
//           message: `My wallet address: ${walletAddress}`,
//           title: 'Wallet Address',
//         });
//       } catch (error) {
//         Alert.alert('Error', 'Failed to share wallet address');
//       }
//     }
//   };
// 
//   const formatAddress = (address: string): string => {
//     // Format address with line breaks for better readability
//     if (address.length > 20) {
//       const chunks = [];
//       for (let i = 0; i < address.length; i += 20) {
//         chunks.push(address.slice(i, i + 20));
//       }
//       return chunks.join('\n');
//     }
//     return address;
//   };
// 
//   if (loading) {
//     return (
//       <Screen title="Receive">
//         <View style={styles.container}>
//           <ZulipText text="Loading..." />
//         </View>
//       </Screen>
//     );
//   }
// 
//   if (walletAddress == null || walletAddress === '') {
//     return (
//       <Screen title="Receive">
//         <View style={styles.container}>
//           <ZulipText text="Unable to load wallet address" />
//           <ZulipButton
//             text="Go Back"
//             onPress={() => navigation.goBack()}
//             style={{ marginTop: 20 }}
//           />
//         </View>
//       </Screen>
//     );
//   }
// 
//   return (
//     <Screen title="Receive">
//       <View style={styles.container}>
//         <ZulipText
//           style={styles.instructions}
//           text="Share your wallet address or QR code to receive cryptocurrency payments."
//         />
// 
//         <View style={styles.qrContainer}>
//           <QRCode
//             value={walletAddress}
//             size={200}
//             backgroundColor="white"
//             color="black"
//           />
//           <ZulipText
//             text="Scan to send to this address"
//             style={styles.qrCodeTitle}
//           />
//         </View>
// 
//         <View style={styles.addressContainer}>
//           <ZulipText
//             style={styles.addressText}
//             text={formatAddress(walletAddress)}
//           />
//         </View>
// 
//         <View style={styles.buttonContainer}>
//           <ZulipButton
//             style={styles.button}
//             text="Copy Address"
//             onPress={handleCopyAddress}
//           />
//           <ZulipButton
//             style={styles.button}
//             secondary
//             text="Share"
//             onPress={handleShareAddress}
//           />
//         </View>
// 
//         <ZulipText
//           text="⚠️ Only send Ethereum and ERC-20 tokens to this address"
//           style={styles.warningText}
//         />
//       </View>
//     </Screen>
//   );
// }
// 