"use client";
import { useEffect, useRef } from "react";
import { initStore } from "@/lib/storeEngine";

/**
 * Estructura (markup) de la tienda. El comportamiento (pasarela, iPhone por capas,
 * bolsa, carrito, panel) vive en lib/storeEngine.js y se inicia una sola vez.
 * Etapa 2: el motor lee y escribe en Supabase (catálogo, cuentas, panel y fotos).
 */
export default function StoreShell() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    initStore();
  }, []);

  return (
    <>
      <header>
       <div className="brand" id="brand"></div>
       <div className="hr">
        <label className="sel"><span>Categoría</span><select id="catSel" aria-label="Categoría"></select></label>
        <label className="sel"><span>Mi teléfono</span><select id="model" aria-label="Modelo de iPhone"></select></label>
        <button className="mini" id="authBtn">Ingresar</button>
       </div>
      </header>

      <section id="runway" aria-label="Pasarela de fundas"><div id="track"></div></section>

      <main id="floor">
       <button id="bag" aria-label="Abrir bolsa de compras">
        <span id="badge">0</span><div className="bagimg"></div><span id="logo" hidden></span>
       </button>
       <div id="phoneWrap">
        <div id="phone"><div className="body"></div><div className="case" id="pcase"></div>
         <div id="cam"></div></div>
        <div id="pname"></div><div id="sw" role="radiogroup" aria-label="Color del iPhone"></div>
       </div>
      </main>

      <aside id="card" aria-live="polite">
       <div>
        <h2 id="cName">Elegí una funda</h2>
        <div className="meta" id="cMeta">Tocá una funda de la pasarela para probarla en el iPhone. Arrastrá para recorrer.</div>
       </div>
       <div className="price" id="cPrice"></div>
       <div id="status"></div>
       <button className="btn" id="addBtn" disabled>Agregar a la bolsa</button>
      </aside>

      <div id="scrim"></div>
      <aside id="drawer" aria-label="Tu bolsa">
       <div className="dh"><h2 id="dTitle">Tu bolsa</h2><button className="x" id="closeD" aria-label="Cerrar">×</button></div>
       <div className="view on" id="vCart">
        <div id="list"></div>
        <div style={{marginTop:"auto"}}>
         <div className="tot"><span>Total</span><span id="total"></span></div>
         <button className="btn" id="goCheckout">Finalizar compra</button>
         <button className="btn ghost" id="keep">Seguir comprando</button>
        </div>
       </div>
       <div className="view" id="vCheck">
        <label className="f">Nombre y apellido<input id="fn" autoComplete="name" /></label>
        <label className="f">Teléfono<input id="ft" type="tel" autoComplete="tel" /></label>
        <label className="f">Dirección de entrega<input id="fa" autoComplete="street-address" /></label>
        <label className="f">Método de envío<select id="fs"><option value="0">Retiro en local · gratis</option><option value="4500">Envío a domicilio · $4.500</option></select></label>
        <div className="tot"><span>Total a pagar</span><span id="ctotal"></span></div>
        <button className="btn" id="wa">Pedir por WhatsApp</button>
        <button className="btn ghost" disabled>Pagar con Mercado Pago · próximamente</button>
        <button className="btn ghost" id="back">Volver a la bolsa</button>
        <p className="note">Demo: no se realizan cobros. La integración con Mercado Pago queda preparada para la etapa siguiente.</p>
       </div>
      </aside>
      <div id="authM" className="modal" hidden><div className="box">
       <div className="dh"><h2 id="amT">Ingresar</h2><button className="x" id="amX" aria-label="Cerrar">×</button></div>
       <label className="f">Email<input id="ae" type="email" autoComplete="email" /></label>
       <label className="f">Contraseña<input id="ap" type="password" autoComplete="current-password" /></label>
       <button className="btn" id="aGo">Ingresar</button>
       <button className="btn ghost" id="aSw"></button>
       <p className="note">Acceso para dueños de tienda.</p>
      </div></div>
      <div id="admin" className="modal" hidden><div className="box wide">
       <div className="dh"><h2>Panel de la tienda</h2><button className="x" id="aX" aria-label="Cerrar">×</button></div>
       <p className="note" style={{margin:"0 0 10px"}}>Sesión: <span id="aMail"></span> · <button className="del" id="aOut" style={{margin:0}}>Salir</button></p>
       <div className="tabs"><button data-tab="prod">Productos</button><button data-tab="cat">Categorías</button><button data-tab="brand">Marca</button></div>
       <div id="aBody"></div>
       <p className="note">Los cambios se guardan en tu tienda y los ven todos los clientes.</p>
      </div></div>
      <div id="toast"></div>
    </>
  );
}
