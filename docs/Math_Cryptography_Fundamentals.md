# Bitcoin Math & Cryptography Fundamentals

# 1. Finite fields

A finite field (𝔽ₚ) is a set of numbers {0, 1, 2, ..., p-1} where arithmetic operations wrap around using modulo p, a prime number: ensures numbers never grow too large, allows cryptographic operations to be fast and efficient, provides a structured, predictable mathematical system.

# 2. Elliptic Curves: The Structure for Bitcoin Keys

An elliptic curve is a set of points that satisfy the equation y² = x³ + ax + b. Bitcoin uses a special curve called Secp256k1, defined as y² = x³ + 7 mod p.


## Why Elliptic Curves Matter in Bitcoin
Elliptic curve cryptography (ECC) provides a secure and efficient way to generate and verify cryptographic keys. Bitcoin specifically uses the **Secp256k1** curve due to its efficiency and strong security properties.

| Concept                     | Why It’s Important                      | Example                                | Explanation |
| --------------------------- | --------------------------------------- | -------------------------------------- |-------------|
| **Elliptic Curve Equation** | Defines Bitcoin’s public keys           | y² = x³ + 7 mod p                      | This equation defines the Secp256k1 curve used in Bitcoin. Any valid public key is a point (x, y) that satisfies this equation. |
| **Valid Points**            | Public keys must be valid points        | (2,1) satisfies y² = x³ + 2x + 3 mod 7 | A valid public key must be a point on the elliptic curve. If (x, y) doesn't satisfy the equation, it's not a valid key. |
| **Point Addition**          | Basis of ECC multiplication             | (3,6) + (5,1) = (1,0)                  | Adding two points on the curve involves drawing a line through them, which intersects the curve at a third point that is reflected over the x-axis to get the sum. This fundamental operation underpins elliptic curve multiplication, ensuring secure key generation in Bitcoin. |
| **Scalar Multiplication**   | Generates public keys from private keys | P = d × G                              | The private key is a random number d. The public key is calculated by multiplying d with a special point G on the curve. This process is easy to compute but infeasible to reverse, ensuring security. G is a fixed generator point defined by the Secp256k1 standard, ensuring interoperability and security.|

| Concept                     | Explanation |
|-----------------------------|------------------------------------------------------------------|
| **What is G?**              | G is the generator point of the Secp256k1 curve, a predefined fixed point used as the starting value for key generation in Bitcoin. |
| **How is G Chosen?**        | G is explicitly defined in the SEC2 standard and is a known point (x, y) that lies on the Secp256k1 curve. It is chosen for its large prime order and cryptographic properties. |
| **Public Key Generation**   | A public key in elliptic curve cryptography (used in Bitcoin) is derived by multiplying the private key (a random scalar d) with G. |
| **Why Not a Random G?**     | Using a fixed G ensures that all Bitcoin implementations use the same base point, making verification and key derivation consistent across different wallets and nodes. |
| **Controversy Around a Fixed G**  | Some cryptographers argue that a fixed generator point could introduce hidden vulnerabilities if it were secretly chosen with malicious intent. However, Secp256k1's G was defined transparently in the SEC2 standard, avoiding the concerns raised about other curves that rely on unexplained parameters. |

You can find the G (Generator Point) value for Secp256k1 in the official SEC2 standard document:

🔗 SEC2: Recommended Elliptic Curve Domain Parameters
(Page 15 contains the full definition of Secp256k1, including G)

Alternatively, you can also check:

🔗 Bitcoin Wiki - Secp256k1 (Explains the curve parameters including G)
🔗 secp256k1 GitHub Repo (Implementation of Secp256k1 used in Bitcoin)

## Key Takeaways for Future Reference
- **Bitcoin’s Security**: ECC ensures public keys are derived securely from private keys, making them infeasible to reverse-engineer.
- **Mathematical Foundations**: Bitcoin's cryptography relies on finite fields and modular arithmetic.
- **Secp256k1 Curve Choice**: Unlike other curves, Secp256k1 lacks unnecessary security parameters, making it more efficient.
- **Point Addition & Multiplication**: These fundamental operations allow key generation and transaction verification in Bitcoin.
