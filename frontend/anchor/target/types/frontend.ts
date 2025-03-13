/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/frontend.json`.
 */
export type Frontend = {
  "address": "5V9gDAvbC4Hy75b4YvdG9BMNyBrT1m3seMWaypxUxp85",
  "metadata": {
    "name": "frontend",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeContract",
      "discriminator": [
        37,
        244,
        34,
        168,
        92,
        202,
        80,
        106
      ],
      "accounts": [
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "contract"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createContract",
      "discriminator": [
        244,
        48,
        244,
        178,
        216,
        88,
        122,
        52
      ],
      "accounts": [
        {
          "name": "contract",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "totalAmount",
          "type": "u64"
        },
        {
          "name": "trancheCount",
          "type": "u64"
        },
        {
          "name": "recipients",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "distributeTranche",
      "discriminator": [
        4,
        101,
        117,
        116,
        122,
        242,
        211,
        91
      ],
      "accounts": [
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "paymentContract",
      "discriminator": [
        151,
        55,
        24,
        165,
        12,
        206,
        38,
        31
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "allTranchesPaid",
      "msg": "All tranches have been paid"
    },
    {
      "code": 6001,
      "name": "invalidRecipient",
      "msg": "Invalid recipient for current tranche"
    },
    {
      "code": 6002,
      "name": "invalidRecipientsCount",
      "msg": "Number of recipients must match tranche count"
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Total amount must be greater than 0"
    },
    {
      "code": 6004,
      "name": "invalidTrancheCount",
      "msg": "Tranche count must be greater than 0"
    },
    {
      "code": 6005,
      "name": "invalidSigner",
      "msg": "Invalid signer - must be owner or authorized wallet"
    }
  ],
  "types": [
    {
      "name": "paymentContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "trancheCount",
            "type": "u64"
          },
          {
            "name": "recipients",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "paidTranches",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
