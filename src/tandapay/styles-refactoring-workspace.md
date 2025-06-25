# List of files to check (check off visited files)
- [x] src/tandapay/components/AddressArrayInput.js
- [x] src/tandapay/components/AddressInput.js
- [x] src/tandapay/components/AmountInput.js
- [x] src/tandapay/components/BooleanToggle.js
- [x] src/tandapay/components/Card.js
- [x] src/tandapay/components/ContractAddressConfiguration.js
- [x] src/tandapay/components/ContractDeploymentModal.js
- [x] src/tandapay/components/CustomRpcForm.js
- [x] src/tandapay/components/index.js
- [x] src/tandapay/components/ModalContainer.js
- [x] src/tandapay/components/NetworkInfo.js
- [x] src/tandapay/components/NetworkPerformanceSettings.js
- [x] src/tandapay/components/NetworkSelector.js
- [x] src/tandapay/components/NumberInput.js
- [x] src/tandapay/components/ScrollableTextBox.js
- [x] src/tandapay/components/TandaPayBanner.js
- [x] src/tandapay/components/TandaRibbon.js
- [x] src/tandapay/components/TokenPicker.js
- [x] src/tandapay/components/TransactionEstimateAndSend.js
- [x] src/tandapay/components/TransactionModal.js
- [x] src/tandapay/components/TransactionParameterForm.js
- [x] src/tandapay/components/WalletNetworkInfo.js
- [x] src/tandapay/config/TandaPayConfig.js
- [x] src/tandapay/contract/communityInfo.js
- [x] src/tandapay/contract/multicall.js
- [x] src/tandapay/contract/read.js
- [x] src/tandapay/contract/types.js
- [x] src/tandapay/contract/write.js
- [x] src/tandapay/contract/writeTransactionObjects.js
- [x] src/tandapay/definitions/index.js
- [x] src/tandapay/definitions/types.js
- [x] src/tandapay/errors/ErrorHandler.js
- [x] src/tandapay/errors/types.js
- [x] src/tandapay/hooks/useBalanceInvalidation.js
- [x] src/tandapay/hooks/useNetworkPerformanceSettings.js
- [x] src/tandapay/hooks/useNetworkSettings.js
- [x] src/tandapay/hooks/useTransactionForm.js
- [x] src/tandapay/providers/ProviderManager.js
- [x] src/tandapay/redux/actions.js
- [x] src/tandapay/redux/index.js
- [x] src/tandapay/redux/reducer.js
- [x] src/tandapay/redux/reducers/settingsReducer.js
- [x] src/tandapay/redux/reducers/tokensReducer.js
- [x] src/tandapay/redux/selectors.js
- [x] src/tandapay/services/ContractInstanceManager.js
- [x] src/tandapay/stateValidation.js
- [x] src/tandapay/TandaPayActionsScreen.js
- [x] src/tandapay/TandaPayInfoScreen.js
- [x] src/tandapay/TandaPayMenuScreen.js
- [x] src/tandapay/TandaPayNetworkSettingsScreen.js
- [x] src/tandapay/TandaPaySettingsScreen.js
- [x] src/tandapay/tokens/tokenConfig.js
- [x] src/tandapay/tokens/TokenManagementScreen.js
- [x] src/tandapay/tokens/tokenSelectors.js
- [x] src/tandapay/tokens/tokenTypes.js
- [x] src/tandapay/validation/index.js
- [x] src/tandapay/wallet/AlchemyTransferFetcher.js
- [x] src/tandapay/wallet/ChronologicalTransferManager.js
- [x] src/tandapay/wallet/components/ApiKeyCard.js
- [x] src/tandapay/wallet/ExplorerUtils.js
- [x] src/tandapay/wallet/hooks/useUpdateBalance.js
- [x] src/tandapay/wallet/TransactionDetailsFetcher.js
- [x] src/tandapay/wallet/TransactionDetailsModal.js
- [x] src/tandapay/wallet/TransactionFormatter.js
- [x] src/tandapay/wallet/TransactionList.js
- [x] src/tandapay/wallet/TransactionUtils.js
- [x] src/tandapay/wallet/useTransactionHistory.js
- [x] src/tandapay/wallet/WalletBalanceCard.js
- [x] src/tandapay/wallet/WalletManager.js
- [x] src/tandapay/wallet/WalletReceiveScreen.js
- [x] src/tandapay/wallet/WalletScreen.js
- [x] src/tandapay/wallet/WalletSendScreen.js
- [x] src/tandapay/wallet/WalletSettingsScreen.js
- [x] src/tandapay/wallet/wallet-setup/components/VerificationRow.js
- [x] src/tandapay/wallet/wallet-setup/components/VerificationSection.js
- [x] src/tandapay/wallet/wallet-setup/components/WordChip.js
- [x] src/tandapay/wallet/wallet-setup/components/WordGrid.js
- [x] src/tandapay/wallet/wallet-setup/hooks/useWordSelection.js
- [x] src/tandapay/wallet/wallet-setup/WalletGenerateScreen.js
- [x] src/tandapay/wallet/wallet-setup/WalletImportScreen.js
- [x] src/tandapay/wallet/wallet-setup/WalletSetupScreen.js
- [x] src/tandapay/wallet/wallet-setup/WalletVerifyScreen.js
- [x] src/tandapay/web3.js

# Style Sheets
<!-- you will just append each one here using the provided template -->

```
// File: src/tandapay/components/AddressArrayInput.js
const customStyles = {
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    ...TandaPayTypography.label,
  },
  description: {
    ...TandaPayTypography.description,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 12,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressContainer: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: TandaPayColors.error,
  },
  removeIcon: {
    color: TandaPayColors.white,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyText: {
    ...TandaPayTypography.description,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
  disabledContainer: {
    opacity: 0.6,
  },
};
```

```
// File: src/tandapay/components/AddressInput.js
const customStyles = {
  qrButtonIcon: {
    color: TandaPayColors.white,
  },
  errorText: {
    ...TandaPayTypography.error,
    color: TandaPayColors.error,
  },
  scannerModal: {
    flex: 1,
    backgroundColor: TandaPayColors.black,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  permissionText: {
    color: TandaPayColors.white,
    textAlign: 'center',
    marginHorizontal: 20,
    fontSize: 16,
  },
};
```
// File: src/tandapay/components/AmountInput.js
const customStyles = {
  errorText: {
    ...TandaPayTypography.error,
    color: TandaPayColors.error,
  },
};
```
// File: src/tandapay/components/BooleanToggle.js
const customStyles = {
  container: {
    marginBottom: 16,
    borderRadius: 16,
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
```
// File: src/tandapay/components/Card.js
// No stylesheet in this file. Styles are inline.

// File: src/tandapay/components/ContractAddressConfiguration.js
const customStyles = {
  card: {
    marginBottom: 16,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 8,
  },
  description: {
    ...TandaPayTypography.body,
    color: TandaPayColors.disabled,
    marginBottom: 16,
  },
  networkLabel: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
};
// File: src/tandapay/components/ContractDeploymentModal.js
const styles = {
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeData.dividerColor,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeData.color,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: QUARTER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: themeData.color,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  disclaimer: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.warning,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  estimateSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: TandaPayColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TandaPayColors.subtle,
  },
  estimateTitle: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  estimateValue: {
    ...TandaPayTypography.body,
    fontWeight: 'bold',
  },
  errorText: {
    ...TandaPayTypography.body,
    color: TandaPayColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    ...TandaPayTypography.body,
    marginTop: 8,
  },
  gasLimitHelper: {
    ...TandaPayTypography.caption,
    color: TandaPayColors.disabled,
    marginTop: 4,
    fontStyle: 'italic',
  },
};
// File: src/tandapay/components/CustomRpcForm.js
// No local stylesheet in this file. Uses TandaPayStyles and inline styles.

// File: src/tandapay/components/index.js
// No styles in this file.

// File: src/tandapay/components/ModalContainer.js
const customStyles = {
  container: {
    flex: 1,
    backgroundColor: TandaPayColors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TandaPayColors.subtle,
  },
  title: {
    ...TandaPayTypography.sectionTitle,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...TandaPayTypography.body,
    color: TandaPayColors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
};
// File: src/tandapay/components/NetworkInfo.js
// No local stylesheet in this file. Uses TandaPayStyles.
// File: src/tandapay/components/NetworkPerformanceSettings.js
const customStyles = {
  currentValuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 12,
    marginBottom: 4,
  },
};
// File: src/tandapay/components/NetworkSelector.js
// No styles in this file.
// File: src/tandapay/components/NumberInput.js
const customStyles = {
  container: {
    marginBottom: 16,
  },
  errorText: {
    ...TandaPayTypography.description,
    color: TandaPayColors.error,
    fontSize: 12,
    marginTop: 4,
  },
};
// File: src/tandapay/components/ScrollableTextBox.js
const styles = {
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
    width: '100%',
  },
  scrollContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingRight: 36, // Make room for copy icon
    height: 50, // Increased height for better visibility
  },
  scrollableText: {
    fontSize: 14,
    paddingVertical: 12,
    paddingLeft: 12,
    marginRight: 4,
  },
  copyButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  copyButtonIcon: {
    color: TandaPayColors.white,
  },
};
// File: src/tandapay/components/TandaPayBanner.js
const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: HALF_COLOR,
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 10,
  },
  textRow: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  text: {
    color: 'white',
    fontSize: 13,
    flex: 1,
    paddingRight: 8,
    paddingLeft: 0,
    textAlignVertical: 'center',
  },
  button: {
    flexDirection: 'row',
    flexShrink: 0,
    paddingVertical: 10,
  },
});
// File: src/tandapay/components/TandaRibbon.js
// No styles in this file.
// File: src/tandapay/components/TokenPicker.js
const customStyles = {
  pickerContainer: {
    marginBottom: 16,
  },
  cardContainer: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: HIGHLIGHT_COLOR,
  },
  cardDisabled: {
    backgroundColor: TandaPayColors.disabled,
    opacity: 0.5,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  pickerText: {
    ...TandaPayTypography.body,
    fontWeight: 'bold',
  },
  pickerPlaceholder: {
    ...TandaPayTypography.body,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TandaPayColors.overlay,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 16,
    textAlign: 'center',
  },
  tokenItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TandaPayColors.subtle,
  },
  tokenName: {
    ...TandaPayTypography.body,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tokenSymbol: {
    ...TandaPayTypography.description,
    marginBottom: 2,
  },
  tokenAddress: {
    ...TandaPayTypography.caption,
    fontFamily: 'monospace',
  },
  buttonRow: {
    marginTop: 16,
  },
  button: {
    width: '100%',
  },
};
// File: src/tandapay/components/TransactionEstimateAndSend.js
const customStyles = {
  container: {
    marginTop: 16,
  },
  gasEstimateTitle: {
    ...TandaPayTypography.sectionTitle,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...TandaPayTypography.label,
  },
  sendButton: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    ...TandaPayTypography.body,
    marginTop: 8,
    textAlign: 'center',
  },
};
// File: src/tandapay/components/TransactionModal.js
const styles = {
  overlay: {
    flex: 1,
    backgroundColor: TandaPayColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeData.dividerColor,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeData.color,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: QUARTER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
};
// File: src/tandapay/components/TransactionParameterForm.js
const styles = {
  container: {
    marginVertical: 16,
  },
  parametersContainer: {
    marginTop: 8,
  },
  parameterContainer: {
    marginBottom: 16,
  },
  parameterLabel: {
    ...TandaPayTypography.label,
    marginBottom: 8,
  },
  parameterDescription: {
    ...TandaPayTypography.description,
    fontSize: 12,
    marginBottom: 8,
  },
  errorText: {
    ...TandaPayTypography.body,
    color: TandaPayColors.error,
    fontSize: 12,
    marginTop: 4,
  },
};
// File: src/tandapay/components/WalletNetworkInfo.js
const customStyles = {
  networkName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  networkDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
};

// File: src/tandapay/config/TandaPayConfig.js
// No styles in this file.
// File: src/tandapay/contract/communityInfo.js
// No styles in this file.
// File: src/tandapay/contract/multicall.js
// No styles in this file.
// File: src/tandapay/contract/read.js
// No styles in this file.
// File: src/tandapay/contract/types.js
// No styles in this file.
// File: src/tandapay/contract/write.js
// No styles in this file.
// File: src/tandapay/contract/writeTransactionObjects.js
// No styles in this file.
// File: src/tandapay/definitions/index.js
// No styles in this file.
// File: src/tandapay/definitions/types.js
// No styles in this file.
// File: src/tandapay/errors/ErrorHandler.js
// No styles in this file.
// File: src/tandapay/errors/types.js
// No styles in this file.
// File: src/tandapay/hooks/useBalanceInvalidation.js
// No styles in this file.
// File: src/tandapay/hooks/useNetworkPerformanceSettings.js
// No styles in this file.
// File: src/tandapay/hooks/useNetworkSettings.js
// No styles in this file.
// File: src/tandapay/hooks/useTransactionForm.js
// No styles in this file.
// File: src/tandapay/providers/ProviderManager.js
// No styles in this file.
// File: src/tandapay/redux/actions.js
// No styles in this file.
// File: src/tandapay/redux/index.js
// No styles in this file.
// File: src/tandapay/redux/reducer.js
// No styles in this file.
// File: src/tandapay/redux/reducers/settingsReducer.js
// No styles in this file.
// File: src/tandapay/redux/reducers/tokensReducer.js
// No styles in this file.
// File: src/tandapay/redux/selectors.js
// No styles in this file.
// File: src/tandapay/services/ContractInstanceManager.js
// No styles in this file.
// File: src/tandapay/stateValidation.js
// No styles in this file.
// File: src/tandapay/TandaPayActionsScreen.js
// No styles in this file.
// File: src/tandapay/TandaPayInfoScreen.js
// No styles in this file.
// File: src/tandapay/TandaPayMenuScreen.js
// No styles in this file. (Contains commented out stylesheet)
// File: src/tandapay/TandaPayNetworkSettingsScreen.js
// No styles in this file.
// File: src/tandapay/TandaPaySettingsScreen.js
// No styles in this file.
// File: src/tandapay/tokens/tokenConfig.js
// No styles in this file.
// File: src/tandapay/tokens/tokenSelectors.js
// No styles in this file.
// File: src/tandapay/tokens/tokenTypes.js
// No styles in this file.
// File: src/tandapay/validation/index.js
// No styles in this file.
// File: src/tandapay/wallet/AlchemyTransferFetcher.js
// No styles in this file.
// File: src/tandapay/wallet/ChronologicalTransferManager.js
// No styles in this file.
// File: src/tandapay/wallet/components/ApiKeyCard.js
// No styles in this file.
// File: src/tandapay/wallet/ExplorerUtils.js
// No styles in this file.
// File: src/tandapay/wallet/hooks/useUpdateBalance.js
// No styles in this file.
// File: src/tandapay/wallet/TransactionDetailsFetcher.js
// No styles in this file.
// File: src/tandapay/wallet/TransactionFormatter.js
// No styles in this file.
// File: src/tandapay/wallet/TransactionList.js
// No styles in this file.
// File: src/tandapay/wallet/TransactionUtils.js
// No styles in this file.
// File: src/tandapay/wallet/useTransactionHistory.js
// No styles in this file.
// File: src/tandapay/wallet/WalletManager.js
// No styles in this file.
// File: src/tandapay/wallet/WalletReceiveScreen.js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  address: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
```

```
// File: src/tandapay/wallet/WalletScreen.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/WalletSendScreen.js
const customStyles = {
  container: {
    flex: 1,
    padding: 16,
  },
  tokenInfo: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  estimateContainer: {
    marginTop: 16,
  },
};
```

```
// File: src/tandapay/wallet/WalletSettingsScreen.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/components/VerificationRow.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/components/VerificationSection.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/components/WordChip.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/components/WordGrid.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/hooks/useWordSelection.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/WalletGenerateScreen.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/WalletImportScreen.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/WalletSetupScreen.js
// No styles in this file.
```

```
// File: src/tandapay/wallet/wallet-setup/WalletVerifyScreen.js
// No styles in this file.
```

```
// File: src/tandapay/web3.js
// No styles in this file.
```