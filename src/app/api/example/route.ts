import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createMetadata, Metadata, ValidatedMetadata, ExecutionResponse } from '@sherrylinks/sdk';
import { serialize } from 'wagmi';
import { encodeFunctionData, TransactionSerializable } from 'viem';
import { abi } from '@/blockchain/abi';

const CONTRACT_ADDRESS = '0x29792b598A30a6649a75c299f9FC67bfe6c033f2';

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const serverUrl = `${protocol}://${host}`;

    const metadata: Metadata = {
      url: 'https://sherry.social',
      icon: 'https://avatars.githubusercontent.com/u/117962315',
      title: 'Mensaje con Timestamp',
      baseUrl: serverUrl,
      description:
        'Almacena un mensaje con un timestamp optimizado calculado por nuestro algoritmo',
      actions: [
        {
          type: 'dynamic',
          label: 'Almacenar Mensaje',
          description:
            'Almacena tu mensaje con un timestamp personalizado calculado para almacenamiento óptimo',
          chains: { source: 'fuji' },
          path: `/api/mi-app`,
          params: [
            {
              name: 'mensaje',
              label: '¡Mensaje de Prueba!',
              type: 'text',
              required: true,
              description: 'Ingresa el mensaje que quieres almacenar en la blockchain',
            },
          ],
        },
      ],
    };

    const validated: ValidatedMetadata = createMetadata(metadata);

    return NextResponse.json(validated, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear metadata' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const message = searchParams.get('mensaje');

    if (!message) {
      return NextResponse.json(
        { error: 'Message parameter is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }

    // Lógica de negocio personalizada
    const optimizedTimestamp = calculateOptimizedTimestamp(message);

    // Interacción con contrato inteligente
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'storeMessage',
      args: [message, BigInt(optimizedTimestamp)],
    });

    const tx: TransactionSerializable = {
      to: CONTRACT_ADDRESS,
      data: data,
      chainId: avalancheFuji.id,
      type: 'legacy',
    };

    const serialized = serialize(tx);

    const resp: ExecutionResponse = {
      serializedTransaction: serialized,
      chainId: avalancheFuji.name,
    };

    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error en petición POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
    },
  });
}

// Algoritmo personalizado - aquí es donde agregas tu valor único
function calculateOptimizedTimestamp(message: string): number {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  let offset = 0;

  for (let i = 0; i < message.length; i++) {
    offset += message.charCodeAt(i) * (i + 1);
  }

  const maxOffset = 3600;
  offset = offset % maxOffset;

  return currentTimestamp + offset;
}