# TandaPay Mobile
TandaPay mobile is a mobile application with a rich web3 integration for interacting with the TandaPay smart contract and organizing communities that use the TandaPay protocol.

TandaPay mobile is built on top of Zulip Mobile, a free and open source chat application that uses a federated deployment approach and works similarly to slack. Zulip has excellent features for communication and community organization, and adding a TandaPay integration to it serves to be an ideal application and one-stop-shop for communication, community organization, and web3 interactions.

Features of TandaPay Mobile include:
- [x] A custom built-in ethereum wallet:
  - [x] can send/receive ethereum or any ERC-20 token, including a "MAX" button to transfer all funds that is gas-price aware
  - [x] can estimate gas prices and display the potential transaction fees to the user with EIP 1559
  - [x] supports QR code generation for receiving funds as well as QR code scanning for sending funds
  - [x] supports any ERC-20 token, with a few default options (USDC, USDT, DAI) + user-defined custom tokens
  - [x] supports any EVM compatible network, with a few defaults (mainnet, arbitrum, polygon) + user-defined custom rpc networks
  - [x] supports chronological transaction history including ERC20 token transfers
  - [x] supports securely generating new wallet mnemonic or importing existing ones
  - [x] supports detailed transaction information and block explorer integrations
  - [x] can be configured with an Alchemy API key (free to obtain) for enhanced transaction data and better performance 
  - [x] if an alchemy api key is provided, RPC urls will fall back to alchemy endpoints for better performance
  - [x] has a built-in integration with TandaPay so that TandaPay contract transactions show up in a user friendly manner
- [x] Configurable Network Settings:
  - [x] Can select which network you want to use among the defaults (ethereum, polygon, arbitrum), with sane default RPC providers that allow free use with no API key with rate limits that are generous enough for this use case.
  - [x] Can create a custom RPC configuration to connect to any provider or use a URL with an api-key for higher rate limits
  - [x] Can deploy the TandaPay contract or specify the address of it
  - [x] supports configuration of network performance settings
    - [x] can set a cache expiration time for cached data
    - [x] can configure delays to avoid exceeding rate limits
    - [x] can configure the number of retry attempts for graceful error handling if a network call fails
  - [x] displays information about the current network configuration
- [x] Configurable user-defined ERC-20 tokens:
  - [x] can specify custom token symbols, contract addresses, token names, and decimal counts
  - [x] shows what tokens are already configured and allows the user to copy their addresses
- [x] A rich TandaPay information display, with all of the information required to interact with the smart contract
- [x] A comprehensive dashboard for sending any transaction to the TandaPay smart contract
- [x] Heuristic guidance to suggest potentially relevant transactions to users and help them filter transactions for the ones that they are most likely to use to interact with the TandaPay smart contract, given it's current state
- [x] Macros to help users send sequences of transactions and reduce tedium when doing multi-step smart contract interactions
  - [x] Auto reorganize all members into valid subgroups workflow
  - [x] Adding required number of members to exit initialization state workflow
  - [x] Defining secretary successors workflow
  - [x] intelligent default state initialization macro
  - [x] exiting the initialization state workflow (chained macro)
- [ ] a refined user onboarding experience using the existing server infrastructure, but with modifications to make sign-up go more smoothly within TandaPay mobile's application


# Original Zulip Readme:

## Zulip Mobile

[![CI](https://github.com/zulip/zulip-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/zulip/zulip-mobile/actions/workflows/ci.yml?query=branch%3Amain)
[![Zulip chat](https://img.shields.io/badge/zulip-join_chat-brightgreen.svg)](https://chat.zulip.org/#narrow/stream/mobile)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zulip/zulip-mobile/blob/main/CONTRIBUTING.md)

Zulip Mobile is the official mobile Zulip client, supporting both iOS
and Android.


### Get the app

Release versions of the app are available here:
* [Zulip for iOS](https://itunes.apple.com/app/zulip/id1203036395)
  on the iTunes App Store
* [Zulip for Android](https://play.google.com/store/apps/details?id=com.zulipmobile)
  on the Google Play Store
  * Or if you don't use Google Play, you can [download an
    APK](https://github.com/zulip/zulip-mobile/releases/latest)
    from the official build we post on GitHub, or get the app
    [on F-Droid](https://f-droid.org/packages/com.zulipmobile/).

You can also help out by [running beta versions](#using-the-beta) of
the app, and reporting bugs!


### Maintenance mode

This codebase built on React Native is a **legacy app, which is in
maintenance mode** as we [focus on building][zulip-flutter-beta]
a [new Zulip mobile app with Flutter][zulip-flutter].
This means:

 * This repository is the source code of the app we're still
   distributing and recommending for most users, until the new app is
   fully built and ready to replace it.

 * Feedback is still welcome.  Some bugs and feature requests will be
   naturally resolved by the new app; others won't, and we'll transfer
   them over when the time comes as issues on the new app.  We're
   happy to do the work of identifying which is which — it's usually
   easy for us, given the time we've spent in both codebases.

 * The development work we do in this repo is kept to a minimum: we
   fix critical bugs, and we add support for a few of the new features
   being added to Zulip on the web and desktop, those where the
   leverage from mobile support is highest.

 * We aren't able to spend significant time investigating other bugs,
   or reviewing PRs from contributors.  We're investing that time
   instead in getting the new Flutter app finished and into all our
   users' hands as soon as possible.

[zulip-flutter-beta]: https://chat.zulip.org/#narrow/stream/2-general/topic/Flutter/near/1582367
[zulip-flutter]: https://github.com/zulip/zulip-flutter


### Contributing (old)

If you're interested in contributing to Zulip's mobile apps,
see [the new Flutter-based app][zulip-flutter].

Details below are from when this app was in active development.
Some details may still be useful, but **bear in mind that this
app is in maintenance mode** as described above.


#### Discussion

To get involved in Zulip Mobile development, please join us on
[the Zulip community Zulip server][czo-doc], in the
[#mobile-dev-help][czo-mobile-dev-help] channel.  Come say hello, discuss areas to
work on, and ask and answer questions.

Bug reports and feedback from using the app are welcome.
For those, please use the [#mobile][czo-mobile] channel;
that helps a wider set of Zulip contributors see your feedback.

[czo-mobile-dev-help]: https://chat.zulip.org/#narrow/stream/516-mobile-dev-help
[czo-mobile]: https://chat.zulip.org/#narrow/stream/48-mobile
[czo-doc]: https://zulip.readthedocs.io/en/latest/contributing/chat-zulip-org.html


#### Using the beta

One important way to contribute is to run beta versions of the app, and report
bugs!  To get the beta:

* Android: install the app, then just
  [join the testing program](https://play.google.com/apps/testing/com.zulipmobile/)
  on Google Play.
  * Or if you don't use Google Play, you can [download an
    APK](https://github.com/zulip/zulip-mobile/releases/); the latest
    release on GitHub (including "pre-releases") is the current beta.
* iOS: install [TestFlight](https://developer.apple.com/testflight/testers/),
  then open [this public invitation link](https://testflight.apple.com/join/ZuzqwXGf)
  on your device.

Bug reports are welcome either in [the #mobile stream](#discussion) or
on this GitHub repo.


#### Development

Zulip Mobile is written in JavaScript with React Native.  To get
started with the code, follow this doc:

* [Developer Guide](docs/developer-guide.md)

Then see our [Contribution Guidelines](CONTRIBUTING.md), and come say
hello in [the #mobile-dev-help stream](#discussion).

For more reading, take a look at our [developer docs](docs/).


#### History

Zulip Mobile supersedes two legacy Zulip apps,
[zulip-ios](https://github.com/zulip/zulip-ios-legacy) and
[zulip-android](https://github.com/zulip/zulip-android)
([more history](https://github.com/zulip/zulip-android/blob/master/android-strategy.md)).


### License

Copyright (c) 2016-2024 Kandra Labs, Inc., and contributors, and 2016 Dropbox, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

The software includes some works released by third parties under other
free and open source licenses. Those works are redistributed under the
license terms under which the works were received.
