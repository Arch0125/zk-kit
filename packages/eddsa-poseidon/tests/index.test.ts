import { babyjub, eddsa } from "circomlibjs"
import { Buffer } from "buffer"
import { crypto } from "@zk-kit/utils"
import { utils } from "ffjavascript"
import { r, packPoint } from "@zk-kit/baby-jubjub"
import {
    EdDSAPoseidon,
    derivePublicKey,
    deriveSecretScalar,
    packPublicKey,
    packSignature,
    signMessage,
    unpackPublicKey,
    unpackSignature,
    verifySignature
} from "../src"

describe("EdDSAPoseidon", () => {
    const privateKey = "secret"
    const message = BigInt(2)

    it("Should derive a public key from a private key (string)", async () => {
        const publicKey = derivePublicKey(privateKey)

        const circomlibPublicKey = eddsa.prv2pub(privateKey)

        expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
        expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
    })

    it("Should derive a public key from a private key (hexadecimal)", async () => {
        const privateKey = "0x12"

        const publicKey = derivePublicKey(privateKey)

        const circomlibPublicKey = eddsa.prv2pub(Buffer.from(privateKey.slice(2), "hex"))

        expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
        expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
    })

    it("Should derive a public key from a private key (buffer)", async () => {
        const privateKey = Buffer.from("secret")

        const publicKey = derivePublicKey(privateKey)

        const circomlibPublicKey = eddsa.prv2pub(privateKey)

        expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
        expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
    })

    it("Should derive a public key from a private key (bigint)", async () => {
        const privateKey = BigInt(22)

        const publicKey = derivePublicKey(privateKey)

        const circomlibPublicKey = eddsa.prv2pub(Buffer.from(privateKey.toString(16), "hex"))

        expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
        expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
    })

    it("Should derive a public key from a private key (number)", async () => {
        const privateKey = 22

        const publicKey = derivePublicKey(privateKey)

        const circomlibPublicKey = eddsa.prv2pub(Buffer.from(privateKey.toString(16), "hex"))

        expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
        expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
    })

    it("Should throw an error if the secret type is not supported", async () => {
        const privateKey = true

        const fun = () => derivePublicKey(privateKey as any)

        expect(fun).toThrow(`Parameter 'privateKey' is none of the following types: bignumberish, string`)
    })

    it("Should sign a message (bigint)", async () => {
        const signature = signMessage(privateKey, message)

        const circomlibSignature = eddsa.signPoseidon(privateKey, message)

        expect(signature.R8[0]).toBe(circomlibSignature.R8[0].toString())
        expect(signature.R8[1]).toBe(circomlibSignature.R8[1].toString())
        expect(signature.S).toBe(circomlibSignature.S.toString())
    })

    it("Should sign a message (number)", async () => {
        const message = 22

        const signature = signMessage(privateKey, message)

        const circomlibSignature = eddsa.signPoseidon(privateKey, BigInt(message))

        expect(signature.R8[0]).toBe(circomlibSignature.R8[0].toString())
        expect(signature.R8[1]).toBe(circomlibSignature.R8[1].toString())
        expect(signature.S).toBe(circomlibSignature.S.toString())
    })

    it("Should sign a message (hexadecimal)", async () => {
        const message = "0x12"

        const signature = signMessage(privateKey, message)

        const circomlibSignature = eddsa.signPoseidon(privateKey, BigInt(message))

        expect(signature.R8[0]).toBe(circomlibSignature.R8[0].toString())
        expect(signature.R8[1]).toBe(circomlibSignature.R8[1].toString())
        expect(signature.S).toBe(circomlibSignature.S.toString())
    })

    it("Should sign a message (buffer)", async () => {
        const message = Buffer.from("message")

        const signature = signMessage(privateKey, message)

        const circomlibSignature = eddsa.signPoseidon(privateKey, BigInt(`0x${message.toString("hex")}`))

        expect(signature.R8[0]).toBe(circomlibSignature.R8[0].toString())
        expect(signature.R8[1]).toBe(circomlibSignature.R8[1].toString())
        expect(signature.S).toBe(circomlibSignature.S.toString())
    })

    it("Should sign a message (string)", async () => {
        const message = "message"

        const signature = signMessage(privateKey, message)

        const circomlibSignature = eddsa.signPoseidon(privateKey, BigInt(`0x${Buffer.from(message).toString("hex")}`))

        expect(signature.R8[0]).toBe(circomlibSignature.R8[0].toString())
        expect(signature.R8[1]).toBe(circomlibSignature.R8[1].toString())
        expect(signature.S).toBe(circomlibSignature.S.toString())
    })

    it("Should throw an error if the message type is not supported", async () => {
        const message = true

        const fun = () => signMessage(privateKey, message as any)

        expect(fun).toThrow(`Parameter 'message' is none of the following types: bignumberish, string`)
    })

    it("Should verify a signature", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        expect(verifySignature(message, signature, publicKey)).toBeTruthy()
    })

    it("Should not verify a signature if the public key is malformed", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        publicKey[1] = 3 as any

        expect(verifySignature(message, signature, publicKey)).toBeFalsy()
    })

    it("Should not verify a signature if the signature is malformed", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        signature.S = 3 as any

        expect(verifySignature(message, signature, publicKey)).toBeFalsy()
    })

    it("Should not verify a signature if the signature is not on the curve", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        signature.R8[1] = BigInt(3).toString()

        expect(verifySignature(message, signature, publicKey)).toBeFalsy()
    })

    it("Should not verify a signature if the public key is not on the curve", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        publicKey[1] = BigInt(3).toString()

        expect(verifySignature(message, signature, publicKey)).toBeFalsy()
    })

    it("Should not verify a signature S value exceeds the predefined sub order", async () => {
        const publicKey = derivePublicKey(privateKey)
        const signature = signMessage(privateKey, message)

        signature.S = "3421888242871839275222246405745257275088614511777268538073601725287587578984328"

        expect(verifySignature(message, signature, publicKey)).toBeFalsy()
    })

    it("Should derive a public key from N random private keys", async () => {
        for (let i = 0, len = 10; i < len; i += 1) {
            const privateKey = Buffer.from(crypto.getRandomValues(32))
            const publicKey = derivePublicKey(privateKey)
            const circomlibPublicKey = eddsa.prv2pub(privateKey)

            expect(publicKey[0]).toBe(circomlibPublicKey[0].toString())
            expect(publicKey[1]).toBe(circomlibPublicKey[1].toString())
        }
    })

    it("Should pack a public key", async () => {
        const publicKey = derivePublicKey(privateKey)

        const packedPublicKey = packPublicKey(publicKey)

        const expectedPackedPublicKey = babyjub.packPoint([BigInt(publicKey[0]), BigInt(publicKey[1])])

        expect(packedPublicKey).toBe(utils.leBuff2int(expectedPackedPublicKey).toString())
    })

    it("Should not pack a public key if the public key is not on the curve", async () => {
        const publicKey = derivePublicKey(privateKey)

        publicKey[1] = BigInt(3).toString()

        const fun = () => packPublicKey(publicKey)

        expect(fun).toThrow("Invalid public key")
    })

    it("Should unpack a packed public key", async () => {
        const publicKey = derivePublicKey(privateKey)

        const packedPublicKey = packPublicKey(publicKey)
        const unpackedPublicKey = unpackPublicKey(packedPublicKey)

        expect(unpackedPublicKey[0]).toBe(publicKey[0])
        expect(unpackedPublicKey[1]).toBe(publicKey[1])
    })

    it("Should not unpack a public key if the public key type is not supported", async () => {
        const fun = () => unpackPublicKey("e")

        expect(fun).toThrow(`Parameter 'publicKey' is not a bignumber-ish`)
    })

    it("Should not unpack a public key if the public key does not correspond to a valid point on the curve", async () => {
        const invalidPublicKey = packPoint([BigInt("0"), BigInt(r + BigInt(1))]).toString()

        const fun = () => unpackPublicKey(invalidPublicKey)

        expect(fun).toThrow("Invalid public key")
    })

    it("Should pack a signature (stringified)", async () => {
        const signature = signMessage(privateKey, message)

        const packedSignature = packSignature(signature)
        expect(packedSignature).toHaveLength(64)

        const circomlibSignature = eddsa.signPoseidon(privateKey, message)
        const circomlibPackedSignature = eddsa.packSignature(circomlibSignature)

        expect(packedSignature).toEqual(circomlibPackedSignature)
    })

    // TODO(artwyman): Add test case for numericSignature after #200 lands

    it("Should still pack an incorrect signature", async () => {
        const signature = signMessage(privateKey, message)

        signature.S = "3"

        const packedSignature = packSignature(signature)
        expect(packedSignature).toHaveLength(64)
    })

    it("Should not pack a signature if the signature is not on the curve", async () => {
        const signature = signMessage(privateKey, message)

        signature.R8[1] = BigInt(3).toString()

        const fun = () => packSignature(signature)

        expect(fun).toThrow("Invalid signature")
    })

    it("Should not pack a signature S value exceeds the predefined sub order", async () => {
        const signature = signMessage(privateKey, message)

        signature.S = "3421888242871839275222246405745257275088614511777268538073601725287587578984328"

        const fun = () => packSignature(signature)

        expect(fun).toThrow("Invalid signature")
    })

    it("Should unpack a packed signature", async () => {
        const signature = signMessage(privateKey, message)

        const packedSignature = packSignature(signature)

        const unpackedSignature = unpackSignature(packedSignature)
        expect(unpackedSignature).toEqual(signature)

        const circomlibSignature = eddsa.signPoseidon(privateKey, message)
        const circomlibUnpackedSignature = eddsa.unpackSignature(packedSignature)
        expect(circomlibSignature).toEqual(circomlibUnpackedSignature)
    })

    it("Should not unpack a packed signature of the wrong length", async () => {
        const signature = signMessage(privateKey, message)

        const packedSignature = packSignature(signature)

        const fun = () => unpackSignature(packedSignature.subarray(0, 63))
        expect(fun).toThrow("Packed signature must be 64 bytes")
    })

    it("Should not unpack a packed signature with point malformed", async () => {
        const signature = signMessage(privateKey, message)

        const packedSignature = packSignature(signature)
        packedSignature.set([1], 3)

        const fun = () => unpackSignature(packedSignature)
        expect(fun).toThrow("Invalid packed signature point")
    })

    it("Should still unpack a packed signature with scalar malformed", async () => {
        const signature = signMessage(privateKey, message)

        const packedSignature = packSignature(signature)
        packedSignature.set([1], 35)

        unpackSignature(packedSignature)
    })

    it("Should create an EdDSAPoseidon instance", async () => {
        const eddsa = new EdDSAPoseidon(privateKey)

        const signature = eddsa.signMessage(message)

        expect(eddsa.secretScalar).toBe(deriveSecretScalar(privateKey))
        expect(eddsa.packedPublicKey).toBe(packPublicKey(eddsa.publicKey))
        expect(eddsa.verifySignature(message, signature)).toBeTruthy()
    })

    it("Should create an EdDSAPoseidon instance with a random private key", async () => {
        const eddsa = new EdDSAPoseidon()

        const signature = eddsa.signMessage(message)

        expect(eddsa.privateKey).toBeInstanceOf(Buffer)
        expect(eddsa.privateKey).toHaveLength(32)
        expect(eddsa.secretScalar).toBe(deriveSecretScalar(eddsa.privateKey))
        expect(eddsa.packedPublicKey).toBe(packPublicKey(eddsa.publicKey))
        expect(eddsa.verifySignature(message, signature)).toBeTruthy()
    })
})
