"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
// Copyright 2017-2022 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0
// structs need to be in order

/* eslint-disable sort-keys */
const definitions = {
  types: [{
    // on all versions
    minmax: [0, 2],
    types: {
      LookupSource: 'MultiAddress',
      Address: 'MultiAddress',
      AccountInfo: 'AccountInfoWithDualRefCount',
      FullIdentification: 'AccountId',
      AuthorityState: {
        _enum: ['Working', 'Waiting']
      },
      EraIndex: 'u32',
      ActiveEraInfo: {
        index: 'EraIndex',
        start: 'Option<u64>'
      },
      UnappliedSlash: {
        validator: 'AccountId',
        reporters: 'Vec<AccountId>'
      }
    }
  }, {
    // on all versions
    minmax: [3, undefined],
    types: {
      LookupSource: 'MultiAddress',
      Address: 'MultiAddress',
      AccountInfo: 'AccountInfoWithTripleRefCount',
      AliveContractInfo: {
        trieId: 'TrieId',
        storageSize: 'u32',
        pairCount: 'u32',
        codeHash: 'CodeHash',
        rentAllowance: 'Balance',
        rentPayed: 'Balance',
        deductBlock: 'BlockNumber',
        lastWrite: 'Option<BlockNumber>',
        _reserved: 'Option<Null>'
      },
      FullIdentification: 'AccountId',
      AuthorityState: {
        _enum: ['Working', 'Waiting']
      },
      EraIndex: 'u32',
      ActiveEraInfo: {
        index: 'EraIndex',
        start: 'Option<u64>'
      },
      UnappliedSlash: {
        validator: 'AccountId',
        reporters: 'Vec<AccountId>'
      }
    }
  }]
};
var _default = definitions;
exports.default = _default;