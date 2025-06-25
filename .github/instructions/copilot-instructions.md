# General Guidelines
-   We are working in a fork of an existing mobile application (zulip mobile).
-   All of our code is in `src/tandapay`. We do not modify code outside of this
    directory except when absolutely necessary (e.g., modifying
    `AppNavigator.js` to add more screens).
-   We use `src/tandapay/errors` for our error handling utilities. When writing
    new code, ensure that you're using the error handling utilities,
    especially when calling APIs, `ethers.js` functions, or any network calls.
-   We store state using Redux; TandaPay-specific state can be found in
    `src/tandapay/redux`.
-   This is a Web3 application. We use `ethers.js v5`, and you also have
    access to `alchemy-sdk`.
-   We use `expo-secure-store` for storage/retrieval of any API keys as well
    as wallet information (e.g., the mnemonic phrase).
-   This application has a simple, built-in Ethereum wallet which lets the
    user send/receive the default token (ETH on most chains, but can be
    different such as POL on Polygon) as well as ERC20 tokens.
-   This application supports a few ERC20 tokens by default (DAI, USDC, USDT)
    and a few networks by default (mainnet, Arbitrum, Sepolia, Polygon) -- but
    the user can configure custom RPC settings and add custom tokens. Settings
    are persistent using Redux; custom tokens are per-network.
-   The primary purpose of our code is to bundle all of the functionality
    necessary to use the TandaPay smart contract. The TandaPay smart contract
    related code is mostly in `src/tandapay/contract`, with
    `src/tandapay/contract/TandaPay.js` containing the actual Solidity build
    artifact. The build artifact is exported as an object `TandaPayInfo`, and
    we access the ABI with `TandaPayInfo.abi` and the bytecode with
    `TandaPayInfo.bytecode.object`.
-   Various components are available in `src/tandapay/components`, as well as
    in the broader codebase. We frequently use components like `ZulipButton`
    and `ZulipText` because they have built-in styling consistent with the rest
    of the app.
-   Lots of our styling is stored in `src/tandapay/styles` -- here, you can get
    various colors, as well as styles for certain components. There are also
    global constants like `HALF_COLOR`, `QUARTER_COLOR`, and `BRAND_COLOR`
    which come from `src/styles/constants.js`.
-   Avoid using any mock data, hardcoded API keys, or other rigid things. The
    goal here is to make a production app. There are situations where a
    placeholder may be used, but we only keep it temporarily.
-   There are various `.md` files throughout `src/tandapay`. Many of these
    might be outdated, so you can use them to get context, but beware that they
    might not be fully up to date.
-   The TandaPay contract can be deployed directly from within the app. We don't
    hardcode the contract address because users will be part of a community, and
    each community has its own deployment. Not all users will deploy a contract,
    but all contracts will be deployed by our users, and thus they can
    configure the contract address in the `TandaPayNetworkSettingsScreen`.
-   There is NO FLOW SCRIPT. Flow has an IDE integration; you have access to see
    problems within any file you view, so any Flow errors will just be listed as
    problems. Do not run `npm run flow` or any similar commands because it will
    NOT work.
-   Always style `ZulipButton` with `style={TandaPayStyles.button}`, and wrap
    it in `<View style={TandaPayStyles.buttonRow}>` to ensure proper styling.
    Only ever have 1 or 2 `ZulipButton`s in a single row. You can find these
    styles at `src/tandapay/styles`.

# Styling and Component Best Practices

These principles guide our approach to styling and component design, aiming for
maintainability, consistency, and reusability.

1.  **DRY Principle for Styles:** Identify and extract similar or duplicate
    styles across stylesheets to avoid redundancy.
2.  **Component Extraction:** Look for opportunities to extract reusable
    components into `src/tandapay/components`, especially when common UI
    elements (like `closeButton` or similar patterns) are replicated across
    different parts of the application. Prioritize styles that are most
    commonly used or simpler when combining similar components.
3.  **Separate Themed Styles:** When styles depend on `themeData` (e.g.,
    `themeData.color` or `themeData.dividerColor`), extract these styles out of
    their functions and wrap them in `StyleSheet.create`. Replace
    `themeData.dividerColor` with `QUARTER_COLOR` or `HALF_COLOR` where
    appropriate. For foreground colors, use array syntax to combine styles:
    `styles={[ourStyleSheet, {color: themeData.color}]}`.
4.  **Centralize Global Styles:** Styles that can be shared across multiple
    components should be moved to `src/tandapay/styles`. Styles that are
    tightly coupled to an individual component can remain within that component's
    file.
5.  **`StyleSheet.create` Usage:** All stylesheets should be wrapped in
    `StyleSheet.create` for performance optimization and improved error
    handling.
6.  **Array Syntax for Style Merging:** Replace spread operators for inline
    styles (e.g., `styles={{...someStyleSheet, someProp}}`) with array syntax
    (e.g., `styles={[someStyleSheet, {someProp}]}`). This is more performant,
    especially with cached stylesheets.
7.  **Granular Stylesheets:** If a component has both general, reusable styling
    and specific, component-only styling, separate them into two distinct
    stylesheets. Move the general styles to `src/tandapay/styles` and keep
    the specific styles with the component. Use array syntax to combine them
    when applying.
8.  **Consolidate Similar Components:** When two similar components are used in
    different places, consider extracting them into a single, generic component
    in `src/tandapay/components` to reduce duplication and simplify maintenance.
9.  **Prefer Stylesheet Over Inline Styles:** Replace inline styles in
    components with styles defined in stylesheets to maintain consistency and
    ease future style modifications. The only exception is when an inline style
    is truly dynamic and depends on a state value like `themeData`, in which case
    array syntax should be used.