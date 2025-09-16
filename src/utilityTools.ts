import algosdk from 'algosdk';
import { z } from 'zod';

/**
 * Advanced utility tools for Algorand operations
 * Based on the remote MCP server functionality
 */

export const UtilityTools = [
    // Address validation
    {
        name: 'validate_address',
        description: 'Check if an Algorand address is valid',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Address in standard Algorand format (58 characters)'
                }
            },
            required: ['address']
        }
    },
    
    // Encode address from public key
    {
        name: 'encode_address',
        description: 'Encode a public key to an Algorand address',
        inputSchema: {
            type: 'object' as const,
            properties: {
                publicKey: {
                    type: 'string',
                    description: 'Public key in hexadecimal format to encode into an address'
                }
            },
            required: ['publicKey']
        }
    },
    
    // Decode address to public key
    {
        name: 'decode_address',
        description: 'Decode an Algorand address to a public key',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Address in standard Algorand format (58 characters) to decode'
                }
            },
            required: ['address']
        }
    },
    
    // Get application address
    {
        name: 'get_application_address',
        description: 'Get the address for a given application ID',
        inputSchema: {
            type: 'object' as const,
            properties: {
                appId: {
                    type: 'number',
                    description: 'Application ID to get the address for'
                }
            },
            required: ['appId']
        }
    },
    
    // Verify signature
    {
        name: 'verify_bytes',
        description: 'Verify a signature against bytes with an Algorand address',
        inputSchema: {
            type: 'object' as const,
            properties: {
                bytes: {
                    type: 'string',
                    description: 'Bytes in hexadecimal format to verify'
                },
                signature: {
                    type: 'string',
                    description: 'Base64-encoded signature to verify'
                },
                address: {
                    type: 'string',
                    description: 'Algorand account address'
                }
            },
            required: ['bytes', 'signature', 'address']
        }
    },
    
    // Sign bytes
    {
        name: 'sign_bytes',
        description: 'Sign bytes with a secret key',
        inputSchema: {
            type: 'object' as const,
            properties: {
                bytes: {
                    type: 'string',
                    description: 'Bytes in hexadecimal format to sign'
                },
                sk: {
                    type: 'string',
                    description: 'Secret key in hexadecimal format to sign the bytes with'
                }
            },
            required: ['bytes', 'sk']
        }
    },
    
    // Compile TEAL
    {
        name: 'compile_teal',
        description: 'Compile TEAL source code to bytecode',
        inputSchema: {
            type: 'object' as const,
            properties: {
                tealCode: {
                    type: 'string',
                    description: 'TEAL source code to compile'
                }
            },
            required: ['tealCode']
        }
    },
    
    // Disassemble TEAL
    {
        name: 'disassemble_teal',
        description: 'Disassemble TEAL bytecode into source code',
        inputSchema: {
            type: 'object' as const,
            properties: {
                bytecode: {
                    type: 'string',
                    description: 'TEAL bytecode in base64 format to disassemble'
                }
            },
            required: ['bytecode']
        }
    },
    
    // Encode object to msgpack
    {
        name: 'encode_obj',
        description: 'Encode an object to msgpack format',
        inputSchema: {
            type: 'object' as const,
            properties: {
                obj: {
                    type: 'object',
                    description: 'Object to encode to msgpack'
                }
            },
            required: ['obj']
        }
    },
    
    // Decode msgpack to object
    {
        name: 'decode_obj',
        description: 'Decode msgpack bytes to an object',
        inputSchema: {
            type: 'object' as const,
            properties: {
                bytes: {
                    type: 'string',
                    description: 'Base64-encoded msgpack bytes to decode'
                }
            },
            required: ['bytes']
        }
    }
];

// Schema definitions for validation
export const ValidateAddressSchema = z.object({
    address: z.string()
});

export const EncodeAddressSchema = z.object({
    publicKey: z.string()
});

export const DecodeAddressSchema = z.object({
    address: z.string()
});

export const GetApplicationAddressSchema = z.object({
    appId: z.number().int().positive()
});

export const VerifyBytesSchema = z.object({
    bytes: z.string(),
    signature: z.string(),
    address: z.string()
});

export const SignBytesSchema = z.object({
    bytes: z.string(),
    sk: z.string()
});

export const CompileTealSchema = z.object({
    tealCode: z.string()
});

export const DisassembleTealSchema = z.object({
    bytecode: z.string()
});

export const EncodeObjSchema = z.object({
    obj: z.any()
});

export const DecodeObjSchema = z.object({
    bytes: z.string()
});

// Utility functions
export class UtilityService {
    private algodClient: algosdk.Algodv2;

    constructor(algodClient: algosdk.Algodv2) {
        this.algodClient = algodClient;
    }

    async validateAddress(address: string): Promise<{ isValid: boolean }> {
        try {
            const isValid = algosdk.isValidAddress(address);
            return { isValid };
        } catch (error: any) {
            throw new Error(`Error validating address: ${error.message || 'Unknown error'}`);
        }
    }

    async encodeAddress(publicKey: string): Promise<{ address: string }> {
        try {
            const publicKeyBytes = new Uint8Array(Buffer.from(publicKey, 'hex'));
            const address = algosdk.encodeAddress(publicKeyBytes);
            return { address };
        } catch (error: any) {
            throw new Error(`Error encoding address: ${error.message || 'Unknown error'}`);
        }
    }

    async decodeAddress(address: string): Promise<{ publicKey: string }> {
        try {
            const publicKey = algosdk.decodeAddress(address).publicKey;
            return { 
                publicKey: Buffer.from(publicKey).toString('hex') 
            };
        } catch (error: any) {
            throw new Error(`Error decoding address: ${error.message || 'Unknown error'}`);
        }
    }

    async getApplicationAddress(appId: number): Promise<{ address: string }> {
        try {
            const address = algosdk.getApplicationAddress(appId);
            return { address: address.toString() };
        } catch (error: any) {
            throw new Error(`Error getting application address: ${error.message || 'Unknown error'}`);
        }
    }

    async verifyBytes(bytes: string, signature: string, address: string): Promise<{ verified: boolean }> {
        try {
            const bytesBuffer = new Uint8Array(Buffer.from(bytes, 'hex'));
            const signatureBuffer = new Uint8Array(Buffer.from(signature, 'base64'));
            const publicKey = algosdk.decodeAddress(address).publicKey;
            
            // Add "MX" prefix as in the original code
            const mxBytes = new TextEncoder().encode("MX");
            const fullBytes = new Uint8Array(mxBytes.length + bytesBuffer.length);
            fullBytes.set(mxBytes);
            fullBytes.set(bytesBuffer, mxBytes.length);
            
            // Use nacl for verification
            const nacl = await import('tweetnacl');
            const verified = nacl.sign.detached.verify(fullBytes, signatureBuffer, publicKey);
            
            return { verified };
        } catch (error: any) {
            throw new Error(`Error verifying bytes: ${error.message || 'Unknown error'}`);
        }
    }

    async signBytes(bytes: string, sk: string): Promise<{ signature: string }> {
        try {
            const bytesBuffer = Buffer.from(bytes, 'hex');
            const skBuffer = Buffer.from(sk, 'hex');
            const signature = algosdk.signBytes(bytesBuffer, skBuffer);
            return {
                signature: Buffer.from(signature).toString('base64')
            };
        } catch (error: any) {
            throw new Error(`Error signing bytes: ${error.message || 'Unknown error'}`);
        }
    }

    async compileTeal(tealCode: string): Promise<{ result: string, hash: string }> {
        try {
            const result = await this.algodClient.compile(tealCode).do();
            return {
                result: result.result,
                hash: result.hash
            };
        } catch (error: any) {
            throw new Error(`Error compiling TEAL: ${error.message || 'Unknown error'}`);
        }
    }

    async disassembleTeal(bytecode: string): Promise<{ source: string }> {
        try {
            // Note: disassemble method is not available in current algosdk version
            // This is a placeholder implementation
            return { source: "TEAL disassembly not available in current SDK version" };
        } catch (error: any) {
            throw new Error(`Error disassembling TEAL: ${error.message || 'Unknown error'}`);
        }
    }

    async encodeObj(obj: any): Promise<{ encoded: string }> {
        try {
            const encoded = algosdk.encodeObj(obj);
            return {
                encoded: Buffer.from(encoded).toString('base64')
            };
        } catch (error: any) {
            throw new Error(`Error encoding object: ${error.message || 'Unknown error'}`);
        }
    }

    async decodeObj(bytes: string): Promise<any> {
        try {
            const bytesBuffer = Buffer.from(bytes, 'base64');
            const decoded = algosdk.decodeObj(bytesBuffer);
            return decoded;
        } catch (error: any) {
            throw new Error(`Error decoding object: ${error.message || 'Unknown error'}`);
        }
    }
}
