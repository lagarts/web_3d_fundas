# Valentin store · tienda inmersiva 3D

Next.js 15 + React + TypeScript + Tailwind + GSAP. Etapa 1: la tienda idéntica a la demo (`reference/referencia-exacta.html`).

## Correr en tu computadora
Requiere Node.js 20+.
```bash
npm install
cp .env.local.example .env.local
npm run dev        # http://localhost:3000
```

## Subir a GitHub (repo lagarts/web_3d_fundas)
```bash
git add .
git commit -m "Etapa 1: tienda inmersiva"
git push
```

## Publicar en Vercel
1. Vercel → Add New → Project → importar `lagarts/web_3d_fundas`.
2. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (valores en `.env.local.example`).
3. Deploy.

## Estructura
- `components/StoreShell.tsx`: markup de la tienda.
- `lib/storeEngine.js`: comportamiento (pasarela, iPhone por capas, bolsa, carrito, panel). Configuración central: objeto `CFG` al inicio.
- `app/globals.css`: estilos (idénticos a la demo).
- `public/assets/`: imágenes (iPhone en 5 colores, fundas, bolsa).
- `supabase/migrations/`: esquema ya aplicado en Supabase.
- `lib/supabase/client.ts`: cliente listo para la Etapa 2.

## Etapas
1. ✅ Tienda idéntica a la demo. WhatsApp: 5493415418559.
2. ✅ Catálogo, login y panel conectados a Supabase (fotos en Storage). Registrate desde "Ingresar" y creá tu tienda con el nombre "Valentin store" (slug valentin-store).
3. Pedidos en base de datos + Mercado Pago (Checkout Pro) con ruta de servidor y webhook.
