from base58 import b58encode

# Given byte values
byte_values = [
    80, 65, 89, 99, 115, 67, 50, 78, 97, 121, 85, 101, 77, 82, 68, 56, 113, 49, 121, 
    53, 103, 78, 65, 81, 115, 74, 70, 97, 122, 80, 68, 72, 104, 69, 122, 71, 70, 68, 
    106, 84, 80, 76, 87
]

# Convert to bytes
byte_array = bytes(byte_values)

# Encode in base58 (Solana public key format)
solana_pubkey = b58encode(byte_array).decode()

print("Solana Public Key:", solana_pubkey)
