import { z } from 'zod';

/**
 * ARC-26 URI generation tools for Algorand
 * Handles Algorand URI generation following ARC-26 specification
 * https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0026.md
 */

export const Arc26Tools = [
    {
        name: 'generate_algorand_uri',
        description: 'Generate a URI following the Algorand ARC-26 specification to send account address or request payment or asset transfer',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Algorand address (58 characters)'
                },
                label: {
                    type: 'string',
                    description: 'Optional label for the address'
                },
                amount: {
                    type: 'number',
                    description: 'Amount in microAlgos (for payment) or asset units (for asset transfer)'
                },
                assetId: {
                    type: 'number',
                    description: 'Asset ID (for asset transfer)'
                },
                note: {
                    type: 'string',
                    description: 'Optional note'
                }
            },
            required: ['address']
        }
    },
    {
        name: 'generate_algorand_qrcode',
        description: 'Generate a URI and QRCode following the Algorand ARC-26 specification',
        inputSchema: {
            type: 'object' as const,
            properties: {
                address: {
                    type: 'string',
                    description: 'Algorand address (58 characters)'
                },
                label: {
                    type: 'string',
                    description: 'Optional label for the address'
                },
                amount: {
                    type: 'number',
                    description: 'Amount in microAlgos (for payment) or asset units (for asset transfer)'
                },
                assetId: {
                    type: 'number',
                    description: 'Asset ID (for asset transfer)'
                },
                note: {
                    type: 'string',
                    description: 'Optional note'
                }
            },
            required: ['address']
        }
    }
];

// Schema definitions
export const GenerateAlgorandUriSchema = z.object({
    address: z.string(),
    label: z.string().optional(),
    amount: z.number().optional(),
    assetId: z.number().optional(),
    note: z.string().optional()
});

export const GenerateAlgorandQrCodeSchema = z.object({
    address: z.string(),
    label: z.string().optional(),
    amount: z.number().optional(),
    assetId: z.number().optional(),
    note: z.string().optional()
});

// ARC-26 Service class
export class Arc26Service {
    /**
     * Generate an Algorand URI following ARC-26 specification
     */
    generateAlgorandUri(
        address: string,
        label?: string,
        amount?: number,
        assetId?: number,
        note?: string
    ): { uri: string; uriType: string } {
        // Validate address format (58 characters)
        if (!/^[A-Z2-7]{58}$/.test(address)) {
            throw new Error('Invalid Algorand address format');
        }

        // Build the base URI
        let uri = `algorand://${address}`;

        // Build query parameters
        const queryParams: string[] = [];

        // Add optional label
        if (label) {
            queryParams.push(`label=${encodeURIComponent(label)}`);
        }

        // Add optional amount
        if (amount !== undefined) {
            queryParams.push(`amount=${amount}`);
        }

        // Add optional assetId
        if (assetId !== undefined) {
            queryParams.push(`asset=${assetId}`);
        }

        // Add optional note
        if (note) {
            queryParams.push(`note=${encodeURIComponent(note)}`);
        }

        // Append query string if we have parameters
        if (queryParams.length > 0) {
            uri += '?' + queryParams.join('&');
        }

        // Determine URI type
        let uriType = 'Account URI';
        if (amount !== undefined && assetId !== undefined) {
            uriType = 'Asset Transfer URI';
        } else if (amount !== undefined) {
            uriType = 'Payment URI';
        }

        return { uri, uriType };
    }

    /**
     * Generate an Algorand URI and QR code
     */
    async generateAlgorandQrCode(
        address: string,
        label?: string,
        amount?: number,
        assetId?: number,
        note?: string
    ): Promise<{ uri: string; uriType: string; qrCode: string; html: string }> {
        // Generate the URI
        const { uri, uriType } = this.generateAlgorandUri(address, label, amount, assetId, note);

        try {
            // Generate QR code using qrcode library
            const QRCode = await import('qrcode');
            const qrCode = await QRCode.toDataURL(uri, {
                type: 'image/png',
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Generate HTML page for display
            const html = this.buildHTMLPage({
                provider: 'Algorand MCP Server',
                uri,
                uriType,
                uuid: this.generateUUID(),
                qrPng: qrCode,
                from: address,
                label: label || 'Algorand QRCode',
                amount: amount || 0
            });

            return {
                uri,
                uriType,
                qrCode,
                html
            };
        } catch (error: any) {
            throw new Error(`Error generating QR code: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Build HTML page for QR code display
     */
    private buildHTMLPage({
        provider,
        uri,
        uriType,
        uuid,
        qrPng,
        from,
        label,
        amount
    }: {
        provider: string;
        uri: string;
        uriType: string;
        uuid: string;
        qrPng: string;
        from: string;
        label?: string;
        amount?: number;
    }): string {
        const prettyLabel = label || "Algorand QRCode";
        const prettyAmount = amount && uriType !== 'Asset Transfer URI' 
            ? `${amount / 1e6} Algo` 
            : amount && uriType === 'Asset Transfer URI' 
                ? amount.toString() 
                : "No payment or transfer amount included!";
        const title = `${prettyLabel} from ${from}`;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .logo {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      background: #667eea;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    h1 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .subtitle {
      color: #666;
      margin: 0 0 30px 0;
      font-size: 16px;
    }
    .qr-container {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 15px;
    }
    .qr-code {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    .uri-info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: left;
    }
    .uri-label {
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 5px;
    }
    .uri-value {
      font-family: monospace;
      font-size: 14px;
      color: #333;
      word-break: break-all;
    }
    .amount-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .amount-label {
      font-weight: bold;
      color: #2e7d32;
      margin-bottom: 5px;
    }
    .amount-value {
      font-size: 18px;
      color: #333;
    }
    .footer {
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
    .copy-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
      transition: background 0.3s;
    }
    .copy-btn:hover {
      background: #5a6fd8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">A</div>
    <h1>${prettyLabel}</h1>
    <p class="subtitle">Generated by ${provider}</p>
    
    <div class="qr-container">
      <img src="${qrPng}" alt="Algorand QR Code" class="qr-code" />
    </div>
    
    <div class="uri-info">
      <div class="uri-label">URI Type:</div>
      <div class="uri-value">${uriType}</div>
    </div>
    
    <div class="uri-info">
      <div class="uri-label">Algorand URI:</div>
      <div class="uri-value">${uri}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${uri}')">Copy URI</button>
    </div>
    
    ${amount ? `
    <div class="amount-info">
      <div class="amount-label">Amount:</div>
      <div class="amount-value">${prettyAmount}</div>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>Scan with your Algorand wallet to ${uriType.toLowerCase()}</p>
      <p>UUID: ${uuid}</p>
    </div>
  </div>
  
  <script>
    // Auto-copy URI to clipboard on page load
    window.addEventListener('load', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('${uri}').then(() => {
          console.log('URI copied to clipboard');
        }).catch(err => {
          console.log('Could not copy URI:', err);
        });
      }
    });
  </script>
</body>
</html>`.trim();
    }

    /**
     * Generate a UUID
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
