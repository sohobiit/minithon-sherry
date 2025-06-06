import { NextRequest, NextResponse } from 'next/server';
import { createMetadata, type Metadata, type ValidatedMetadata } from '@sherrylinks/sdk';


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
              label: '¡Tu Mensaje Hermano!',
              type: 'text',
              required: true,
              description: 'Ingresa el mensaje que quieres almacenar en la blockchain',
            },
          ],
        },
      ],
    };

    // Validar metadata usando el SDK
    const validated: ValidatedMetadata = createMetadata(metadata);

    // Retornar con headers CORS para acceso cross-origin
    return NextResponse.json(validated, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  } catch (error) {
    console.error('Error creando metadata:', error);
    return NextResponse.json({ error: 'Error al crear metadata' }, { status: 500 });
  }

}
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204, // Sin Contenido
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
    },
  });
}